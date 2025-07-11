import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create a new profile for the user if none exists
        const newProfile = {
          id: user?.id,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          avatar_url: user?.user_metadata?.avatar_url || '',
          travel_preferences: {},
          dietary_restrictions: [],
          accessibility_needs: [],
          notification_preferences: { email: true, push: true, sms: false },
          privacy_settings: { profile_visibility: 'friends', location_sharing: false }
        };
        
        const { error: insertError } = await supabase
          .from('users')
          .insert(newProfile);
          
        if (insertError) throw insertError;
        setProfile(newProfile as UserProfile);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error: any) {
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
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
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
    toggleAccessibilityNeed
  };
};