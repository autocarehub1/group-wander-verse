import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
  inviter?: {
    full_name?: string;
    email: string;
  };
  trip?: {
    title: string;
    destination: string;
  };
}

export const useInvitations = (tripId?: string) => {
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvitations = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}/invitations`);
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      
      const data = await response.json();
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading invitations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (inviteData: {
    invite_type: 'email' | 'phone' | 'link';
    invite_value?: string;
    message?: string;
  }) => {
    if (!user || !tripId) return null;

    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invited_by: user.id,
          ...inviteData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invitation');
      }

      const invitation = await response.json();
      await fetchInvitations();
      
      // Show notification for successful invitation
      const recipientInfo = inviteData.invite_value ? ` to ${inviteData.invite_value}` : '';
      const actionText = inviteData.invite_type === 'email' ? 'sent' : 
                        inviteData.invite_type === 'phone' ? 'sent' : 'created';
      toast({
        title: `Invitation ${actionText}!`,
        description: `Trip invitation has been ${actionText} via ${inviteData.invite_type}${recipientInfo}`,
      });

      return invitation;
    } catch (error: any) {
      toast({
        title: "Error creating invitation",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const acceptInvitation = async (invitationToken: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationToken}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      const result = await response.json();
      
      toast({
        title: "Invitation accepted!",
        description: "You've successfully joined the trip."
      });
      return result.trip_id;
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      await fetchInvitations();
      
      toast({
        title: "Invitation declined",
        description: "You have declined the trip invitation."
      });
    } catch (error: any) {
      toast({
        title: "Error declining invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateShareableLink = async () => {
    if (!user || !tripId) return null;

    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invited_by: user.id,
          invite_type: 'link'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shareable link');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/join/${data.invitation_token}`;
      
      toast({
        title: "Shareable link created",
        description: "Link has been generated and copied to clipboard."
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      await fetchInvitations();
      return shareUrl;
    } catch (error: any) {
      toast({
        title: "Error creating shareable link",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const cleanupDeclinedInvitations = async () => {
    // Functionality temporarily disabled during migration
    toast({
      title: "Feature temporarily unavailable",
      description: "Cleanup functionality is temporarily disabled during migration.",
      variant: "destructive"
    });
  };

  useEffect(() => {
    if (tripId) {
      fetchInvitations();
    }
  }, [tripId]);

  return {
    invitations,
    loading,
    createInvitation,
    acceptInvitation,
    declineInvitation,
    generateShareableLink,
    cleanupDeclinedInvitations,
    refetchInvitations: fetchInvitations
  };
};