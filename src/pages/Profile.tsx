import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, MapPin, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { TravelPreferencesTab } from '@/components/profile/TravelPreferencesTab';
import { AccountSettingsTab } from '@/components/profile/AccountSettingsTab';
import { TravelHistoryTab } from '@/components/profile/TravelHistoryTab';

const Profile = () => {
  const { user, signOut } = useAuth();
  const {
    profile,
    setProfile,
    loading,
    saving,
    updateProfile,
    togglePreference,
    toggleDietaryRestriction,
    toggleAccessibilityNeed
  } = useProfile();

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-hero text-white text-2xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">{profile?.full_name || 'Anonymous Traveler'}</h1>
            <p className="text-muted-foreground">{profile?.email || user?.email}</p>
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

            <TabsContent value="profile">
              <PersonalInfoTab 
                profile={profile || { 
                  id: user?.id || '',
                  email: user?.email || '',
                  full_name: '',
                  avatar_url: '',
                  phone: '',
                  bio: '',
                  date_of_birth: ''
                }} 
                setProfile={setProfile} 
                updateProfile={updateProfile} 
              />
            </TabsContent>

            <TabsContent value="preferences">
              <TravelPreferencesTab 
                profile={profile}
                saving={saving}
                togglePreference={togglePreference}
                toggleDietaryRestriction={toggleDietaryRestriction}
                toggleAccessibilityNeed={toggleAccessibilityNeed}
              />
            </TabsContent>

            <TabsContent value="settings">
              <AccountSettingsTab 
                profile={profile} 
                updateProfile={updateProfile} 
              />
            </TabsContent>

            <TabsContent value="history">
              <TravelHistoryTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;