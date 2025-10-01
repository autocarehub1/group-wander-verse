import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        // Create a new profile for the user if none exists
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          travel_preferences: {},
          dietary_restrictions: [],
          accessibility_needs: [],
          notification_preferences: { email: true, push: true, sms: false },
          privacy_settings: { profile_visibility: 'friends', location_sharing: false }
        };
        
        // Create user via API
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfile),
        });
        
        if (createResponse.ok) {
          setProfile(newProfile as UserProfile);
        } else {
          throw new Error('Failed to create user profile');
        }
      } else {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      toast({
        title: "Error updating profile",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (pref: string) => {
    const current = profile?.travel_preferences || {};
    const updated = { ...current, [pref]: !current[pref] };
    updateProfile({ travel_preferences: updated });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = profile?.dietary_restrictions || [];
    const updated = current.includes(restriction)
      ? current.filter((r: string) => r !== restriction)
      : [...current, restriction];
    updateProfile({ dietary_restrictions: updated });
  };

  const toggleAccessibilityNeed = (need: string) => {
    const current = profile?.accessibility_needs || [];
    const updated = current.includes(need)
      ? current.filter((n: string) => n !== need)
      : [...current, need];
    updateProfile({ accessibility_needs: updated });
  };

  return {
    profile,
    setProfile,
    loading,
    saving,
    updateProfile,
    togglePreference,
    toggleDietaryRestriction,
    toggleAccessibilityNeed,
    refetchProfile: fetchProfile
  };
};