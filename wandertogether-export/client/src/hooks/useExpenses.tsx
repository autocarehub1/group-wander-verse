import { useState, useEffect } from 'react';
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
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data || []);
      } else {
        throw new Error('Failed to fetch expenses');
      }
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
      const response = await fetch(`/api/trips/${tripId}/participants`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data || []);
      } else {
        console.error('Error fetching participants: Failed to fetch');
      }
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