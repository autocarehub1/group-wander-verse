import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { User, Settings, MapPin, Star, Calendar } from 'lucide-react';
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
  privacy_settings?: Record<string, boolean>;
  emergency_contact?: Record<string, any>;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const travelPreferences = [
    'Adventure', 'Beach', 'City', 'Culture', 'Food', 'History', 
    'Nature', 'Nightlife', 'Photography', 'Relaxation', 'Shopping', 'Sports'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy', 
    'Shellfish Allergy', 'Halal', 'Kosher', 'Keto', 'Paleo'
  ];

  const accessibilityOptions = [
    'Wheelchair Access', 'Hearing Assistance', 'Visual Assistance', 
    'Mobility Support', 'Cognitive Support', 'Service Animal'
  ];

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
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
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

  const handleLogout = async () => {
    await signOut();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-hero text-white text-2xl">
                {profile.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">{profile.full_name || 'Anonymous Traveler'}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <Button onClick={handleLogout} variant="outline" className="mt-4">
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <MapPin className="w-4 h-4 mr-2" />
                Travel
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="history">
                <Star className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
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
                        onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                        onBlur={(e) => updateProfile({ full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        onBlur={(e) => updateProfile({ phone: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself and your travel interests..."
                      value={profile.bio || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                      onBlur={(e) => updateProfile({ bio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, date_of_birth: e.target.value } : null)}
                      onBlur={(e) => updateProfile({ date_of_birth: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Travel Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Travel Preferences</CardTitle>
                  <CardDescription>
                    Help us personalize your travel recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {travelPreferences.map((pref) => (
                      <Badge
                        key={pref}
                        variant={profile.travel_preferences?.[pref] ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePreference(pref)}
                      >
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Dietary Restrictions</CardTitle>
                  <CardDescription>
                    Let group members know about your dietary needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={profile.dietary_restrictions?.includes(option) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDietaryRestriction(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Accessibility Needs</CardTitle>
                  <CardDescription>
                    Help us plan trips that accommodate your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {accessibilityOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={profile.accessibility_needs?.includes(option) ? "secondary" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleAccessibilityNeed(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
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
            </TabsContent>

            {/* Travel History Tab */}
            <TabsContent value="history">
              <Card className="travel-card">
                <CardHeader>
                  <CardTitle>Travel History</CardTitle>
                  <CardDescription>
                    Your past adventures and reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Travel History Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start planning your first group adventure to see your travel history here.
                    </p>
                    <Button variant="hero">Plan Your First Trip</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;