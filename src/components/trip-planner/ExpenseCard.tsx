import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Users } from 'lucide-react';

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

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
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
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">${expense.amount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};