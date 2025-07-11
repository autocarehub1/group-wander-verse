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
        console.log('🚀 Starting email invitation process...');
        console.log('📧 Email recipient:', inviteData.invite_value);
        console.log('🎫 Invitation token:', invitation.invitation_token);
        try {
          console.log('Attempting to send email invitation...');
          
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

          console.log('User profile:', userProfile);
          console.log('Trip details:', trip);

          if (trip && userProfile) {
            console.log('✅ Trip and user data loaded successfully');
            console.log('🏖️ Trip details:', { title: trip.title, destination: trip.destination });
            console.log('👤 User profile:', { name: userProfile.full_name, email: userProfile.email });

            console.log('📤 Calling send-invitation-email function...');
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

            console.log('📨 Email function raw response:', emailResponse);

            if (emailResponse.error) {
              console.error('❌ Error sending email:', emailResponse.error);
              toast({
                title: "Invitation created but email failed",
                description: `Email error: ${emailResponse.error.message}. Please share the invitation link manually.`,
                variant: "destructive"
              });
            } else if (emailResponse.data && emailResponse.data.success) {
              console.log('✅ Email sent successfully via Resend');
              toast({
                title: "Email sent successfully",
                description: `Invitation email has been sent to ${inviteData.invite_value}.`
              });
            } else {
              console.error('⚠️ Unexpected email response:', emailResponse.data);
              toast({
                title: "Invitation created but email uncertain",
                description: "The invitation was created. Please check if the email was delivered.",
                variant: "destructive"
              });
            }
          } else {
            console.error('Missing trip or user profile data');
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          toast({
            title: "Invitation created but email failed",
            description: "The invitation was created but we couldn't send the email. Please share the invitation link manually.",
            variant: "destructive"
          });
        }
      } else {
        console.log('Not sending email - conditions not met:', {
          type: inviteData.invite_type,
          hasValue: !!inviteData.invite_value,
          hasToken: !!invitation.invitation_token
        });
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
      console.log('🎯 Accepting invitation with token:', invitationToken);
      console.log('👤 Current user:', user?.id);
      
      const { data, error } = await supabase
        .rpc('accept_trip_invitation', { invitation_token: invitationToken });

      console.log('📥 RPC response data:', data);
      console.log('❌ RPC response error:', error);

      if (error) {
        console.error('💥 RPC call failed:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string; trip_id?: string };
      console.log('📊 Parsed result:', result);
      
      if (result.success) {
        console.log('✅ Invitation accepted successfully!');
        toast({
          title: "Invitation accepted!",
          description: "You've successfully joined the trip."
        });
        return result.trip_id;
      } else {
        console.error('❌ Invitation acceptance failed:', result.error);
        throw new Error(result.error || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('💥 Error in acceptInvitation:', error);
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

  const cleanupDeclinedInvitations = async () => {
    if (!user || !tripId) return;

    try {
      // Call the database function to clean up declined invitations
      const { error } = await supabase
        .rpc('cleanup_declined_invitations');

      if (error) throw error;

      // Refresh the invitations list
      await fetchInvitations();
      
      toast({
        title: "Cleanup completed",
        description: "Declined and expired invitations have been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error cleaning up invitations",
        description: error.message,
        variant: "destructive"
      });
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
    cleanupDeclinedInvitations,
    refetchInvitations: fetchInvitations
  };
};