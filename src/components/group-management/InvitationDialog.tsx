import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Link } from 'lucide-react';

interface InvitationDialogProps {
  tripId: string;
  isOwnerOrCoOrganizer: boolean;
}

export const InvitationDialog = ({ tripId, isOwnerOrCoOrganizer }: InvitationDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const { createInvitation, generateShareableLink } = useInvitations(tripId);
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

  if (!isOwnerOrCoOrganizer) {
    return null;
  }

  return (
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
  );
};