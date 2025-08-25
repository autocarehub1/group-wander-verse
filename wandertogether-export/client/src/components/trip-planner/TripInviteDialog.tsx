import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Phone, Link, Copy, QrCode, Share2, MessageCircle } from 'lucide-react';

interface TripInviteDialogProps {
  tripId: string;
}

export const TripInviteDialog = ({ tripId }: TripInviteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleInviteByEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_type: 'email',
          invite_value: email.trim(),
          message: message.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${email.trim()}`
      });

      setEmail('');
      setMessage('');
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleInviteByPhone = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_type: 'phone',
          invite_value: phone.trim(),
          message: message.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${phone.trim()}`
      });

      setPhone('');
      setMessage('');
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateShareableLink = async () => {
    setIsInviting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_type: 'link'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shareable link');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/join/${data.invitation_token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Shareable link created!",
        description: "Link has been copied to clipboard and can be shared anywhere."
      });

      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error creating link",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleGenerateQRCode = async () => {
    setIsInviting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_type: 'qr'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/join/${data.invitation_token}`;
      
      // Generate QR code URL using QR Server API
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      
      // Create a temporary link to download the QR code
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'trip-invitation-qr.png';
      link.click();
      
      toast({
        title: "QR Code generated!",
        description: "QR code image has been downloaded. Share it for easy scanning!"
      });

      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error generating QR code",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleSocialShare = async (platform: string) => {
    setIsInviting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_type: 'social'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/join/${data.invitation_token}`;
      const shareText = `Join me on an amazing trip! Click here to join our group: ${shareUrl}`;
      
      let platformUrl = '';
      
      switch (platform) {
        case 'whatsapp':
          platformUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
          break;
        case 'telegram':
          platformUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Join me on an amazing trip!')}`;
          break;
        case 'twitter':
          platformUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
          break;
        case 'facebook':
          platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'native':
          // Use Web Share API if available
          if (navigator.share) {
            await navigator.share({
              title: 'Join My Trip!',
              text: 'Join me on an amazing trip!',
              url: shareUrl,
            });
            setIsOpen(false);
            setIsInviting(false);
            return;
          } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(shareText);
            toast({
              title: "Link copied!",
              description: "Share link has been copied to clipboard."
            });
            setIsOpen(false);
            setIsInviting(false);
            return;
          }
      }
      
      // Open social platform share dialog
      window.open(platformUrl, '_blank', 'width=600,height=400');
      
      toast({
        title: "Share dialog opened!",
        description: "Share your trip invitation on social media."
      });

      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error creating share link",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite People
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite People to Trip</DialogTitle>
          <DialogDescription>
            Send invitations via email, SMS, create shareable links, QR codes, or share on social media.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-5 text-xs">
            <TabsTrigger value="email" className="gap-1">
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="phone" className="gap-1">
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-1">
              <Link className="h-3 w-3" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-1">
              <QrCode className="h-3 w-3" />
              <span className="hidden sm:inline">QR</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1">
              <Share2 className="h-3 w-3" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Join me for an amazing trip!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleInviteByEmail} 
              className="w-full" 
              disabled={isInviting}
            >
              {isInviting ? "Sending..." : "Send Email Invitation"}
            </Button>
          </TabsContent>
          
          <TabsContent value="phone" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-sms">Personal Message (Optional)</Label>
              <Textarea
                id="message-sms"
                placeholder="Join me for an amazing trip!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleInviteByPhone} 
              className="w-full" 
              disabled={isInviting}
            >
              {isInviting ? "Sending..." : "Send SMS Invitation"}
            </Button>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                <Copy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Create Shareable Link</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a link that can be shared via any platform. Anyone with this link can join the trip.
                </p>
              </div>
              <Button 
                onClick={handleCreateShareableLink} 
                className="w-full" 
                disabled={isInviting}
              >
                {isInviting ? "Creating..." : "Generate & Copy Link"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="qr" className="space-y-4 mt-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Generate QR Code</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a QR code that people can scan with their phones to instantly join the trip.
                </p>
              </div>
              <Button 
                onClick={handleGenerateQRCode} 
                className="w-full" 
                disabled={isInviting}
              >
                {isInviting ? "Generating..." : "Download QR Code"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                <Share2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Share on Social Media</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your trip invitation directly on popular platforms.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleSocialShare('whatsapp')} 
                  variant="outline"
                  className="gap-2"
                  disabled={isInviting}
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={() => handleSocialShare('telegram')} 
                  variant="outline"
                  className="gap-2"
                  disabled={isInviting}
                >
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  Telegram
                </Button>
                <Button 
                  onClick={() => handleSocialShare('twitter')} 
                  variant="outline"
                  className="gap-2"
                  disabled={isInviting}
                >
                  <Share2 className="h-4 w-4 text-blue-400" />
                  Twitter
                </Button>
                <Button 
                  onClick={() => handleSocialShare('facebook')} 
                  variant="outline"
                  className="gap-2"
                  disabled={isInviting}
                >
                  <Share2 className="h-4 w-4 text-blue-600" />
                  Facebook
                </Button>
              </div>
              <Button 
                onClick={() => handleSocialShare('native')} 
                className="w-full" 
                disabled={isInviting}
              >
                {isInviting ? "Creating..." : "Share via Device"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};