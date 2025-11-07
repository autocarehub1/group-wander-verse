import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
  group_settings?: any;
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
      
      // Fetch trips from our API
      const response = await fetch(`/api/users/${user.id}/trips`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
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
    if (!user) {
      console.error('No user found for trip creation');
      toast({
        title: "Authentication required",
        description: "Please sign in to create a trip",
        variant: "destructive"
      });
      return null;
    }

    console.log('Creating trip with user:', user.id, 'data:', tripData);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tripData.title,
          destination: tripData.destination,
          description: tripData.description,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          created_by: user.id,
          status: 'planning'
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Trip creation failed:', errorData);
        throw new Error(errorData || 'Failed to create trip');
      }

      const trip = await response.json();
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
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update trip');
      }

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
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete trip');

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