import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Camera, Receipt, Users, Trash2 } from 'lucide-react';

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

interface Participant {
  user_id: string;
  users: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface ExpenseSplit {
  id: string;
  user_id: string;
  amount: number;
  is_paid: boolean;
}

interface ExpenseTrackerProps {
  tripId: string;
}

export const ExpenseTracker = ({ tripId }: ExpenseTrackerProps) => {
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'other',
    expense_date: '',
    is_shared: true
  });
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading expenses",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_participants')
        .select(`
          user_id,
          users!inner(full_name, email, avatar_url)
        `)
        .eq('trip_id', tripId)
        .eq('status', 'active');

      if (error) throw error;
      setParticipants(data || []);
      // Pre-select current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSelectedParticipants([user.id]);
      }
    } catch (error: any) {
      console.error('Error fetching participants:', error);
    }
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      setUploadingReceipt(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${tripId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('trip-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trip-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return null;
    } finally {
      setUploadingReceipt(false);
    }
  };

  const calculateSplits = () => {
    const amount = parseFloat(newExpense.amount);
    if (!amount || selectedParticipants.length === 0) return {};

    if (splitType === 'equal') {
      const splitAmount = amount / selectedParticipants.length;
      return selectedParticipants.reduce((acc, userId) => {
        acc[userId] = splitAmount.toFixed(2);
        return acc;
      }, {} as Record<string, string>);
    }
    return customSplits;
  };

  const addExpense = async () => {
    if (!newExpense.title.trim() || !newExpense.amount) {
      toast({
        title: "Required fields missing",
        description: "Please enter a title and amount.",
        variant: "destructive"
      });
      return;
    }

    if (newExpense.is_shared && selectedParticipants.length === 0) {
      toast({
        title: "No participants selected",
        description: "Please select participants for bill splitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload receipt if provided
      let receiptUrl = null;
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile);
        if (!receiptUrl) {
          toast({
            title: "Receipt upload failed",
            description: "Continuing without receipt.",
            variant: "destructive"
          });
        }
      }

      // Insert expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('trip_expenses')
        .insert([{
          trip_id: tripId,
          title: newExpense.title,
          description: newExpense.description || undefined,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          expense_date: newExpense.expense_date || undefined,
          is_shared: newExpense.is_shared,
          receipt_url: receiptUrl
        }])
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense splits if shared
      if (newExpense.is_shared && selectedParticipants.length > 0) {
        const splits = calculateSplits();
        const splitInserts = selectedParticipants.map(userId => ({
          expense_id: expenseData.id,
          user_id: userId,
          amount: parseFloat(splits[userId] || '0')
        }));

        const { error: splitError } = await supabase
          .from('expense_splits')
          .insert(splitInserts);

        if (splitError) throw splitError;
      }

      // Reset form
      setNewExpense({
        title: '',
        description: '',
        amount: '',
        category: 'other',
        expense_date: '',
        is_shared: true
      });
      setReceiptFile(null);
      setSelectedParticipants([]);
      setCustomSplits({});
      setIsAddOpen(false);
      await fetchExpenses();
      
      toast({
        title: "Expense added successfully",
        description: "New expense has been recorded."
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchParticipants();
  }, [tripId]);

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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
                <DialogDescription>Record a new expense for the trip.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-title">Title</Label>
                  <Input
                    id="expense-title"
                    placeholder="e.g., Dinner at Restaurant"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">Amount ($)</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      placeholder="50.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-category">Category</Label>
                    <select
                      id="expense-category"
                      className="w-full h-10 px-3 border rounded-md"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    >
                      <option value="food">Food</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="transport">Transport</option>
                      <option value="activities">Activities</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-description">Description (optional)</Label>
                  <Input
                    id="expense-description"
                    placeholder="Additional details..."
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt-upload">Receipt Photo (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {receiptFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReceiptFile(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {receiptFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {receiptFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-shared"
                      checked={newExpense.is_shared}
                      onCheckedChange={(checked) => 
                        setNewExpense({ ...newExpense, is_shared: !!checked })
                      }
                    />
                    <Label htmlFor="is-shared" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Split this expense
                    </Label>
                  </div>

                  {newExpense.is_shared && (
                    <div className="space-y-3 p-3 bg-muted rounded-lg">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={splitType === 'equal' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSplitType('equal')}
                        >
                          Split Equally
                        </Button>
                        <Button
                          type="button"
                          variant={splitType === 'custom' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSplitType('custom')}
                        >
                          Custom Split
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Participants</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {participants.map((participant) => (
                            <div key={participant.user_id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`participant-${participant.user_id}`}
                                checked={selectedParticipants.includes(participant.user_id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedParticipants([...selectedParticipants, participant.user_id]);
                                  } else {
                                    setSelectedParticipants(selectedParticipants.filter(id => id !== participant.user_id));
                                  }
                                }}
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={participant.users?.avatar_url || ''} />
                                <AvatarFallback>
                                  {participant.users?.full_name?.[0] || participant.users?.email[0]}
                                </AvatarFallback>
                              </Avatar>
                              <Label htmlFor={`participant-${participant.user_id}`} className="text-sm">
                                {participant.users?.full_name || participant.users?.email}
                              </Label>
                              {splitType === 'custom' && selectedParticipants.includes(participant.user_id) && (
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  className="w-20 h-6 text-xs"
                                  value={customSplits[participant.user_id] || ''}
                                  onChange={(e) => setCustomSplits({
                                    ...customSplits,
                                    [participant.user_id]: e.target.value
                                  })}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {splitType === 'equal' && selectedParticipants.length > 0 && newExpense.amount && (
                          <p className="text-xs text-muted-foreground">
                            Each person pays: ${(parseFloat(newExpense.amount) / selectedParticipants.length).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={addExpense} 
                  className="w-full"
                  disabled={uploadingReceipt}
                >
                  {uploadingReceipt ? 'Uploading Receipt...' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
        </Dialog>
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
            <Card key={expense.id}>
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
          ))}
        </div>
      )}
    </div>
  );
};