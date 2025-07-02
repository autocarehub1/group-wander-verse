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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              Group Chat
            </TabsTrigger>
            <TabsTrigger value="planner">
              <MapPin className="h-4 w-4 mr-2" />
              Trip Planner
            </TabsTrigger>
            <TabsTrigger value="participants">
              Participants ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations ({invitations.filter(i => i.status === 'pending').length})
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