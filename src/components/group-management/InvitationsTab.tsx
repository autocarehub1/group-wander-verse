import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvitations } from '@/hooks/useInvitations';
import { useParticipants } from '@/hooks/useParticipants';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Sparkles } from 'lucide-react';

interface InvitationsTabProps {
  tripId: string;
}

export const InvitationsTab = ({ tripId }: InvitationsTabProps) => {
  const { invitations, loading: invitationsLoading, declineInvitation, cleanupDeclinedInvitations } = useInvitations(tripId);
  const { canManageParticipants } = useParticipants(tripId);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOwnerOrCoOrganizer = canManageParticipants();
  const declinedInvitations = invitations.filter(inv => inv.status === 'declined');

  if (invitationsLoading) {
    return <div className="text-center py-8">Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitations sent yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cleanup Actions */}
      {isOwnerOrCoOrganizer && declinedInvitations.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed">
          <div>
            <p className="font-medium text-sm">Cleanup Declined Invitations</p>
            <p className="text-xs text-muted-foreground">
              {declinedInvitations.length} declined invitation{declinedInvitations.length > 1 ? 's' : ''} can be cleaned up
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await cleanupDeclinedInvitations();
                toast({
                  title: "Cleanup completed",
                  description: "Declined invitations have been removed."
                });
              } catch (error) {
                toast({
                  title: "Cleanup failed",
                  description: "Failed to clean up declined invitations.",
                  variant: "destructive"
                });
              }
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Clean Up
          </Button>
        </div>
      )}
      
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {invitation.invite_type === 'link' ? 'Shareable Link' : invitation.invite_value}
                </span>
                <Badge className={getStatusColor(invitation.status)} variant="outline">
                  {invitation.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Invited by {invitation.inviter?.full_name || invitation.inviter?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(invitation.expires_at).toLocaleDateString()}
              </p>
              {invitation.message && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{invitation.message}"
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {invitation.status === 'pending' && (
                <>
                  {invitation.invite_type === 'link' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/join/${invitation.invitation_token}`;
                        navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: "Link copied",
                          description: "Invitation link copied to clipboard."
                        });
                      }}
                    >
                      Copy Link
                    </Button>
                  )}
                  {isOwnerOrCoOrganizer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => declineInvitation(invitation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </>
              )}
              
              {invitation.status === 'declined' && isOwnerOrCoOrganizer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await cleanupDeclinedInvitations();
                      toast({
                        title: "Invitation removed",
                        description: "Declined invitation has been cleaned up."
                      });
                    } catch (error) {
                      toast({
                        title: "Cleanup failed",
                        description: "Failed to remove declined invitation.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};