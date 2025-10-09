import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Link, Copy, QrCode, Share2, MessageCircle } from 'lucide-react';

interface TripInviteDialogProps {
  tripId: string;
}

export const TripInviteDialog = ({ tripId }: TripInviteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');
  const { toast } = useToast();

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
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const shareUrl = `${baseUrl}/join/${data.invitation_token}`;
      
      // Store the link to display
      setShareableLink(shareUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Link copied!",
        description: "Invitation link has been copied to your clipboard."
      });
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

  const copyLinkToClipboard = async () => {
    if (shareableLink) {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard."
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (shareableLink) {
      const text = `Join me on an amazing trip! Click here: ${shareableLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const shareUrl = `${baseUrl}/join/${data.invitation_token}`;
      
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
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const shareUrl = `${baseUrl}/join/${data.invitation_token}`;
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
            Create shareable links, QR codes, or share on social media.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs">
            <TabsTrigger value="link" className="gap-1">
              <Link className="h-3 w-3" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1">
              <Share2 className="h-3 w-3" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-1">
              <QrCode className="h-3 w-3" />
              <span className="hidden sm:inline">QR</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            {!shareableLink ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                  <Copy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Create Shareable Link</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate a link that can be shared via any messaging app. Anyone with this link can join the trip.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateShareableLink} 
                  className="w-full" 
                  disabled={isInviting}
                  data-testid="button-generate-link"
                >
                  {isInviting ? "Creating..." : "Generate Invitation Link"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-center mb-3">Your Invitation Link is Ready!</h3>
                  <div className="flex gap-2 items-center p-3 bg-muted rounded-lg">
                    <Input 
                      value={shareableLink} 
                      readOnly 
                      className="flex-1 bg-background"
                      data-testid="input-shareable-link"
                    />
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={copyLinkToClipboard}
                      data-testid="button-copy-link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground text-center mb-3">Share instantly via:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={shareViaWhatsApp}
                      data-testid="button-share-whatsapp"
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        const text = `Join me on an amazing trip! ${shareableLink}`;
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent('Join me on an amazing trip!')}`, '_blank');
                      }}
                      data-testid="button-share-telegram"
                    >
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      Telegram
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Join My Trip!',
                        text: 'Join me on an amazing trip!',
                        url: shareableLink,
                      });
                    } else {
                      copyLinkToClipboard();
                    }
                  }}
                  data-testid="button-share-more"
                >
                  <Share2 className="h-4 w-4" />
                  Share via More Apps
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShareableLink('')}
                  data-testid="button-create-new-link"
                >
                  Create New Link
                </Button>
              </div>
            )}
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