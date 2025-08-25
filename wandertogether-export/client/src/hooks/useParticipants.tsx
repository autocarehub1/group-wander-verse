import { useState, useEffect } from 'react';
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
      const response = await fetch(`/api/trips/${tripId}/participants`);
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      
      const data = await response.json();
      setParticipants(data || []);
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
      const response = await fetch(`/api/trips/${tripId}/participants/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update participant role');
      }

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
      const response = await fetch(`/api/trips/${tripId}/participants/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove participant');
      }

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
      const response = await fetch(`/api/trips/${tripId}/participants/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to leave trip');
      }
      
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
    return role === 'owner' || role === 'co-organizer' || role === 'organizer';
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