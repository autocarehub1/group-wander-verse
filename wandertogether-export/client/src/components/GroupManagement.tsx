import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useParticipants } from '@/hooks/useParticipants';
import { useInvitations } from '@/hooks/useInvitations';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { GroupChat } from './GroupChat';
import { TripPlanner } from './trip-planner/TripPlanner';
import { InvitationDialog } from './group-management/InvitationDialog';
import { ParticipantsTab } from './group-management/ParticipantsTab';
import { InvitationsTab } from './group-management/InvitationsTab';
import { Users, MessageCircle, MapPin, Sparkles, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GroupManagementProps {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
}

export const GroupManagement = ({ tripId, tripTitle, tripDestination }: GroupManagementProps) => {
  const { participants, canManageParticipants } = useParticipants(tripId);
  const { invitations } = useInvitations(tripId);
  const { generateSuggestions, loading } = useLocationSuggestions();

  const isOwnerOrCoOrganizer = canManageParticipants();

  const handleGenerateSuggestions = async () => {
    await generateSuggestions(tripDestination, tripId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Group Management
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Manage participants and invitations for {tripTitle} to {tripDestination}
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSuggestions}
              disabled={loading}
              className="flex items-center gap-2 justify-center"
              title="Generate AI-powered activity and accommodation suggestions (may have limited availability)"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{loading ? 'Generating...' : 'AI Suggestions'}</span>
            </Button>
            <InvitationDialog tripId={tripId} isOwnerOrCoOrganizer={isOwnerOrCoOrganizer} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="chat" className="text-xs sm:text-sm px-2 py-2 flex items-center justify-center gap-1">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Group Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="text-xs sm:text-sm px-2 py-2 flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Trip Planner</span>
              <span className="sm:hidden">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-2 flex items-center justify-center gap-1">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="participants" className="text-xs sm:text-sm px-2 py-2 text-center">
              <span className="hidden sm:inline">Participants ({participants.length})</span>
              <span className="sm:hidden">People ({participants.length})</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-xs sm:text-sm px-2 py-2 text-center">
              <span className="hidden sm:inline">Invitations ({invitations.filter(i => i.status === 'pending').length})</span>
              <span className="sm:hidden">Invites ({invitations.filter(i => i.status === 'pending').length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-6">
            <GroupChat tripId={tripId} tripTitle={tripTitle} />
          </TabsContent>
          
          <TabsContent value="planner" className="mt-6">
            <TripPlanner tripId={tripId} tripTitle={tripTitle} tripDestination={tripDestination} />
          </TabsContent>
          
          <TabsContent value="participants" className="space-y-4">
            <ParticipantsTab tripId={tripId} />
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CreditCard className="h-12 w-12 text-brand-teal" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Trip Payments</h3>
                <p className="text-muted-foreground mb-4">Manage your expense payments for this trip</p>
                <Link to={`/trips/${tripId}/payments`}>
                  <Button className="bg-brand-teal hover:bg-brand-teal/90">
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Payment Center
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <InvitationsTab tripId={tripId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};