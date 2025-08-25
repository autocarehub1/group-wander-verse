import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAIFeatures = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateLocationSuggestions = async (destination: string, tripId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-location-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          tripId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate location suggestions');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error generating location suggestions:', error);
      toast({
        title: "AI suggestions failed",
        description: "Using fallback suggestions instead",
        variant: "default"
      });
      return {
        activities: [
          {
            title: "Explore Local Market",
            description: "Visit the bustling local market and try authentic street food",
            location: "City Center",
            category: "culture",
            estimated_cost: 25.00,
            estimated_duration: 120
          },
          {
            title: "Historical Walking Tour",
            description: "Guided tour of historical landmarks and cultural sites",
            location: "Old Town",
            category: "culture", 
            estimated_cost: 35.00,
            estimated_duration: 180
          }
        ]
      };
    } finally {
      setLoading(false);
    }
  };

  const categorizeExpense = async (description: string, amount?: number, merchant?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/categorize-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          amount,
          merchant
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to categorize expense');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error categorizing expense:', error);
      toast({
        title: "Categorization failed",
        description: "Using default category instead",
        variant: "default"
      });
      return {
        category: 'other',
        subcategory: 'miscellaneous',
        confidence: 0.5,
        suggested_tags: []
      };
    } finally {
      setLoading(false);
    }
  };

  const generateTripDescription = async (
    destination: string, 
    startDate?: string, 
    endDate?: string, 
    groupSize?: number, 
    interests?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-trip-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          groupSize,
          interests
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate trip description');
      }

      const data = await response.json();
      return data.description;
    } catch (error: any) {
      console.error('Error generating trip description:', error);
      toast({
        title: "Description generation failed",
        description: "Using default description",
        variant: "default"
      });
      return `Explore the amazing ${destination} with your group and create unforgettable memories together.`;
    } finally {
      setLoading(false);
    }
  };

  const getTravelTips = async (
    destination: string, 
    tripType?: string, 
    season?: string, 
    budget?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-travel-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          tripType,
          season,
          budget
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get travel tips');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error getting travel tips:', error);
      toast({
        title: "Travel tips unavailable",
        description: "Please try again later",
        variant: "default"
      });
      return {
        essential_tips: ["Plan ahead and research your destination", "Pack light and bring essentials", "Stay flexible with your itinerary"],
        best_time_to_visit: "Research the best season for your destination",
        local_customs: ["Respect local culture and traditions"],
        budget_tips: ["Compare prices and book in advance", "Consider local alternatives"],
        transportation: "Research transportation options beforehand",
        safety_notes: ["Stay alert and trust your instincts", "Keep important documents secure"],
        must_try: ["Local food specialties", "Cultural landmarks"]
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    categorizeExpense,
    generateTripDescription,
    getTravelTips,
    generateLocationSuggestions,
    loading
  };
};