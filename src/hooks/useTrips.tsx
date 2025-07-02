import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Json } from '@/integrations/supabase/types';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  image_url?: string;
  created_by?: string;
  group_settings?: Json;
  created_at?: string;
  updated_at?: string;
}

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

export interface TripInvitation {
  id: string;
  trip_id: string;
  invited_by: string;
  invite_type: 'email' | 'phone' | 'link';
  invite_value?: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTrips = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_participants!inner(
            user_id,
            role,
            status
          )
        `)
        .eq('trip_participants.user_id', user.id)
        .eq('trip_participants.status', 'active');

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading trips",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: { title: string; destination: string; description?: string; start_date?: string; end_date?: string; }) => {
    if (!user) return null;

    try {
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert([{
          title: tripData.title,
          destination: tripData.destination,
          description: tripData.description,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          created_by: user.id,
          status: 'planning'
        }])
        .select()
        .single();

      if (tripError) throw tripError;

      // Add creator as owner participant
      const { error: participantError } = await supabase
        .from('trip_participants')
        .insert([{
          trip_id: trip.id,
          user_id: user.id,
          role: 'owner',
          status: 'active'
        }]);

      if (participantError) throw participantError;

      await fetchTrips();
      
      toast({
        title: "Trip created successfully",
        description: `${trip.title} has been created.`
      });

      return trip;
    } catch (error: any) {
      toast({
        title: "Error creating trip",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId);

      if (error) throw error;

      await fetchTrips();
      
      toast({
        title: "Trip updated successfully",
        description: "Your changes have been saved."
      });
    } catch (error: any) {
      toast({
        title: "Error updating trip",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      await fetchTrips();
      
      toast({
        title: "Trip deleted successfully",
        description: "The trip has been permanently removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting trip",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    refetchTrips: fetchTrips
  };
};