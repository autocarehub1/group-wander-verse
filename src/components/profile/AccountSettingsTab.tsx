import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  travel_preferences?: Record<string, boolean>;
  dietary_restrictions?: any;
  accessibility_needs?: any;
  notification_preferences?: Record<string, boolean>;
  privacy_settings?: Record<string, boolean>;
  emergency_contact?: Record<string, any>;
}

interface AccountSettingsTabProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const AccountSettingsTab = ({ profile, updateProfile }: AccountSettingsTabProps) => {
  const testSettings = () => {
    console.log('=== ACCOUNT SETTINGS TESTS ===');
    console.log('1. Current notifications:', profile?.notification_preferences);
    console.log('2. Current privacy:', profile?.privacy_settings);
    console.log('3. Testing toggle...');
    const prefs = { ...profile?.notification_preferences, email: !profile?.notification_preferences?.email };
    updateProfile({ notification_preferences: prefs });
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
        {/* Test Panel for Settings */}
        <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">🧪 Settings Test</p>
          <button 
            onClick={testSettings}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          >
            Test Settings Toggle
          </button>
        </div>
        <div className="space-y-4">
          <h3 className="font-medium text-base sm:text-lg">Notification Preferences</h3>
          <div className="space-y-3 sm:space-y-4">
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
      </CardContent>
    </Card>
  );
};