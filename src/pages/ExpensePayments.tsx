import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Check, AlertCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
    trips: {
      title: string;
      destination: string;
    };
  };
}

const ExpensePayments = () => {
  const [unpaidSplits, setUnpaidSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUnpaidSplits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expense_splits')
        .select(`
          id,
          amount,
          is_paid,
          paid_at,
          user_id,
          expense_id,
          trip_expenses!inner(
            title,
            description,
            expense_date,
            trips!inner(title, destination)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_paid', false);

      if (error) throw error;
      setUnpaidSplits(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading balances",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidSplits();
  }, [user]);

  const handlePayment = async (split: ExpenseSplit) => {
    setProcessingPayment(split.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-expense-payment', {
        body: {
          expenseId: split.expense_id,
          amount: split.amount.toString(),
          description: `Settlement for: ${split.trip_expenses.title}`
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Payment error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalOwed = unpaidSplits.reduce((sum, split) => sum + split.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payment Settlement</h1>
            <p className="text-muted-foreground">Settle your outstanding expense balances</p>
          </div>
          <Button
            onClick={fetchUnpaidSplits}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {totalOwed > 0 && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
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
            <Link to="/trips" className="mt-4 inline-block">
              <Button>Go to Trips</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {unpaidSplits.map((split) => (
            <div key={split.id} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{split.trip_expenses.trips.title} - {split.trip_expenses.trips.destination}</span>
              </div>
              <Card>
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
                        <p className="font-semibold text-lg">${split.amount.toFixed(2)}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensePayments;