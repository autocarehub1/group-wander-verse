import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, PieChart } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { AddExpenseDialog } from './AddExpenseDialog';
import { ExpenseCard } from './ExpenseCard';
import { SmartBudgetAllocation } from '@/components/budget/SmartBudgetAllocation';

interface ExpenseTrackerProps {
  tripId: string;
}

export const ExpenseTracker = ({ tripId }: ExpenseTrackerProps) => {
  const { expenses, participants, loading, refetchExpenses } = useExpenses(tripId);

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Expense Management</h3>
          <p className="text-sm text-muted-foreground">Track expenses and visualize budget allocation</p>
        </div>
        <AddExpenseDialog 
          tripId={tripId} 
          participants={participants}
          onExpenseAdded={refetchExpenses}
        />
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expense List
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Budget Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6 mt-6">
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
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <SmartBudgetAllocation tripId={tripId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};