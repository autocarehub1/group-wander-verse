import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useParticipants, TripParticipant } from '@/hooks/useParticipants';
import { Users, MoreHorizontal, Crown, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ParticipantsTabProps {
  tripId: string;
}

export const ParticipantsTab = ({ tripId }: ParticipantsTabProps) => {
  const { 
    participants, 
    loading: participantsLoading, 
    updateParticipantRole, 
    removeParticipant, 
    canManageParticipants, 
    getCurrentUserRole 
  } = useParticipants(tripId);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'co-organizer':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default' as const;
      case 'co-organizer':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const isOwnerOrCoOrganizer = canManageParticipants();
  const currentUserRole = getCurrentUserRole();

  if (participantsLoading) {
    return <div className="text-center py-8">Loading participants...</div>;
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No participants found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <div key={participant.user_id} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={participant.user?.avatar_url} />
              <AvatarFallback>
                {participant.user?.full_name?.charAt(0) || participant.user?.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {participant.user?.full_name || participant.user?.email}
                </p>
                {getRoleIcon(participant.role)}
              </div>
              <p className="text-sm text-muted-foreground">
                {participant.user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getRoleBadgeVariant(participant.role)}>
              {participant.role.replace('-', ' ')}
            </Badge>
            
            {isOwnerOrCoOrganizer && participant.role !== 'owner' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentUserRole === 'owner' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => updateParticipantRole(participant.user_id, 'co-organizer')}
                        disabled={participant.role === 'co-organizer'}
                      >
                        Make Co-organizer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateParticipantRole(participant.user_id, 'participant')}
                        disabled={participant.role === 'participant'}
                      >
                        Make Participant
                      </DropdownMenuItem>
                      <Separator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => removeParticipant(participant.user_id)}
                    className="text-red-600"
                  >
                    Remove from Trip
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};