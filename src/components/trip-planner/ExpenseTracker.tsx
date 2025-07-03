import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { AddExpenseDialog } from './AddExpenseDialog';
import { ExpenseCard } from './ExpenseCard';

interface ExpenseTrackerProps {
  tripId: string;
}

export const ExpenseTracker = ({ tripId }: ExpenseTrackerProps) => {
  const { expenses, participants, loading, refetchExpenses } = useExpenses(tripId);

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Expense Tracker</h3>
          <p className="text-sm text-muted-foreground">Track shared expenses for your trip</p>
        </div>
        <AddExpenseDialog 
          tripId={tripId} 
          participants={participants}
          onExpenseAdded={refetchExpenses}
        />
      </div>

      <Card>
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
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
};