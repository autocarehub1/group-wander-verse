import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase.functions.invoke('generate-location-suggestions', {
        body: {
          destination,
          tripId
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Suggestions generated!",
        description: `Generated ${data.activitiesCount || 0} activities and ${data.accommodationsCount || 0} accommodations for ${destination}`,
      });

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