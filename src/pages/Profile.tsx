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
    <div className="min-h-screen bg-gradient-sky py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-hero text-white text-xl sm:text-2xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile?.full_name || 'Anonymous Traveler'}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{profile?.email || user?.email}</p>
            <Button onClick={handleLogout} variant="outline" className="mt-3 sm:mt-4">
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <MapPin className="w-4 h-4" />
                <span>Travel</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Star className="w-4 h-4" />
                <span>History</span>
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