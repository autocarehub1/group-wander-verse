import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    date_of_birth: ''
  });

  // Simple test function
  const testUpdate = () => {
    console.log('=== BASIC TEST ===');
    console.log('Profile exists:', !!profile);
    console.log('UpdateProfile function exists:', !!updateProfile);
    
    try {
      updateProfile({ bio: 'Test bio update' });
      console.log('✅ Update function called successfully');
    } catch (error) {
      console.error('❌ Update function failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`✏️ Input change: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (field: string) => {
    const value = formData[field as keyof typeof formData];
    console.log(`💾 Saving: ${field} = "${value}"`);
    
    try {
      updateProfile({ [field]: value });
      console.log('✅ Save successful');
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Basic profile editing test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debug Panel */}
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded">
          <h3 className="font-bold mb-2">🔧 Debug Panel</h3>
          <div className="space-y-2">
            <Button onClick={testUpdate} className="w-full">
              Test Update Function
            </Button>
            <div className="text-sm">
              <p>Profile loaded: {profile ? '✅ Yes' : '❌ No'}</p>
              <p>Current name: {profile?.full_name || 'None'}</p>
              <p>Current email: {profile?.email || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Simple Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              onBlur={() => handleSave('full_name')}
              placeholder="Type your name here"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => handleSave('phone')}
              placeholder="Type your phone here"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              onBlur={() => handleSave('bio')}
              placeholder="Type your bio here"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              onBlur={() => handleSave('date_of_birth')}
            />
          </div>
        </div>

        {/* Manual Save Button */}
        <Button 
          onClick={() => {
            console.log('Manual save clicked');
            updateProfile(formData);
          }}
          className="w-full"
        >
          Save All Changes
        </Button>
      </CardContent>
    </Card>
  );
};