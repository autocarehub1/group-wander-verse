import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Users, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

interface ExpenseCardProps {
  expense: TripExpense;
}

interface ExpenseSplit {
  user_id: string;
  amount: number;
  is_paid: boolean;
  users: {
    full_name: string | null;
    email: string;
  } | null;
}

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSplits = async () => {
    if (!expense.is_shared) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expense_splits')
        .select(`
          user_id,
          amount,
          is_paid,
          users!inner(full_name, email)
        `)
        .eq('expense_id', expense.id);

      if (error) throw error;
      setSplits(data || []);
    } catch (error) {
      console.error('Error fetching splits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplits();
  }, [expense.id, expense.is_shared]);

  const totalPaid = splits.filter(s => s.is_paid).reduce((sum, s) => sum + s.amount, 0);
  const totalUnpaid = splits.filter(s => !s.is_paid).reduce((sum, s) => sum + s.amount, 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{expense.title}</h4>
              {expense.receipt_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(expense.receipt_url!, '_blank')}
                  className="h-6 w-6 p-0"
                >
                  <Receipt className="h-3 w-3" />
                </Button>
              )}
            </div>
            {expense.description && (
              <p className="text-sm text-muted-foreground">{expense.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{expense.category}</Badge>
              {expense.is_shared && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Split
                </Badge>
              )}
              {expense.expense_date && (
                <span className="text-xs text-muted-foreground">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {expense.is_shared && splits.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Settlement Status:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="h-3 w-3" />
                      ${totalPaid.toFixed(2)} paid
                    </div>
                    {totalUnpaid > 0 && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        ${totalUnpaid.toFixed(2)} pending
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {splits.map((split) => (
                    <div key={split.user_id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{split.users?.full_name || split.users?.email}</span>
                      <div className="flex items-center gap-1">
                        <span>${split.amount.toFixed(2)}</span>
                        {split.is_paid ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">${expense.amount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};