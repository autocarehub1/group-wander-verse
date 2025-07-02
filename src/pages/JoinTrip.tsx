import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInvitations } from '@/hooks/useInvitations';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

interface InvitationDetails {
  id: string;
  trip_id: string;
  status: string;
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

const JoinTrip = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { acceptInvitation } = useInvitations();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('trip_invitations')
          .select(`
            *,
            inviter:users!trip_invitations_invited_by_fkey(full_name, email),
            trip:trips(title, destination, description, start_date, end_date)
          `)
          .eq('invitation_token', token)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Invitation not found');
          return;
        }

        if (data.status !== 'pending') {
          setError(`This invitation has been ${data.status}`);
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setError('This invitation has expired');
          return;
        }

        setInvitation(data as InvitationDetails);
      } catch (error: any) {
        setError(error.message || 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;

    setProcessing(true);
    try {
      const tripId = await acceptInvitation(token);
      if (tripId) {
        navigate('/trips');
      }
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = () => {
    navigate('/');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to accept this trip invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              The invitation you're looking for doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Trip Invitation</CardTitle>
          <CardDescription>
            You've been invited to join an amazing trip!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold">{invitation.trip?.title}</h3>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                {invitation.trip?.destination}
              </div>
            </div>
            
            {invitation.trip?.description && (
              <p className="text-center text-muted-foreground">
                {invitation.trip.description}
              </p>
            )}
            
            {(invitation.trip?.start_date || invitation.trip?.end_date) && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {invitation.trip.start_date && invitation.trip.end_date ? (
                  <span>{formatDate(invitation.trip.start_date)} - {formatDate(invitation.trip.end_date)}</span>
                ) : invitation.trip.start_date ? (
                  <span>Starts {formatDate(invitation.trip.start_date)}</span>
                ) : (
                  <span>Ends {formatDate(invitation.trip.end_date)}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm">
              <p className="font-medium">Invited by:</p>
              <p className="text-muted-foreground">
                {invitation.inviter?.full_name || invitation.inviter?.email}
              </p>
            </div>
            
            {invitation.message && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Personal message:</p>
                <p className="text-muted-foreground italic">"{invitation.message}"</p>
              </div>
            )}
            
            <div className="mt-3 text-xs text-muted-foreground">
              Expires: {new Date(invitation.expires_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDeclineInvitation}
              className="flex-1"
              disabled={processing}
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              className="flex-1"
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            By accepting this invitation, you'll be added to the trip group and can start planning together.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinTrip;