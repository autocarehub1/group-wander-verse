import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ExpenseCard } from '@/components/trip-planner/ExpenseCard';

interface UserExpenseSplit {
  id: string;
  expense_id: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string | null;
  payment_status?: string | null;
  expense_title: string;
  expense_category?: string | null;
  trip_id: string;
}

const ExpenseTracking = () => {
  const [expenseSplits, setExpenseSplits] = useState<UserExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserExpenseSplits = async () => {
      if (!user) return;

      try {
        // Fetch all expense splits for the user via API
        const response = await fetch(`/api/users/${user.id}/expenses`);
        if (response.ok) {
          const data = await response.json();
          setExpenseSplits(data || []);
        } else {
          throw new Error('Failed to fetch expense splits');
        }
      } catch (error) {
        console.error('Error fetching expense splits:', error);
        setExpenseSplits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserExpenseSplits();
  }, [user]);

  const totalAmount = expenseSplits.reduce((sum, split) => sum + parseFloat(split.amount.toString()), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">Expense Tracking</h1>
            <p className="text-muted-foreground">Track all your trip expenses across all adventures</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Expenses: ${totalAmount.toFixed(2)}
          </CardTitle>
        </CardHeader>
      </Card>

      {expenseSplits.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You don't owe any money yet.</p>
            <Link to="/trips" className="mt-4 inline-block">
              <Button>Go to Trips to Add Expenses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenseSplits.map((split) => (
            <Card key={split.id} className="travel-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{split.expense_title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={split.expense_category ? "secondary" : "outline"} className="text-xs">
                        {split.expense_category || 'Uncategorized'}
                      </Badge>
                      <Badge variant={split.is_paid ? "default" : "destructive"} className="text-xs">
                        {split.is_paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-teal">${parseFloat(split.amount.toString()).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Your share</div>
                  </div>
                </div>
                {split.paid_at && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Paid on {new Date(split.paid_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;