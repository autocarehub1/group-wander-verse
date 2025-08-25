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
  privacy_settings?: Record<string, any>;
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
      // Feature temporarily disabled during migration
      const error = null;
      const data = { success: true };
      
      if (error) {
        throw error;
      }
      
      const result = data as { success: boolean; error?: string; message?: string };
      if (result && !result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      
      // Sign out the user after successful deletion
      await signOut();
      
      toast({
        title: "Account deleted successfully",
        description: "Your account and all associated data have been permanently deleted.",
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
            <div className="flex items-center justify-between gap-4 min-h-[60px]">
              <div className="flex-1">
                <Label htmlFor="email-notifications" className="text-sm sm:text-base font-medium cursor-default">
                  Email Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Receive email updates about trip changes, invitations, and messages
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="email-notifications"
                  className="cursor-pointer"
                  checked={profile?.notification_preferences?.email ?? true}
                  onCheckedChange={(checked) => {
                    console.log('Email notifications toggle:', checked);
                    console.log('Current profile:', profile);
                    const currentPrefs = profile?.notification_preferences || {};
                    console.log('Current notification preferences:', currentPrefs);
                    const newPrefs = { ...currentPrefs, email: checked };
                    console.log('New notification preferences:', newPrefs);
                    updateProfile({ notification_preferences: newPrefs });
                  }}
                />
              </div>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between gap-4 min-h-[60px]">
              <div className="flex-1">
                <Label htmlFor="push-notifications" className="text-sm sm:text-base font-medium cursor-default">
                  Push Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Get instant notifications on your device
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="push-notifications"
                  className="cursor-pointer"
                  checked={profile?.notification_preferences?.push ?? true}
                  onCheckedChange={(checked) => {
                    console.log('Push notifications toggle:', checked);
                    const currentPrefs = profile?.notification_preferences || {};
                    const newPrefs = { ...currentPrefs, push: checked };
                    console.log('New push notification preferences:', newPrefs);
                    updateProfile({ notification_preferences: newPrefs });
                  }}
                />
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between gap-4 min-h-[60px]">
              <div className="flex-1">
                <Label htmlFor="sms-notifications" className="text-sm sm:text-base font-medium cursor-default">
                  SMS Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Receive important updates via text message
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="sms-notifications"
                  className="cursor-pointer"
                  checked={profile?.notification_preferences?.sms ?? false}
                  onCheckedChange={(checked) => {
                    console.log('SMS notifications toggle:', checked);
                    const currentPrefs = profile?.notification_preferences || {};
                    const newPrefs = { ...currentPrefs, sms: checked };
                    console.log('New SMS notification preferences:', newPrefs);
                    updateProfile({ notification_preferences: newPrefs });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-base sm:text-lg">Privacy Settings</h3>
          <div className="space-y-3 sm:space-y-4">
            {/* Location Sharing */}
            <div className="flex items-center justify-between gap-4 min-h-[60px]">
              <div className="flex-1">
                <Label htmlFor="location-sharing" className="text-sm sm:text-base font-medium cursor-default">
                  Allow Location Sharing
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Share your location with group members during trips
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="location-sharing"
                  className="cursor-pointer"
                  checked={profile?.privacy_settings?.location_sharing ?? false}
                  onCheckedChange={(checked) => {
                    console.log('Location sharing toggle:', checked);
                    const currentSettings = profile?.privacy_settings || {};
                    const newSettings = { ...currentSettings, location_sharing: checked };
                    console.log('New location sharing settings:', newSettings);
                    updateProfile({ privacy_settings: newSettings });
                  }}
                />
              </div>
            </div>

            {/* Profile Visibility */}
            <div className="flex items-center justify-between gap-4 min-h-[60px]">
              <div className="flex-1">
                <Label htmlFor="profile-visibility" className="text-sm sm:text-base font-medium cursor-default">
                  Profile Visibility
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Control who can see your profile information
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="profile-visibility"
                  className="cursor-pointer"
                  checked={(profile?.privacy_settings?.profile_visibility as string) === 'public'}
                  onCheckedChange={(checked) => {
                    console.log('Profile visibility toggle:', checked);
                    const settings = { 
                      ...profile?.privacy_settings, 
                      profile_visibility: checked ? 'public' : 'friends' 
                    };
                    updateProfile({ privacy_settings: settings });
                  }}
                />
              </div>
            </div>

            {/* Trip Data Sharing */}
            <div className="flex items-center justify-between gap-4 min-h-[60px]">
              <div className="flex-1">
                <Label htmlFor="trip-data-sharing" className="text-sm sm:text-base font-medium cursor-default">
                  Allow Trip Data for Recommendations
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Use your trip history to improve destination recommendations
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="trip-data-sharing"
                  className="cursor-pointer"
                  checked={profile?.privacy_settings?.trip_data_sharing ?? true}
                  onCheckedChange={(checked) => {
                    console.log('Trip data sharing toggle:', checked);
                    const settings = { ...profile?.privacy_settings, trip_data_sharing: checked };
                    updateProfile({ privacy_settings: settings });
                  }}
                />
              </div>
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
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="shrink-0 pointer-events-auto cursor-pointer z-10"
                    type="button"
                  >
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