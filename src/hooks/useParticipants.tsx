import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TripParticipant {
  user_id: string;
  trip_id: string;
  role: 'owner' | 'co-organizer' | 'participant';
  status: 'active' | 'invited' | 'declined' | 'removed';
  joined_at?: string;
  invitation_id?: string;
  user?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
}

export const useParticipants = (tripId?: string) => {
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchParticipants = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_participants')
        .select(`
          *,
          user:users(id, full_name, email, avatar_url)
        `)
        .eq('trip_id', tripId)
        .eq('status', 'active')
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setParticipants((data || []) as TripParticipant[]);
    } catch (error: any) {
      toast({
        title: "Error loading participants",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateParticipantRole = async (userId: string, newRole: 'owner' | 'co-organizer' | 'participant') => {
    try {
      const { error } = await supabase
        .from('trip_participants')
        .update({ role: newRole })
        .eq('trip_id', tripId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchParticipants();
      
      toast({
        title: "Role updated successfully",
        description: `Participant role has been changed to ${newRole}.`
      });
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeParticipant = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('trip_participants')
        .update({ status: 'removed' })
        .eq('trip_id', tripId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchParticipants();
      
      toast({
        title: "Participant removed",
        description: "The participant has been removed from the trip."
      });
    } catch (error: any) {
      toast({
        title: "Error removing participant",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const leaveTrip = async () => {
    if (!user || !tripId) return;

    try {
      const { error } = await supabase
        .from('trip_participants')
        .update({ status: 'removed' })
        .eq('trip_id', tripId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Left trip successfully",
        description: "You have left the trip."
      });
    } catch (error: any) {
      toast({
        title: "Error leaving trip",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCurrentUserRole = () => {
    if (!user) return null;
    const currentParticipant = participants.find(p => p.user_id === user.id);
    return currentParticipant?.role || null;
  };

  const canManageParticipants = () => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'co-organizer';
  };

  useEffect(() => {
    if (tripId) {
      fetchParticipants();
    }
  }, [tripId]);

  return {
    participants,
    loading,
    updateParticipantRole,
    removeParticipant,
    leaveTrip,
    getCurrentUserRole,
    canManageParticipants,
    refetchParticipants: fetchParticipants
  };
};