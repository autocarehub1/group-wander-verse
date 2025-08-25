import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

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

const travelTypes = [
  'Adventure', 'Beach', 'City', 'Culture', 'Food', 'Nature', 'Nightlife', 
  'History', 'Art', 'Shopping', 'Photography', 'Wellness', 'Sports', 'Wildlife'
];

const budgetRanges = ['Budget', 'Mid-range', 'Luxury', 'Backpacking'];

const accommodationTypes = ['Hotel', 'Hostel', 'Airbnb', 'Resort', 'Camping', 'Boutique'];

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 
  'Keto', 'Paleo', 'Nut Allergy', 'Shellfish Allergy'
];

const accessibilityOptions = [
  'Wheelchair Access', 'Hearing Assistance', 'Visual Assistance', 
  'Mobility Support', 'Cognitive Support', 'Sign Language'
];

export const TravelPreferencesTab = ({ 
  profile, 
  saving, 
  togglePreference, 
  toggleDietaryRestriction, 
  toggleAccessibilityNeed 
}: TravelPreferencesTabProps) => {
  const [customDietary, setCustomDietary] = useState('');
  const [customAccessibility, setCustomAccessibility] = useState('');

  const handleAddCustomDietary = () => {
    if (customDietary.trim()) {
      toggleDietaryRestriction(customDietary.trim());
      setCustomDietary('');
    }
  };

  const handleAddCustomAccessibility = () => {
    if (customAccessibility.trim()) {
      toggleAccessibilityNeed(customAccessibility.trim());
      setCustomAccessibility('');
    }
  };

  const removeCustomItem = (item: string, type: 'dietary' | 'accessibility') => {
    if (type === 'dietary') {
      toggleDietaryRestriction(item);
    } else {
      toggleAccessibilityNeed(item);
    }
  };

  return (
    <div className="space-y-6">
      {/* Travel Types */}
      <Card className="travel-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl">Travel Preferences</span>
            {saving && <div className="flex items-center text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b border-primary mr-2"></div>
              Saving...
            </div>}
          </CardTitle>
          <CardDescription>
            Select your favorite types of travel experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium text-lg">Travel Types</h4>
            <div className="flex flex-wrap gap-2">
              {travelTypes.map((type) => (
                <Badge
                  key={type}
                  variant={profile?.travel_preferences?.[type] ? "default" : "outline"}
                  className="cursor-pointer hover-scale transition-all duration-200"
                  onClick={() => togglePreference(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-lg">Budget Preference</h4>
            <div className="flex flex-wrap gap-2">
              {budgetRanges.map((budget) => (
                <Badge
                  key={budget}
                  variant={profile?.travel_preferences?.[budget] ? "secondary" : "outline"}
                  className="cursor-pointer hover-scale transition-all duration-200"
                  onClick={() => togglePreference(budget)}
                >
                  {budget}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-lg">Accommodation Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {accommodationTypes.map((type) => (
                <Badge
                  key={type}
                  variant={profile?.travel_preferences?.[type] ? "secondary" : "outline"}
                  className="cursor-pointer hover-scale transition-all duration-200"
                  onClick={() => togglePreference(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card className="travel-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Dietary Restrictions</CardTitle>
          <CardDescription>
            Let trip organizers know about your dietary needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((item) => (
              <Badge
                key={item}
                variant={profile?.dietary_restrictions?.includes?.(item) ? "default" : "outline"}
                className="cursor-pointer hover-scale transition-all duration-200"
                onClick={() => toggleDietaryRestriction(item)}
              >
                {item}
              </Badge>
            ))}
          </div>
          
          {/* Custom dietary restrictions */}
          {profile?.dietary_restrictions?.filter((item: string) => !dietaryOptions.includes(item)).map((custom: string) => (
            <Badge
              key={custom}
              variant="default"
              className="cursor-pointer hover-scale transition-all duration-200"
            >
              {custom}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => removeCustomItem(custom, 'dietary')}
              />
            </Badge>
          ))}
          
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add custom dietary restriction"
              value={customDietary}
              onChange={(e) => setCustomDietary(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomDietary()}
              className="flex-1"
            />
            <Button onClick={handleAddCustomDietary} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Needs */}
      <Card className="travel-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Accessibility Needs</CardTitle>
          <CardDescription>
            Help ensure your travel experiences are accessible and comfortable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {accessibilityOptions.map((item) => (
              <Badge
                key={item}
                variant={profile?.accessibility_needs?.includes?.(item) ? "secondary" : "outline"}
                className="cursor-pointer hover-scale transition-all duration-200"
                onClick={() => toggleAccessibilityNeed(item)}
              >
                {item}
              </Badge>
            ))}
          </div>
          
          {/* Custom accessibility needs */}
          {profile?.accessibility_needs?.filter((item: string) => !accessibilityOptions.includes(item)).map((custom: string) => (
            <Badge
              key={custom}
              variant="secondary"
              className="cursor-pointer hover-scale transition-all duration-200"
            >
              {custom}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => removeCustomItem(custom, 'accessibility')}
              />
            </Badge>
          ))}
          
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add custom accessibility need"
              value={customAccessibility}
              onChange={(e) => setCustomAccessibility(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAccessibility()}
              className="flex-1"
            />
            <Button onClick={handleAddCustomAccessibility} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};