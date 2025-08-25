import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, DollarSign, Users, CheckCircle, Clock, 
  AlertCircle, TrendingUp, Wallet, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string;
  payment_method?: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface TripExpense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  paid_by: string;
  expense_date: string;
  is_shared: boolean;
  splits?: ExpenseSplit[];
  paidByUser?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface GroupPaymentManagerProps {
  tripId: string;
  currentUserId: string;
}

export const GroupPaymentManager = ({ tripId, currentUserId }: GroupPaymentManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Use simpler approach - just get expenses for this trip with current user's splits only
      const expensesResponse = await fetch(`/api/trips/${tripId}/expenses`);
      if (!expensesResponse.ok) throw new Error('Failed to fetch expenses');
      
      const expensesData = await expensesResponse.json();
      
      // Filter to only include shared expenses and get current user's splits
      const sharedExpenses = expensesData.filter((expense: TripExpense) => expense.is_shared);
      
      const expensesWithUserSplits = await Promise.all(
        sharedExpenses.map(async (expense: TripExpense) => {
          try {
            const splitsResponse = await fetch(`/api/expenses/${expense.id}/splits`);
            if (!splitsResponse.ok) return { ...expense, splits: [] };
            
            const allSplits = await splitsResponse.json();
            // Only get splits for current user and the payer for display
            const relevantSplits = allSplits.filter((split: ExpenseSplit) => 
              split.user_id === currentUserId || split.user_id === expense.paid_by
            );
            
            // Get minimal user details only for displayed splits
            const splitsWithUsers = await Promise.all(
              relevantSplits.map(async (split: ExpenseSplit) => {
                try {
                  const userResponse = await fetch(`/api/users/${split.user_id}`);
                  if (userResponse.ok) {
                    const userData = await userResponse.json();
                    return { ...split, user: { 
                      id: userData.id, 
                      full_name: userData.full_name, 
                      email: userData.email,
                      avatar_url: userData.avatar_url 
                    }};
                  }
                } catch {
                  // Silently handle user fetch errors
                }
                return split;
              })
            );
            
            return { ...expense, splits: splitsWithUsers };
          } catch {
            return { ...expense, splits: [] };
          }
        })
      );

      setExpenses(expensesWithUserSplits);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error loading expenses",
        description: "Unable to load payment information.",
        variant: "destructive"
      });
      // Set empty state instead of hanging on error
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (splitId: string, amount: number) => {
    setProcessingPayments(prev => new Set(prev).add(splitId));
    
    try {
      // Find the expense split and expense details
      const expense = expenses.find(exp => 
        exp.splits?.some(split => split.id === splitId)
      );
      const split = expense?.splits?.find(s => s.id === splitId);
      
      if (!expense || !split) {
        throw new Error('Expense or split not found');
      }

      // Create payment session with Stripe
      const response = await fetch('/api/create-expense-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseId: expense.id,
          amount: amount,
          description: `Payment for ${expense.title}`,
          userEmail: split.user?.email || user?.email
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
      console.error('Payment processing error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Unable to process your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(splitId);
        return newSet;
      });
    }
  };

  const getPaymentStatusBadge = (status: string, isPaid: boolean) => {
    if (isPaid) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle size={12} className="mr-1" />
          Paid
        </Badge>
      );
    }

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: TrendingUp },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTotalOwed = () => {
    return expenses.reduce((total, expense) => {
      const userSplit = expense.splits?.find(split => split.user_id === currentUserId);
      return total + (userSplit && !userSplit.is_paid ? parseFloat(userSplit.amount.toString()) : 0);
    }, 0);
  };

  const getTotalPaid = () => {
    return expenses.reduce((total, expense) => {
      const userSplit = expense.splits?.find(split => split.user_id === currentUserId);
      return total + (userSplit && userSplit.is_paid ? parseFloat(userSplit.amount.toString()) : 0);
    }, 0);
  };

  const getExpenseProgress = (expense: TripExpense) => {
    if (!expense.splits || expense.splits.length === 0) return 0;
    const paidSplits = expense.splits.filter(split => split.is_paid).length;
    return (paidSplits / expense.splits.length) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="travel-card animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading payment information...</p>
        </div>
      </div>
    );
  }

  const userExpenses = expenses.map(expense => ({
    ...expense,
    userSplit: expense.splits?.find(split => split.user_id === currentUserId)
  })).filter(expense => expense.userSplit);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Owed</p>
                <p className="text-2xl font-bold text-red-600">${getTotalOwed().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">${getTotalPaid().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">${(getTotalOwed() + getTotalPaid()).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Payment Obligations</h3>
        
        {userExpenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">No pending payments!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up with your share of group expenses.
              </p>
            </CardContent>
          </Card>
        ) : (
          userExpenses.map((expense) => (
            <Card key={expense.id} className="travel-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{expense.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {expense.description}
                    </CardDescription>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold">
                      ${parseFloat(expense.userSplit?.amount.toString() || '0').toFixed(2)}
                    </p>
                    {getPaymentStatusBadge(
                      expense.userSplit?.payment_status || 'pending',
                      expense.userSplit?.is_paid || false
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Paid by: {expense.paidByUser?.full_name || expense.paidByUser?.email}</span>
                    <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                  </div>

                  {expense.splits && expense.splits.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">
                          {expense.splits.filter(s => s.is_paid).length}/{expense.splits.length} paid
                        </span>
                      </div>
                      <Progress value={getExpenseProgress(expense)} className="h-2" />
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {expense.splits.map((split) => (
                          <div key={split.id} className="flex items-center gap-2 text-xs">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={split.user?.avatar_url} key={split.user?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {split.user?.full_name?.charAt(0) || split.user?.email?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">
                              {split.user?.full_name || split.user?.email}
                            </span>
                            {split.is_paid ? (
                              <CheckCircle size={12} className="text-green-500" />
                            ) : (
                              <Clock size={12} className="text-yellow-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {expense.userSplit && !expense.userSplit.is_paid && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => processPayment(expense.userSplit!.id, parseFloat(expense.userSplit!.amount.toString()))}
                        disabled={processingPayments.has(expense.userSplit.id)}
                        className="w-full"
                      >
                        {processingPayments.has(expense.userSplit.id) ? (
                          <>
                            <TrendingUp size={16} className="mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} className="mr-2" />
                            Pay Your Share - ${parseFloat(expense.userSplit.amount.toString()).toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {expense.userSplit?.is_paid && expense.userSplit.paid_at && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle size={16} />
                        <span>Paid on {new Date(expense.userSplit.paid_at).toLocaleDateString()}</span>
                        {expense.userSplit.payment_method && (
                          <Badge variant="outline" className="text-xs">
                            {expense.userSplit.payment_method}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};