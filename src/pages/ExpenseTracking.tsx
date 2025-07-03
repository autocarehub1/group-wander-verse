import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ExpenseCard } from '@/components/trip-planner/ExpenseCard';

interface TripExpense {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  category?: string | null;
  expense_date?: string | null;
  paid_by?: string | null;
  currency?: string | null;
  is_shared?: boolean | null;
  receipt_url?: string | null;
  trip_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  trips: {
    title: string;
    destination: string;
  };
}

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllExpenses = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('trip_expenses')
          .select(`
            *,
            trips!inner(title, destination)
          `)
          .order('expense_date', { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllExpenses();
  }, [user]);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No expenses recorded yet.</p>
            <Link to="/trips" className="mt-4 inline-block">
              <Button>Go to Trips to Add Expenses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{expense.trips.title} - {expense.trips.destination}</span>
              </div>
              <ExpenseCard expense={expense} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;