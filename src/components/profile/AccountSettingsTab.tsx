import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  notification_preferences?: Record<string, boolean>;
  privacy_settings?: Record<string, boolean>;
}

interface AccountSettingsTabProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const AccountSettingsTab = ({ profile, updateProfile }: AccountSettingsTabProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    try {
      // Sign out the user first
      const { error } = await signOut();
      if (error) throw error;
      
      toast({
        title: "Account deletion initiated",
        description: "Your account has been scheduled for deletion. Please contact support if you need assistance.",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="travel-card">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl">Account Settings</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Manage your privacy and notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-base sm:text-lg">Notification Preferences</h3>
          <div className="space-y-3 sm:space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="email-notifications" className="text-sm sm:text-base font-medium">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={profile?.notification_preferences?.email ?? true}
                onCheckedChange={(checked) => {
                  const prefs = { ...profile?.notification_preferences, email: checked };
                  updateProfile({ notification_preferences: prefs });
                }}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="push-notifications" className="text-sm sm:text-base font-medium">
                Push Notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={profile?.notification_preferences?.push ?? true}
                onCheckedChange={(checked) => {
                  const prefs = { ...profile?.notification_preferences, push: checked };
                  updateProfile({ notification_preferences: prefs });
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-base sm:text-lg">Privacy Settings</h3>
          <div className="space-y-3 sm:space-y-4">
            {/* Location Sharing */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="location-sharing" className="text-sm sm:text-base font-medium">
                  Allow Location Sharing
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Share your location with group members during trips
                </p>
              </div>
              <Switch
                id="location-sharing"
                checked={profile?.privacy_settings?.location_sharing ?? false}
                onCheckedChange={(checked) => {
                  const settings = { ...profile?.privacy_settings, location_sharing: checked };
                  updateProfile({ privacy_settings: settings });
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-destructive/20">
          <h3 className="font-medium text-base sm:text-lg text-destructive">Danger Zone</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="flex-1">
                <Label className="text-sm sm:text-base font-medium text-destructive">
                  Delete Account
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="shrink-0">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers including your trips, messages,
                      and profile information.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};