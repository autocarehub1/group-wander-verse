import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  travel_preferences?: Record<string, boolean>;
  dietary_restrictions?: any;
  accessibility_needs?: any;
}

interface TravelPreferencesTabProps {
  profile: UserProfile;
  saving: boolean;
  togglePreference: (pref: string) => void;
  toggleDietaryRestriction: (restriction: string) => void;
  toggleAccessibilityNeed: (need: string) => void;
}

const basicPreferences = ['Adventure', 'Beach', 'City', 'Culture', 'Food'];
const basicDietary = ['Vegetarian', 'Vegan', 'Gluten-Free'];
const basicAccessibility = ['Wheelchair Access', 'Hearing Assistance'];

export const TravelPreferencesTab = ({ 
  profile, 
  saving, 
  togglePreference, 
  toggleDietaryRestriction, 
  toggleAccessibilityNeed 
}: TravelPreferencesTabProps) => {

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
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
          {/* Travel Preferences */}
          <div className="space-y-2">
            <h4 className="font-medium text-base sm:text-lg">Travel Types:</h4>
            <div className="flex flex-wrap gap-2">
              {basicPreferences.map((pref) => (
                <Badge
                  key={pref}
                  variant={profile?.travel_preferences?.[pref] ? "default" : "outline"}
                  className="cursor-pointer hover-scale transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => togglePreference(pref)}
                >
                  {pref}
                </Badge>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <h4 className="font-medium text-base sm:text-lg">Dietary:</h4>
            <div className="flex flex-wrap gap-2">
              {basicDietary.map((item) => (
                <Badge
                  key={item}
                  variant={profile?.dietary_restrictions?.includes?.(item) ? "default" : "outline"}
                  className="cursor-pointer hover-scale transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => toggleDietaryRestriction(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Accessibility Needs */}
          <div className="space-y-2">
            <h4 className="font-medium text-base sm:text-lg">Accessibility:</h4>
            <div className="flex flex-wrap gap-2">
              {basicAccessibility.map((item) => (
                <Badge
                  key={item}
                  variant={profile?.accessibility_needs?.includes?.(item) ? "secondary" : "outline"}
                  className="cursor-pointer hover-scale transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => toggleAccessibilityNeed(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};