import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Simplified fetch function for API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
import { CheckCircle, XCircle, Eye, DollarSign, Calendar } from "lucide-react";

interface DebtItem {
  split_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  expense_id: string;
  expense_title: string;
  expense_category: string;
  amount: string;
  payment_status: string;
  payment_method: string;
  payment_proof_url: string;
  created_at: string;
}

interface PaymentVerificationModalProps {
  debt: DebtItem;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function PaymentVerificationModal({ debt, isOpen, onClose, onVerified }: PaymentVerificationModalProps) {
  const [notes, setNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      // In a real app, this would get the verifier ID from auth context
      return await apiRequest(`/api/payment-proofs/${debt.split_id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          notes,
          verified_by: "current-user-id", // This would come from auth context
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Verified",
        description: "The payment proof has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      onVerified();
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

  const handleVerify = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !notes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the payment proof",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPaymentMutation.mutateAsync({ status, notes });
    } finally {
      setIsVerifying(false);
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: "Cash",
      venmo: "Venmo",
      paypal: "PayPal",
      zelle: "Zelle",
      bank_transfer: "Bank Transfer",
      check: "Check",
      other: "Other",
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Verify Payment Proof</DialogTitle>
          <DialogDescription>
            Review the payment proof submitted by {debt.user_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Payment Details */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{debt.expense_title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {debt.expense_category}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${debt.amount}</p>
                <Badge className="mt-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {getPaymentMethodDisplay(debt.payment_method)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              Submitted on {new Date(debt.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Payment Proof Image */}
          <div className="space-y-2">
            <Label>Payment Proof</Label>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              {debt.payment_proof_url ? (
                <div className="space-y-3">
                  <div className="aspect-video bg-white dark:bg-gray-700 rounded-md flex items-center justify-center">
                    <img
                      src={debt.payment_proof_url}
                      alt="Payment proof"
                      className="max-h-full max-w-full object-contain rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center">
                      <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Preview not available</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={debt.payment_proof_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Full Size
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No payment proof uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Notes */}
          <div className="space-y-2">
            <Label htmlFor="verification-notes">Verification Notes</Label>
            <Textarea
              id="verification-notes"
              placeholder="Add notes about the verification (required for rejection)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleVerify('approved')}
              disabled={isVerifying}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Payment
            </Button>
            <Button
              onClick={() => handleVerify('rejected')}
              disabled={isVerifying}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}