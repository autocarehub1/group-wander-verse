import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, CreditCard, Calendar, Upload, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import PaymentProofUploader from "@/components/expenses/PaymentProofUploader";
import DebtSummary from "@/components/expenses/DebtSummary";

interface UnpaidSplit {
  split_id: string;
  expense_id: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string | null;
  payment_status?: string | null;
  expense_title: string;
  expense_description?: string | null;
  expense_category?: string | null;
  trip_id: string;
  trip_title: string;
  trip_destination: string;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

const ExpensePayments = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [unpaidSplits, setUnpaidSplits] = useState<UnpaidSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // If tripId is provided, fetch trip data
        if (tripId) {
          const tripResponse = await fetch(`/api/trips/${tripId}`);
          if (tripResponse.ok) {
            setTrip(await tripResponse.json());
          }
        }

        // Fetch unpaid splits for this user
        const splitsResponse = await fetch(`/api/users/${user.id}/unpaid-splits`);
        if (splitsResponse.ok) {
          const allUnpaidSplits = await splitsResponse.json();
          
          // Filter for specific trip if tripId is provided, otherwise show all
          const filteredSplits = tripId 
            ? allUnpaidSplits.filter((split: UnpaidSplit) => split.trip_id === tripId)
            : allUnpaidSplits;
          
          setUnpaidSplits(filteredSplits);
        } else {
          throw new Error('Failed to fetch unpaid splits');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Unable to load payment information.",
          variant: "destructive"
        });
        setUnpaidSplits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId, user, toast]);

  const handlePayExpense = async (split: UnpaidSplit) => {
    if (!user) return;

    setProcessingPayments(prev => new Set(prev).add(split.split_id));

    try {
      const response = await fetch('/api/create-expense-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseId: split.expense_id,
          amount: parseFloat(split.amount.toString()),
          description: `Payment for ${split.expense_title}`,
          userEmail: user.email
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        const error = await response.json();
        toast({
          title: "Payment failed",
          description: error.error || "Unable to process payment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment failed",
        description: "Unable to process payment.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(split.split_id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please log in to view payments.</p>
            <Link to="/auth" className="mt-4 inline-block">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOwed = unpaidSplits.reduce((sum, split) => sum + parseFloat(split.amount.toString()), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          {tripId && trip ? (
            <Link to={`/trips/${tripId}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Trip
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold gradient-text">Payment Center</h1>
            <p className="text-muted-foreground">
              {tripId && trip 
                ? `Manage your share of group expenses for ${trip.destination}`
                : 'Manage all your pending payments across trips'
              }
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 travel-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal">${totalOwed.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Amount Owed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{unpaidSplits.length}</div>
                <div className="text-sm text-muted-foreground">Pending Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tripId && trip?.title ? trip.title : 'All Trips'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {tripId && trip?.destination ? trip.destination : 'Multiple destinations'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Management Tabs */}
        <Tabs defaultValue="my-payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              My Payments
            </TabsTrigger>
            <TabsTrigger value="debt-summary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Trip Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-payments">
            {unpaidSplits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">All caught up! No pending payments for this trip.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Pending Payments</h2>
                {unpaidSplits.map((split, index) => (
                  <Card key={`split-${split.split_id || index}`} className="travel-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{split.expense_title}</h3>
                          {split.expense_description && (
                            <p className="text-sm text-muted-foreground mt-1">{split.expense_description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {split.expense_category || 'Uncategorized'}
                            </Badge>
                            <Badge 
                              variant={split.payment_status === 'submitted' ? 'default' : 'destructive'} 
                              className="text-xs"
                            >
                              {split.payment_status === 'submitted' ? 'Pending Verification' : 'Unpaid'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-brand-teal">
                            ${parseFloat(split.amount.toString()).toFixed(2)}
                          </div>
                          <div className="flex gap-2 flex-col">
                            {split.payment_status !== 'submitted' && (
                              <>
                                <Button
                                  onClick={() => handlePayExpense(split)}
                                  disabled={processingPayments.has(split.split_id)}
                                  className="bg-brand-teal hover:bg-brand-teal/90"
                                >
                                  {processingPayments.has(split.split_id) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Pay Online
                                    </>
                                  )}
                                </Button>
                                <PaymentProofUploader
                                  splitId={split.split_id}
                                  expenseTitle={split.expense_title}
                                  amount={parseFloat(split.amount.toString()).toFixed(2)}
                                  onSuccess={() => {
                                    // Refresh the data
                                    window.location.reload();
                                  }}
                                />
                              </>
                            )}
                            {split.payment_status === 'submitted' && (
                              <div className="text-center">
                                <Upload className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                                <p className="text-xs text-blue-600">Proof Submitted</p>
                                <p className="text-xs text-muted-foreground">Awaiting verification</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="debt-summary">
            {tripId ? (
              <DebtSummary tripId={tripId} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Trip overview is only available when viewing payments for a specific trip.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Visit a trip's expense page to see the group payment overview.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpensePayments;