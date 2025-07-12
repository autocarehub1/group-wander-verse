import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  privacy_settings?: Record<string, any>;
  emergency_contact?: Record<string, any>;
}

interface PersonalInfoTabProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const PersonalInfoTab = ({ profile, setProfile, updateProfile }: PersonalInfoTabProps) => {
  const handleFieldUpdate = (field: keyof UserProfile, value: string) => {
    // Update local state immediately
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
    // Debounce the actual update to database
    const timeoutId = setTimeout(() => {
      updateProfile({ [field]: value });
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <Card className="travel-card">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details and profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              value={profile.full_name || ''}
              onChange={(e) => {
                console.log('Full name onChange triggered:', e.target.value);
                const value = e.target.value;
                setProfile(prev => prev ? { ...prev, full_name: value } : null);
              }}
              onBlur={(e) => {
                console.log('Full name onBlur triggered:', e.target.value);
                const value = e.target.value;
                if (value !== profile.full_name) {
                  updateProfile({ full_name: value });
                }
              }}
              placeholder="Enter your full name"
              disabled={false}
              readOnly={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone || ''}
              onChange={(e) => {
                console.log('Phone onChange triggered:', e.target.value);
                const value = e.target.value;
                setProfile(prev => prev ? { ...prev, phone: value } : null);
              }}
              onBlur={(e) => {
                console.log('Phone onBlur triggered:', e.target.value);
                const value = e.target.value;
                if (value !== profile.phone) {
                  updateProfile({ phone: value });
                }
              }}
              placeholder="Enter your phone number"
              disabled={false}
              readOnly={false}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself and your travel interests..."
            value={profile.bio || ''}
            onChange={(e) => {
              console.log('Bio onChange triggered:', e.target.value);
              const value = e.target.value;
              setProfile(prev => prev ? { ...prev, bio: value } : null);
            }}
            onBlur={(e) => {
              console.log('Bio onBlur triggered:', e.target.value);
              const value = e.target.value;
              if (value !== profile.bio) {
                updateProfile({ bio: value });
              }
            }}
            disabled={false}
            readOnly={false}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={profile.date_of_birth || ''}
            onChange={(e) => {
              console.log('DOB onChange triggered:', e.target.value);
              const value = e.target.value;
              setProfile(prev => prev ? { ...prev, date_of_birth: value } : null);
            }}
            onBlur={(e) => {
              console.log('DOB onBlur triggered:', e.target.value);
              const value = e.target.value;
              if (value !== profile.date_of_birth) {
                updateProfile({ date_of_birth: value });
              }
            }}
            disabled={false}
            readOnly={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};