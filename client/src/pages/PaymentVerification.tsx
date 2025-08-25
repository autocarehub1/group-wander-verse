import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CheckCircle, XCircle, Eye, DollarSign, Calendar, Upload, User, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import PaymentProofUploader from "@/components/expenses/PaymentProofUploader";
import { useQueryClient } from "@tanstack/react-query";

interface PendingPaymentProof {
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
  payment_reference: string;
  upload_notes: string;
  created_at: string;
  trip_id: string;
  trip_title: string;
}

const PaymentVerification = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingProofs, setPendingProofs] = useState<PendingPaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingProofs, setProcessingProofs] = useState<Set<string>>(new Set());
  const [verificationNotes, setVerificationNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchPendingProofs = async () => {
      if (!user) return;

      try {
        const endpoint = tripId 
          ? `/api/trips/${tripId}/payment-proofs/pending`
          : `/api/payment-proofs/pending`;
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setPendingProofs(data);
        } else {
          throw new Error('Failed to fetch pending proofs');
        }
      } catch (error) {
        console.error('Error fetching pending proofs:', error);
        toast({
          title: "Error",
          description: "Unable to fetch pending payment verifications.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProofs();
  }, [user, tripId, toast]);

  const handleVerifyPayment = async (splitId: string, status: 'approved' | 'rejected') => {
    setProcessingProofs(prev => new Set(prev).add(splitId));

    try {
      const response = await fetch(`/api/expense-splits/${splitId}/payment-proofs/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          verified_by: user?.id,
          notes: verificationNotes[splitId] || ""
        }),
      });

      if (response.ok) {
        toast({
          title: "Payment Verified",
          description: `Payment proof has been ${status}.`,
          variant: status === 'approved' ? "default" : "destructive"
        });
        
        // Remove from pending list
        setPendingProofs(prev => prev.filter(proof => proof.split_id !== splitId));
        
        // Clear notes for this split
        setVerificationNotes(prev => {
          const updated = { ...prev };
          delete updated[splitId];
          return updated;
        });
      } else {
        throw new Error('Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Unable to verify payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingProofs(prev => {
        const newSet = new Set(prev);
        newSet.delete(splitId);
        return newSet;
      });
    }
  };

  const updateNotes = (splitId: string, notes: string) => {
    setVerificationNotes(prev => ({ ...prev, [splitId]: notes }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading payment verifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={tripId ? `/trips/${tripId}` : "/trips"}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Payment Verification Center</h1>
            <p className="text-muted-foreground">
              Review and verify payment screenshots from group members
            </p>
          </div>
        </div>

        {pendingProofs.length === 0 ? (
          <Card className="travel-card text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No pending payment proofs to review at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              {pendingProofs.length} payment proof{pendingProofs.length !== 1 ? 's' : ''} awaiting verification
            </div>

            {pendingProofs.map((proof) => (
              <Card key={proof.split_id} className="travel-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{proof.expense_title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="h-4 w-4" />
                        {proof.user_name} ({proof.user_email})
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(proof.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ${parseFloat(proof.amount).toFixed(2)}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {proof.payment_method}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Payment Details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Payment Method
                      </Label>
                      <p className="font-medium">{proof.payment_method}</p>
                    </div>
                    {proof.payment_reference && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Reference/Transaction ID
                        </Label>
                        <p className="font-medium">{proof.payment_reference}</p>
                      </div>
                    )}
                  </div>

                  {proof.upload_notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        User Notes
                      </Label>
                      <p className="text-sm bg-muted p-3 rounded-md">{proof.upload_notes}</p>
                    </div>
                  )}

                  {/* Payment Screenshot */}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Payment Screenshot
                    </Label>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Screenshot uploaded by {proof.user_name}
                      </p>
                      {proof.payment_proof_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Eye className="h-4 w-4 mr-2" />
                              View Screenshot
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Payment Screenshot - {proof.user_name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                              {proof.payment_proof_url.includes('storage.example.com') ? (
                                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                                  <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                                  <p className="text-muted-foreground mb-4">
                                    This payment has an old screenshot URL that needs to be updated.
                                  </p>
                                  <PaymentProofUploader
                                    splitId={proof.split_id}
                                    expenseTitle={proof.expense_title}
                                    amount={proof.amount}
                                    isReplacement={true}
                                    existingPaymentMethod={proof.payment_method || ""}
                                    existingPaymentReference={proof.payment_reference || ""}
                                    onSuccess={() => {
                                      queryClient.invalidateQueries({ queryKey: ["/api/payment-proofs"] });
                                    }}
                                  />
                                </div>
                              ) : (
                                <img 
                                  src={proof.payment_proof_url.startsWith('/api/') 
                                    ? proof.payment_proof_url 
                                    : proof.payment_proof_url
                                  } 
                                  alt={`Payment screenshot from ${proof.user_name}`}
                                  className="max-w-full max-h-96 object-contain rounded-lg"
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', proof.payment_proof_url);
                                  }}
                                  onError={(e) => {
                                    console.error('Failed to load image:', proof.payment_proof_url);
                                    console.error('Image element:', e.target);
                                    const imgEl = e.target as HTMLImageElement;
                                    console.error('Error details:', imgEl.src, imgEl.naturalWidth, imgEl.naturalHeight);
                                    imgEl.style.display = 'none';
                                    const parent = imgEl.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="text-center p-8 border border-dashed border-gray-300 rounded-lg"><p class="text-muted-foreground mb-4">Unable to load screenshot. Checking URL: ' + proof.payment_proof_url + '</p><p class="text-xs text-gray-400">Try refreshing the page or updating the screenshot</p></div>';
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>

                  {/* Verification Notes */}
                  <div>
                    <Label htmlFor={`notes-${proof.split_id}`} className="text-sm font-medium">
                      Verification Notes (Optional)
                    </Label>
                    <Textarea
                      id={`notes-${proof.split_id}`}
                      placeholder="Add notes about this verification (optional)..."
                      value={verificationNotes[proof.split_id] || ""}
                      onChange={(e) => updateNotes(proof.split_id, e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleVerifyPayment(proof.split_id, 'approved')}
                      disabled={processingProofs.has(proof.split_id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingProofs.has(proof.split_id) ? "Processing..." : "Approve Payment"}
                    </Button>
                    
                    <Button
                      onClick={() => handleVerifyPayment(proof.split_id, 'rejected')}
                      disabled={processingProofs.has(proof.split_id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingProofs.has(proof.split_id) ? "Processing..." : "Reject Payment"}
                    </Button>
                  </div>

                  {/* Update Screenshot Option */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-muted-foreground mb-3">
                      Need to update the payment screenshot?
                    </div>
                    <PaymentProofUploader
                      splitId={proof.split_id}
                      expenseTitle={proof.expense_title}
                      amount={proof.amount}
                      isReplacement={true}
                      existingPaymentMethod={proof.payment_method || ""}
                      existingPaymentReference={proof.payment_reference || ""}
                      existingNotes={proof.upload_notes || ""}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/payment-proofs"] });
                        fetchPendingProofs();
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerification;