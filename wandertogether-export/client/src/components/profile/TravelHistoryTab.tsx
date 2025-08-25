import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, MapPin, Users, DollarSign, Mail, Check, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InvitationsPanel } from '../InvitationsPanel';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url?: string;
  budget_total?: number;
  currency?: string;
  participant_count?: number;
}

interface PendingInvitation {
  id: string;
  invitation_token: string;
  trip_id: string;
  invite_type: string;
  invite_value: string;
  message?: string;
  created_at: string;
  expires_at?: string;
  trip?: {
    id: string;
    title: string;
    destination: string;
    start_date?: string;
    end_date?: string;
  };
  inviter?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export const TravelHistoryTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitationLoading, setInvitationLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTripHistory();
      fetchPendingInvitations();
    }
  }, [user]);

  const fetchTripHistory = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/trips`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data || []);
      } else {
        throw new Error('Failed to fetch trip history');
      }
    } catch (error: any) {
      console.error('Error fetching trip history:', error);
      toast({
        title: "Error loading trip history",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTrip = () => {
    navigate('/trips');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'planning': return 'outline';
      default: return 'outline';
    }
  };

  const fetchPendingInvitations = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/pending-invitations`);
      if (response.ok) {
        const data = await response.json();
        setPendingInvitations(data || []);
      } else {
        console.log('No pending invitations or error fetching them');
      }
    } catch (error: any) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const handleAcceptInvitation = async (invitation: PendingInvitation) => {
    setInvitationLoading(true);
    try {
      const response = await fetch(`/api/invitations/${invitation.invitation_token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });

      if (response.ok) {
        toast({
          title: "Invitation accepted!",
          description: `You've joined ${invitation.trip?.title}. Redirecting to trip details...`
        });
        
        // Remove from pending invitations
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        
        // Redirect to trip after a delay
        setTimeout(() => {
          navigate(`/trips/${invitation.trip_id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }
    } catch (error: any) {
      toast({
        title: "Failed to accept invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitation: PendingInvitation) => {
    setInvitationLoading(true);
    try {
      const response = await fetch(`/api/invitations/${invitation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      });

      if (response.ok) {
        toast({
          title: "Invitation declined",
          description: "The invitation has been declined."
        });
        
        // Remove from pending invitations
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      } else {
        throw new Error('Failed to decline invitation');
      }
    } catch (error: any) {
      toast({
        title: "Failed to decline invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setInvitationLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <InvitationsPanel />
        <Card className="travel-card">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading your travel history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations Section */}
      <Card className="travel-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending trip invitations at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="border border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{invitation.trip?.title || 'Trip Invitation'}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{invitation.trip?.destination || 'Unknown destination'}</span>
                          </div>
                          {invitation.trip?.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(invitation.trip.start_date)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Invited by: </span>
                          <span className="font-medium">
                            {invitation.inviter?.full_name || invitation.inviter?.email || 'Someone'}
                          </span>
                        </div>
                        
                        {invitation.message && (
                          <div className="bg-muted/50 p-2 rounded text-sm italic">
                            "{invitation.message}"
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Received {formatDate(invitation.created_at)}
                          {invitation.expires_at && (
                            <span> • Expires {formatDate(invitation.expires_at)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={invitationLoading}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvitation(invitation)}
                          disabled={invitationLoading}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <InvitationsPanel />
      
      <Card className="travel-card">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl flex items-center justify-between">
            <span>Travel History</span>
            <Badge variant="outline" className="ml-2">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your travel adventures and experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium mb-2">No Travel History Yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                Start planning your first group adventure to see your travel history here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handlePlanTrip} 
                  className="w-full sm:w-auto hover-scale"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Plan Your First Trip
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/trips')}
                  className="w-full sm:w-auto hover-scale"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Browse All Trips
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
                  onClick={() => navigate(`/trips`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg truncate">{trip.title}</h4>
                        <Badge variant={getStatusColor(trip.status)}>
                          {trip.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{trip.destination}</span>
                        </div>
                        
                        {trip.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(trip.start_date)}
                              {trip.end_date && trip.end_date !== trip.start_date && 
                                ` - ${formatDate(trip.end_date)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{trip.participant_count} participants</span>
                        </div>
                        
                        {trip.budget_total && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{trip.currency || 'USD'} {trip.budget_total}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {trip.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={trip.image_url} 
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handlePlanTrip} 
                  className="w-full hover-scale"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Plan Another Trip
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};