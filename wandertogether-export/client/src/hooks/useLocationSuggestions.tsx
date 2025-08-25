import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useLocationSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSuggestions = async (destination: string, tripId: string) => {
    if (!destination || !tripId) {
      toast({
        title: "Missing information",
        description: "Destination and trip ID are required",
        variant: "destructive"
      });
      return false;
    }

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
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();

      if (data.fallback) {
        toast({
          title: "AI Service Temporarily Unavailable",
          description: data.message || "AI suggestions are temporarily unavailable. You can add activities manually or try again later.",
          variant: "default",
        });
      } else {
        toast({
          title: "Suggestions generated!",
          description: `Generated ${data.activitiesCount || 0} activities and ${data.accommodationsCount || 0} accommodations for ${destination}`,
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error generating suggestions",
        description: error.message || "Failed to generate AI-powered suggestions",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSuggestions,
    loading
  };
};