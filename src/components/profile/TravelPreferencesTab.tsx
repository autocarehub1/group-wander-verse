import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Plus, Check, X } from 'lucide-react';
import { travelPreferences, dietaryOptions, accessibilityOptions } from '@/lib/profileConstants';

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

interface TravelPreferencesTabProps {
  profile: UserProfile;
  saving: boolean;
  togglePreference: (pref: string) => void;
  toggleDietaryRestriction: (restriction: string) => void;
  toggleAccessibilityNeed: (need: string) => void;
}

export const TravelPreferencesTab = ({ 
  profile, 
  saving, 
  togglePreference, 
  toggleDietaryRestriction, 
  toggleAccessibilityNeed 
}: TravelPreferencesTabProps) => {
  // Search and custom option states
  const [travelSearch, setTravelSearch] = useState('');
  const [dietarySearch, setDietarySearch] = useState('');
  const [accessibilitySearch, setAccessibilitySearch] = useState('');
  const [customTravel, setCustomTravel] = useState('');
  const [customDietary, setCustomDietary] = useState('');
  const [customAccessibility, setCustomAccessibility] = useState('');
  const [showingCustomInputs, setShowingCustomInputs] = useState({ travel: false, dietary: false, accessibility: false });

  // Custom option handlers
  const addCustomTravel = () => {
    if (customTravel.trim()) {
      togglePreference(customTravel.trim());
      setCustomTravel('');
      setShowingCustomInputs({ ...showingCustomInputs, travel: false });
    }
  };

  const addCustomDietary = () => {
    if (customDietary.trim()) {
      toggleDietaryRestriction(customDietary.trim());
      setCustomDietary('');
      setShowingCustomInputs({ ...showingCustomInputs, dietary: false });
    }
  };

  const addCustomAccessibility = () => {
    if (customAccessibility.trim()) {
      toggleAccessibilityNeed(customAccessibility.trim());
      setCustomAccessibility('');
      setShowingCustomInputs({ ...showingCustomInputs, accessibility: false });
    }
  };

  // Filter functions
  const getFilteredTravelPreferences = () => {
    const allPrefs = [...travelPreferences];
    if (profile?.travel_preferences) {
      Object.keys(profile.travel_preferences).forEach(pref => {
        if (!allPrefs.includes(pref)) {
          allPrefs.push(pref);
        }
      });
    }
    return allPrefs.filter(pref => 
      pref.toLowerCase().includes(travelSearch.toLowerCase())
    );
  };

  const getFilteredDietaryOptions = () => {
    const allOptions = [...dietaryOptions];
    if (profile?.dietary_restrictions) {
      profile.dietary_restrictions.forEach((option: string) => {
        if (!allOptions.includes(option)) {
          allOptions.push(option);
        }
      });
    }
    return allOptions.filter(option => 
      option.toLowerCase().includes(dietarySearch.toLowerCase())
    );
  };

  const getFilteredAccessibilityOptions = () => {
    const allOptions = [...accessibilityOptions];
    if (profile?.accessibility_needs) {
      profile.accessibility_needs.forEach((option: string) => {
        if (!allOptions.includes(option)) {
          allOptions.push(option);
        }
      });
    }
    return allOptions.filter(option => 
      option.toLowerCase().includes(accessibilitySearch.toLowerCase())
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <TooltipProvider>
        <Card className="travel-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xl sm:text-2xl">Travel Preferences</span>
              {saving && <div className="flex items-center text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b border-primary mr-2"></div>
                Saving...
              </div>}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Help us personalize your travel recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search travel preferences..."
                  value={travelSearch}
                  onChange={(e) => setTravelSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowingCustomInputs({ ...showingCustomInputs, travel: !showingCustomInputs.travel })}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Custom</span>
              </Button>
            </div>
            
            {showingCustomInputs.travel && (
              <div className="flex gap-2 animate-fade-in">
                <Input
                  placeholder="Add custom travel preference..."
                  value={customTravel}
                  onChange={(e) => setCustomTravel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTravel()}
                  className="flex-1"
                />
                <Button size="sm" onClick={addCustomTravel} className="shrink-0">
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowingCustomInputs({ ...showingCustomInputs, travel: false })}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {getFilteredTravelPreferences().map((pref) => (
                <Tooltip key={pref}>
                  <TooltipTrigger>
                    <Badge
                      variant={profile?.travel_preferences?.[pref] ? "default" : "outline"}
                      className="cursor-pointer hover-scale transition-all duration-200 text-xs sm:text-sm"
                      onClick={() => togglePreference(pref)}
                    >
                      {pref}
                      {profile?.travel_preferences?.[pref] && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to {profile?.travel_preferences?.[pref] ? 'remove' : 'add'} this preference</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Dietary Restrictions
              {saving && <div className="flex items-center text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b border-primary mr-2"></div>
                Saving...
              </div>}
            </CardTitle>
            <CardDescription>
              Let group members know about your dietary needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search dietary restrictions..."
                  value={dietarySearch}
                  onChange={(e) => setDietarySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowingCustomInputs({ ...showingCustomInputs, dietary: !showingCustomInputs.dietary })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {showingCustomInputs.dietary && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom dietary restriction..."
                  value={customDietary}
                  onChange={(e) => setCustomDietary(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomDietary()}
                />
                <Button size="sm" onClick={addCustomDietary}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowingCustomInputs({ ...showingCustomInputs, dietary: false })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {getFilteredDietaryOptions().map((option) => (
                <Tooltip key={option}>
                  <TooltipTrigger>
                    <Badge
                      variant={profile.dietary_restrictions?.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleDietaryRestriction(option)}
                    >
                      {option}
                      {profile.dietary_restrictions?.includes(option) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to {profile.dietary_restrictions?.includes(option) ? 'remove' : 'add'} this restriction</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Accessibility Needs
              {saving && <div className="flex items-center text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b border-primary mr-2"></div>
                Saving...
              </div>}
            </CardTitle>
            <CardDescription>
              Help us plan trips that accommodate your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search accessibility needs..."
                  value={accessibilitySearch}
                  onChange={(e) => setAccessibilitySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowingCustomInputs({ ...showingCustomInputs, accessibility: !showingCustomInputs.accessibility })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {showingCustomInputs.accessibility && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom accessibility need..."
                  value={customAccessibility}
                  onChange={(e) => setCustomAccessibility(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomAccessibility()}
                />
                <Button size="sm" onClick={addCustomAccessibility}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowingCustomInputs({ ...showingCustomInputs, accessibility: false })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {getFilteredAccessibilityOptions().map((option) => (
                <Tooltip key={option}>
                  <TooltipTrigger>
                    <Badge
                      variant={profile.accessibility_needs?.includes(option) ? "secondary" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleAccessibilityNeed(option)}
                    >
                      {option}
                      {profile.accessibility_needs?.includes(option) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to {profile.accessibility_needs?.includes(option) ? 'remove' : 'add'} this need</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
};