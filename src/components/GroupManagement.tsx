import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParticipants } from '@/hooks/useParticipants';
import { useInvitations } from '@/hooks/useInvitations';
import { GroupChat } from './GroupChat';
import { TripPlanner } from './trip-planner/TripPlanner';
import { InvitationDialog } from './group-management/InvitationDialog';
import { ParticipantsTab } from './group-management/ParticipantsTab';
import { InvitationsTab } from './group-management/InvitationsTab';
import { Users, MessageCircle, MapPin } from 'lucide-react';

interface GroupManagementProps {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
}

export const GroupManagement = ({ tripId, tripTitle, tripDestination }: GroupManagementProps) => {
  const { participants, canManageParticipants } = useParticipants(tripId);
  const { invitations } = useInvitations(tripId);

  const isOwnerOrCoOrganizer = canManageParticipants();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Management
            </CardTitle>
            <CardDescription>
              Manage participants and invitations for {tripTitle} to {tripDestination}
            </CardDescription>
          </div>
          
          <InvitationDialog tripId={tripId} isOwnerOrCoOrganizer={isOwnerOrCoOrganizer} />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="chat" className="text-xs md:text-sm">
              <MessageCircle className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">Group Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="text-xs md:text-sm">
              <MapPin className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">Trip Planner</span>
              <span className="sm:hidden">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="participants" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Participants ({participants.length})</span>
              <span className="sm:hidden">People ({participants.length})</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-xs md:text-sm">
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
          
          <TabsContent value="invitations" className="space-y-4">
            <InvitationsTab tripId={tripId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};