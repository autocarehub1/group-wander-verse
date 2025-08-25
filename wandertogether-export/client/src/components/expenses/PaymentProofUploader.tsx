import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Upload, Camera, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

interface PaymentProofUploaderProps {
  splitId: string;
  expenseTitle: string;
  amount: string;
  isReplacement?: boolean;
  existingPaymentMethod?: string;
  existingPaymentReference?: string;
  existingNotes?: string;
  onSuccess?: () => void;
}

export default function PaymentProofUploader({ 
  splitId, 
  expenseTitle, 
  amount, 
  isReplacement = false,
  existingPaymentMethod = "",
  existingPaymentReference = "",
  existingNotes = "",
  onSuccess 
}: PaymentProofUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>(existingPaymentMethod);
  const [paymentReference, setPaymentReference] = useState(existingPaymentReference);
  const [notes, setNotes] = useState(existingNotes);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();



  const submitPaymentProofMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isReplacement 
        ? `/api/expense-splits/${splitId}/payment-proof`
        : `/api/expense-splits/${splitId}/payment-proofs`;
      const method = isReplacement ? "PATCH" : "POST";
      
      return await apiRequest(endpoint, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: isReplacement ? "Payment Proof Updated" : "Payment Proof Submitted",
        description: isReplacement 
          ? "Your payment screenshot has been updated successfully."
          : "Your payment proof has been uploaded and is awaiting verification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsOpen(false);
      setSelectedFile(null);
      setPaymentMethod("");
      setPaymentReference("");
      setNotes("");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload payment proof",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - only allow image files (screenshots)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a screenshot image file (PNG, JPG, JPEG, WebP)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {

    
    if (!splitId) {
      toast({
        title: "Error",
        description: "Invalid expense split ID",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload payment proof",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select a file and payment method",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to server first
      const formData = new FormData();
      formData.append('payment_proof', selectedFile);
      
      const uploadResponse = await fetch('/api/uploads/payment-proof', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Then submit payment proof with the uploaded file URL
      const paymentData = isReplacement ? {
        file_url: uploadResult.fileUrl,
        file_name: uploadResult.originalName,
        file_size: uploadResult.size,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        notes: notes,
      } : {
        expense_split_id: splitId,
        file_url: uploadResult.fileUrl,
        file_name: uploadResult.originalName,
        file_size: uploadResult.size,
        uploaded_by: user?.id || "",
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        upload_notes: notes,
      };
      
      await submitPaymentProofMutation.mutateAsync(paymentData);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {isReplacement ? "Update Screenshot" : "Upload Payment Screenshot"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isReplacement ? "Update Payment Screenshot" : "Upload Payment Proof"}</DialogTitle>
          <DialogDescription>
            {isReplacement ? "Replace the screenshot" : "Submit proof of payment"} for: <strong>{expenseTitle}</strong> (${amount})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="payment-proof">Payment Screenshot/Receipt</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                id="payment-proof"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="payment-proof" className="cursor-pointer">
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to select an image
                </p>
                {selectedFile && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="zelle">Zelle</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Reference */}
          <div className="space-y-2">
            <Label htmlFor="payment-reference">Payment Reference (Optional)</Label>
            <input
              id="payment-reference"
              type="text"
              placeholder="Transaction ID, check number, etc."
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details about the payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedFile || !paymentMethod || isUploading}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Submit Payment Proof"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}