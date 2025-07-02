import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('trip_invitations')
        .select(`
          *,
          inviter:users!trip_invitations_invited_by_fkey(full_name, email),
          trip:trips(title, destination)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data || []) as TripInvitation[]);
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
      const { data: invitation, error } = await supabase
        .from('trip_invitations')
        .insert([{
          trip_id: tripId,
          invited_by: user.id,
          ...inviteData
        }])
        .select()
        .single();

      if (error) throw error;

      // Send email invitation if it's an email type
      if (inviteData.invite_type === 'email' && inviteData.invite_value && invitation.invitation_token) {
        try {
          // Get user profile for inviter name
          const { data: userProfile } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', user.id)
            .single();

          // Get trip details
          const { data: trip } = await supabase
            .from('trips')
            .select('title, destination')
            .eq('id', tripId)
            .single();

          if (trip && userProfile) {
            const emailResponse = await supabase.functions.invoke('send-invitation-email', {
              body: {
                invitationId: invitation.id,
                inviteEmail: inviteData.invite_value,
                tripTitle: trip.title,
                tripDestination: trip.destination,
                inviterName: userProfile.full_name || userProfile.email,
                invitationToken: invitation.invitation_token
              }
            });

            if (emailResponse.error) {
              console.error('Error sending email:', emailResponse.error);
              toast({
                title: "Invitation created but email failed",
                description: "The invitation was created but we couldn't send the email. Please share the invitation link manually.",
                variant: "destructive"
              });
            } else {
              console.log('Email sent successfully:', emailResponse.data);
            }
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          toast({
            title: "Invitation created but email failed",
            description: "The invitation was created but we couldn't send the email. Please share the invitation link manually.",
            variant: "destructive"
          });
        }
      }

      await fetchInvitations();
      
      toast({
        title: "Invitation sent successfully",
        description: `Invitation has been sent via ${inviteData.invite_type}.`
      });

      return invitation;
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const acceptInvitation = async (invitationToken: string) => {
    try {
      const { data, error } = await supabase
        .rpc('accept_trip_invitation', { invitation_token: invitationToken });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; trip_id?: string };
      
      if (result.success) {
        toast({
          title: "Invitation accepted!",
          description: "You've successfully joined the trip."
        });
        return result.trip_id;
      } else {
        throw new Error(result.error || 'Failed to accept invitation');
      }
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
      const { error } = await supabase
        .from('trip_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('trip_invitations')
        .insert([{
          trip_id: tripId,
          invited_by: user.id,
          invite_type: 'link'
        }])
        .select()
        .single();

      if (error) throw error;

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
    refetchInvitations: fetchInvitations
  };
};