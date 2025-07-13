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
  
  const testPreference = () => {
    console.log('=== PREFERENCE TEST ===');
    console.log('Current preferences:', profile?.travel_preferences);
    try {
      togglePreference('Adventure');
      console.log('✅ Preference toggle successful');
    } catch (error) {
      console.error('❌ Preference toggle failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Travel Preferences {saving && '(Saving...)'}</CardTitle>
          <CardDescription>Simple preference testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Button */}
          <Button onClick={testPreference} className="w-full">
            Test Preference Toggle
          </Button>
          
          {/* Simple Preferences */}
          <div className="space-y-2">
            <h4 className="font-medium">Travel Types:</h4>
            <div className="flex flex-wrap gap-2">
              {basicPreferences.map((pref) => (
                <Badge
                  key={pref}
                  variant={profile?.travel_preferences?.[pref] ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    console.log(`Clicking preference: ${pref}`);
                    togglePreference(pref);
                  }}
                >
                  {pref}
                </Badge>
              ))}
            </div>
          </div>

          {/* Simple Dietary */}
          <div className="space-y-2">
            <h4 className="font-medium">Dietary:</h4>
            <div className="flex flex-wrap gap-2">
              {basicDietary.map((item) => (
                <Badge
                  key={item}
                  variant={profile?.dietary_restrictions?.includes?.(item) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    console.log(`Clicking dietary: ${item}`);
                    toggleDietaryRestriction(item);
                  }}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Simple Accessibility */}
          <div className="space-y-2">
            <h4 className="font-medium">Accessibility:</h4>
            <div className="flex flex-wrap gap-2">
              {basicAccessibility.map((item) => (
                <Badge
                  key={item}
                  variant={profile?.accessibility_needs?.includes?.(item) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    console.log(`Clicking accessibility: ${item}`);
                    toggleAccessibilityNeed(item);
                  }}
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