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
  return (
    <Card className="travel-card">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your privacy and notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={profile.notification_preferences?.email ?? true}
                onCheckedChange={(checked) => {
                  const prefs = { ...profile.notification_preferences, email: checked };
                  updateProfile({ notification_preferences: prefs });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={profile.notification_preferences?.push ?? true}
                onCheckedChange={(checked) => {
                  const prefs = { ...profile.notification_preferences, push: checked };
                  updateProfile({ notification_preferences: prefs });
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Privacy Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="location-sharing">Allow Location Sharing</Label>
              <Switch
                id="location-sharing"
                checked={profile.privacy_settings?.location_sharing ?? false}
                onCheckedChange={(checked) => {
                  const settings = { ...profile.privacy_settings, location_sharing: checked };
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