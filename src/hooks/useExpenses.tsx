import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useExpenses = (tripId: string) => {
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error: any) {
      console.error('Error fetching participants:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchParticipants();
  }, [tripId]);

  return {
    expenses,
    participants,
    loading,
    refetchExpenses: fetchExpenses
  };
};