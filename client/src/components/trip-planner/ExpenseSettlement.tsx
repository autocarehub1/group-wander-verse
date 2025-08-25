import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ExpenseSplit {
  id: string;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  user_id: string;
  expense_id: string;
  trip_expenses: {
    title: string;
    description: string | null;
    expense_date: string | null;
  };
}

interface ExpenseSettlementProps {
  tripId: string;
}

export const ExpenseSettlement = ({ tripId }: ExpenseSettlementProps) => {
  const [unpaidSplits, setUnpaidSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUnpaidSplits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`);
      if (response.ok) {
        const expenses = await response.json();
        const allSplits: ExpenseSplit[] = [];
        
        // Get all splits for expenses in this trip
        for (const expense of expenses) {
          const splitsResponse = await fetch(`/api/expenses/${expense.id}/splits`);
          if (splitsResponse.ok) {
            const splits = await splitsResponse.json();
            const unpaidSplits = splits.filter((split: ExpenseSplit) => !split.is_paid);
            allSplits.push(...unpaidSplits.map((split: ExpenseSplit) => ({
              ...split,
              trip_expenses: expense
            })));
          }
        }
        setUnpaidSplits(allSplits);
      }
    } catch (error) {
      console.error('Error fetching unpaid splits:', error);
      toast({
        title: "Error loading balances",
        description: "Unable to load payment balances.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidSplits();
  }, [tripId]);

  const handlePayment = async (split: ExpenseSplit) => {
    setProcessingPayment(split.id);
    try {
      // Create payment session with Stripe
      const response = await fetch('/api/create-expense-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseId: split.expense_id,
          amount: parseFloat(split.amount.toString()),
          description: `Payment for ${split.trip_expenses.title}`,
          userEmail: user?.email
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading balances...</div>;
  }

  const totalOwed = unpaidSplits.reduce((sum, split) => sum + parseFloat(split.amount.toString()), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Payment Settlement</h3>
          <p className="text-sm text-muted-foreground">Settle your outstanding expense balances</p>
        </div>
        <Button
          onClick={fetchUnpaidSplits}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {totalOwed > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Outstanding Balance: ${totalOwed.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {unpaidSplits.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">All expenses are settled!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {unpaidSplits.map((split) => (
            <Card key={split.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{split.trip_expenses.title}</h4>
                    {split.trip_expenses.description && (
                      <p className="text-sm text-muted-foreground">
                        {split.trip_expenses.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Unpaid</Badge>
                      {split.trip_expenses.expense_date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(split.trip_expenses.expense_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-lg">${parseFloat(split.amount.toString()).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Your share</p>
                    </div>
                    <Button
                      onClick={() => handlePayment(split)}
                      disabled={processingPayment === split.id}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      {processingPayment === split.id ? 'Processing...' : 'Pay Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};