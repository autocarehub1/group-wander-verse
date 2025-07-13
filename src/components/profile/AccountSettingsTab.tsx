import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

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
  const testSettings = () => {
    console.log('=== SETTINGS TEST ===');
    console.log('Current notifications:', profile?.notification_preferences);
    console.log('Current privacy:', profile?.privacy_settings);
    
    try {
      const prefs = { 
        ...profile?.notification_preferences, 
        email: !profile?.notification_preferences?.email 
      };
      updateProfile({ notification_preferences: prefs });
      console.log('✅ Settings update successful');
    } catch (error) {
      console.error('❌ Settings update failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Simple settings testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Button */}
        <Button onClick={testSettings} className="w-full">
          Test Settings Toggle
        </Button>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notif">Email Notifications</Label>
          <Switch
            id="email-notif"
            checked={profile?.notification_preferences?.email ?? true}
            onCheckedChange={(checked) => {
              console.log('Email notification toggle:', checked);
              const prefs = { ...profile?.notification_preferences, email: checked };
              updateProfile({ notification_preferences: prefs });
            }}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notif">Push Notifications</Label>
          <Switch
            id="push-notif"
            checked={profile?.notification_preferences?.push ?? true}
            onCheckedChange={(checked) => {
              console.log('Push notification toggle:', checked);
              const prefs = { ...profile?.notification_preferences, push: checked };
              updateProfile({ notification_preferences: prefs });
            }}
          />
        </div>

        {/* Location Sharing */}
        <div className="flex items-center justify-between">
          <Label htmlFor="location">Location Sharing</Label>
          <Switch
            id="location"
            checked={profile?.privacy_settings?.location_sharing ?? false}
            onCheckedChange={(checked) => {
              console.log('Location sharing toggle:', checked);
              const settings = { ...profile?.privacy_settings, location_sharing: checked };
              updateProfile({ privacy_settings: settings });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};