import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useParticipants } from '@/hooks/useParticipants';
import { useInvitations } from '@/hooks/useInvitations';
import { GroupChat } from './GroupChat';
import { TripPlanner } from './trip-planner/TripPlanner';
import { Users, UserPlus, Link, MoreHorizontal, Crown, Shield, MessageCircle, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface GroupManagementProps {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
}

export const GroupManagement = ({ tripId, tripTitle, tripDestination }: GroupManagementProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const { participants, loading: participantsLoading, updateParticipantRole, removeParticipant, canManageParticipants, getCurrentUserRole } = useParticipants(tripId);
  const { invitations, loading: invitationsLoading, createInvitation, generateShareableLink, declineInvitation } = useInvitations(tripId);
  const { toast } = useToast();

  const handleEmailInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    const result = await createInvitation({
      invite_type: 'email',
      invite_value: inviteEmail,
      message: inviteMessage || undefined
    });

    if (result) {
      setInviteEmail('');
      setInviteMessage('');
      setIsInviteDialogOpen(false);
    }
  };

  const handlePhoneInvite = async () => {
    if (!invitePhone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number.",
        variant: "destructive"
      });
      return;
    }

    const result = await createInvitation({
      invite_type: 'phone',
      invite_value: invitePhone,
      message: inviteMessage || undefined
    });

    if (result) {
      setInvitePhone('');
      setInviteMessage('');
      setIsInviteDialogOpen(false);
    }
  };

  const handleShareableLink = async () => {
    await generateShareableLink();
    setIsInviteDialogOpen(false);
  };

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
  const currentUserRole = getCurrentUserRole();

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
          
          {isOwnerOrCoOrganizer && (
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite People
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite People to Trip</DialogTitle>
                  <DialogDescription>
                    Send invitations via email, phone, or create a shareable link.
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                    <TabsTrigger value="link">Link</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a personal message to your invitation..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleEmailInvite} className="w-full">
                      Send Email Invitation
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="phone" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message-phone">Personal Message (Optional)</Label>
                      <Textarea
                        id="message-phone"
                        placeholder="Add a personal message to your invitation..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handlePhoneInvite} className="w-full">
                      Send SMS Invitation
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="link" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                        <Link className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Create Shareable Link</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate a link that can be shared via any platform. Anyone with this link can join the trip.
                        </p>
                      </div>
                      <Button onClick={handleShareableLink} className="w-full">
                        Generate Shareable Link
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
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
            {participantsLoading ? (
              <div className="text-center py-8">Loading participants...</div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No participants found.
              </div>
            ) : (
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
            )}
          </TabsContent>
          
          <TabsContent value="invitations" className="space-y-4">
            {invitationsLoading ? (
              <div className="text-center py-8">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invitations sent yet.
              </div>
            ) : (
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
                    
                    {invitation.status === 'pending' && (
                      <div className="flex gap-2">
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};