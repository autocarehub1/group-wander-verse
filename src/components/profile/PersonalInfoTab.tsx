import { useState, useEffect } from 'react';
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
  const [localState, setLocalState] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || ''
  });

  // Update local state when profile changes
  useEffect(() => {
    setLocalState({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      date_of_birth: profile?.date_of_birth || ''
    });
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    console.log(`TEST: Changing ${field} to:`, value);
    setLocalState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (field: string, value: string) => {
    console.log(`TEST: Saving ${field} with value:`, value);
    updateProfile({ [field]: value });
  };

  // Test function to verify all functionality
  const runTests = () => {
    console.log('=== PROFILE COMPONENT TESTS ===');
    console.log('1. Profile data:', profile);
    console.log('2. Local state:', localState);
    console.log('3. Testing manual update...');
    updateProfile({ bio: `Test update at ${new Date().toLocaleTimeString()}` });
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
        {/* Test Panel */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">🧪 Test Panel</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={runTests}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Run Tests
            </button>
            <button 
              onClick={() => console.log('Current profile:', profile)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Log Profile
            </button>
            <button 
              onClick={() => handleSave('bio', `Auto-test ${new Date().toLocaleTimeString()}`)}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Test Save
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="full-name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="full-name"
              type="text"
              value={localState.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              onBlur={(e) => handleSave('full_name', e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={localState.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={(e) => handleSave('phone', e.target.value)}
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
            value={localState.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            onBlur={(e) => handleSave('bio', e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={localState.date_of_birth}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
            onBlur={(e) => handleSave('date_of_birth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </CardContent>
    </Card>
  );
};