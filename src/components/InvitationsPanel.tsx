import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PendingInvitation {
  id: string;
  trip_id: string;
  invitation_token: string;
  expires_at: string;
  message?: string;
  inviter?: {
    full_name?: string;
    email: string;
  };
  trip?: {
    title: string;
    destination: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  };
}

export const InvitationsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_invitations')
        .select(`
          *,
          inviter:users!trip_invitations_invited_by_fkey(full_name, email),
          trip:trips(title, destination, description, start_date, end_date)
        `)
        .eq('invite_value', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data || []) as PendingInvitation[]);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error loading invitations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationToken: string, invitationId: string) => {
    try {
      setProcessing(invitationId);
      
      const { data, error } = await supabase
        .rpc('accept_trip_invitation', { invitation_token: invitationToken });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; trip_id?: string };
      
      if (result.success) {
        toast({
          title: "Invitation accepted!",
          description: "You've successfully joined the trip."
        });
        // Remove the accepted invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        throw new Error(result.error || 'Failed to accept invitation');
      }
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      setProcessing(invitationId);
      
      const { error } = await supabase
        .from('trip_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation declined",
        description: "You have declined the trip invitation."
      });
      
      // Remove the declined invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error: any) {
      toast({
        title: "Error declining invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const timeDiff = expires.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 1;
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            No pending trip invitations at the moment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations
          <Badge variant="secondary">{invitations.length}</Badge>
        </CardTitle>
        <CardDescription>
          Trip invitations waiting for your response
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="border border-border/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{invitation.trip?.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {invitation.trip?.destination}
                    </div>
                  </div>
                  {isExpiringSoon(invitation.expires_at) && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires Soon
                    </Badge>
                  )}
                </div>

                {invitation.trip?.description && (
                  <p className="text-sm text-muted-foreground">
                    {invitation.trip.description}
                  </p>
                )}

                {(invitation.trip?.start_date || invitation.trip?.end_date) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {invitation.trip.start_date && invitation.trip.end_date ? (
                      <span>{formatDate(invitation.trip.start_date)} - {formatDate(invitation.trip.end_date)}</span>
                    ) : invitation.trip.start_date ? (
                      <span>Starts {formatDate(invitation.trip.start_date)}</span>
                    ) : (
                      <span>Ends {formatDate(invitation.trip.end_date)}</span>
                    )}
                  </div>
                )}

                <div className="bg-muted/30 rounded p-2 text-xs">
                  <p><strong>From:</strong> {invitation.inviter?.full_name || invitation.inviter?.email}</p>
                  {invitation.message && (
                    <p className="mt-1"><strong>Message:</strong> "{invitation.message}"</p>
                  )}
                  <p className="mt-1 text-muted-foreground">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => declineInvitation(invitation.id)}
                    disabled={processing === invitation.id}
                    className="flex-1"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => acceptInvitation(invitation.invitation_token, invitation.id)}
                    disabled={processing === invitation.id}
                    className="flex-1"
                  >
                    {processing === invitation.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};