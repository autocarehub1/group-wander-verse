import { useState } from 'react';
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
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (field: string) => {
    const value = formData[field as keyof typeof formData];
    updateProfile({ [field]: value });
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
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              onBlur={() => handleSave('full_name')}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => handleSave('phone')}
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
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            onBlur={() => handleSave('bio')}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            onBlur={() => handleSave('date_of_birth')}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </CardContent>
    </Card>
  );
};