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
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl">Personal Information</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Update your personal details and profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="full-name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="full-name"
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => {
                console.log('Full name changing:', e.target.value);
                const value = e.target.value;
                setProfile(prev => prev ? { ...prev, full_name: value } : null);
              }}
              onBlur={(e) => {
                console.log('Full name blur:', e.target.value);
                const value = e.target.value;
                updateProfile({ full_name: value });
              }}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => {
                console.log('Phone changing:', e.target.value);
                const value = e.target.value;
                setProfile(prev => prev ? { ...prev, phone: value } : null);
              }}
              onBlur={(e) => {
                console.log('Phone blur:', e.target.value);
                const value = e.target.value;
                updateProfile({ phone: value });
              }}
              placeholder="Enter your phone number"
              autoComplete="tel"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself and your travel interests..."
            value={profile?.bio || ''}
            onChange={(e) => {
              console.log('Bio changing:', e.target.value);
              const value = e.target.value;
              setProfile(prev => prev ? { ...prev, bio: value } : null);
            }}
            onBlur={(e) => {
              console.log('Bio blur:', e.target.value);
              const value = e.target.value;
              updateProfile({ bio: value });
            }}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={profile?.date_of_birth || ''}
            onChange={(e) => {
              console.log('DOB changing:', e.target.value);
              const value = e.target.value;
              setProfile(prev => prev ? { ...prev, date_of_birth: value } : null);
            }}
            onBlur={(e) => {
              console.log('DOB blur:', e.target.value);
              const value = e.target.value;
              updateProfile({ date_of_birth: value });
            }}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </CardContent>
    </Card>
  );
};