import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  refetchProfile: () => Promise<void>;
}

export const PersonalInfoTab = ({ profile, setProfile, updateProfile, refetchProfile }: PersonalInfoTabProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || '',
    emergency_contact_name: profile?.emergency_contact?.name || '',
    emergency_contact_phone: profile?.emergency_contact?.phone || '',
    emergency_contact_relationship: profile?.emergency_contact?.relationship || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (field: string) => {
    const value = formData[field as keyof typeof formData];
    
    if (field.startsWith('emergency_contact_')) {
      const contactField = field.replace('emergency_contact_', '');
      const emergencyContact = {
        ...profile?.emergency_contact,
        [contactField]: value
      };
      updateProfile({ emergency_contact: emergencyContact });
    } else {
      updateProfile({ [field]: value });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`/api/users/${profile?.id}/avatar`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refetch the profile from the server to get the latest avatar URL
        await refetchProfile();
        
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Unable to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card className="travel-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url} key={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-hero text-white text-2xl">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full w-8 h-8 p-0"
                  disabled={uploading}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-current"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Change Avatar'}
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
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

        {/* Emergency Contact Section */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="font-medium text-lg">Emergency Contact</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency-name" className="text-sm font-medium">Contact Name</Label>
              <Input
                id="emergency-name"
                type="text"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                onBlur={() => handleSave('emergency_contact_name')}
                placeholder="Emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-phone" className="text-sm font-medium">Contact Phone</Label>
              <Input
                id="emergency-phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                onBlur={() => handleSave('emergency_contact_phone')}
                placeholder="Emergency contact phone"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency-relationship" className="text-sm font-medium">Relationship</Label>
            <Input
              id="emergency-relationship"
              type="text"
              value={formData.emergency_contact_relationship}
              onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
              onBlur={() => handleSave('emergency_contact_relationship')}
              placeholder="Relationship (e.g., spouse, parent, friend)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};