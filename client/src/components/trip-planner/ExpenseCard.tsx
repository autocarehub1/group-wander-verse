import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Users, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

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
      // Fetch expense splits via API
      const response = await fetch(`/api/expenses/${expense.id}/splits`);
      if (response.ok) {
        const data = await response.json();
        setSplits(data || []);
      }
    } catch (error) {
      console.error('Error fetching splits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplits();
  }, [expense.id, expense.is_shared]);

  const totalPaid = splits.filter(s => s.is_paid).reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
  const totalUnpaid = splits.filter(s => !s.is_paid).reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm sm:text-base truncate">{expense.title}</h4>
              {expense.receipt_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(expense.receipt_url!, '_blank')}
                  className="h-6 w-6 p-0 flex-shrink-0"
                  data-testid={`button-receipt-${expense.id}`}
                >
                  <Receipt className="h-3 w-3" />
                </Button>
              )}
            </div>
            {expense.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">{expense.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{expense.category}</Badge>
              {expense.is_shared && (
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  <Users className="h-3 w-3 mr-1" />
                  Split
                </Badge>
              )}
              {expense.expense_date && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {expense.is_shared && splits.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm mb-2 gap-1 sm:gap-0">
                  <span className="font-medium">Settlement Status:</span>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                      <Check className="h-3 w-3" />
                      ${totalPaid.toFixed(2)} paid
                    </div>
                    {totalUnpaid > 0 && (
                      <div className="flex items-center gap-1 text-amber-600 text-xs sm:text-sm">
                        <AlertCircle className="h-3 w-3" />
                        ${totalUnpaid.toFixed(2)} pending
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {splits.map((split) => (
                    <div key={split.user_id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="truncate mr-2">{split.users?.full_name || split.users?.email}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span>${parseFloat(split.amount.toString()).toFixed(2)}</span>
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
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-base sm:text-lg whitespace-nowrap">${parseFloat(expense.amount.toString()).toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};