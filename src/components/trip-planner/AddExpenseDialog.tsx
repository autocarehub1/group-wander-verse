import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { BillSplittingSection } from './BillSplittingSection';

interface Participant {
  user_id: string;
  users: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface AddExpenseDialogProps {
  tripId: string;
  participants: Participant[];
  onExpenseAdded: () => void;
}

export const AddExpenseDialog = ({ tripId, participants, onExpenseAdded }: AddExpenseDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
      onExpenseAdded();
      
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                Split this expense
              </Label>
            </div>

            {newExpense.is_shared && (
              <BillSplittingSection
                participants={participants}
                selectedParticipants={selectedParticipants}
                setSelectedParticipants={setSelectedParticipants}
                splitType={splitType}
                setSplitType={setSplitType}
                customSplits={customSplits}
                setCustomSplits={setCustomSplits}
                totalAmount={newExpense.amount}
              />
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
  );
};