import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { TravelTipsCard } from "@/components/ai/TravelTipsCard";
import { SophisticatedActivityPlanner } from "@/components/activities/SophisticatedActivityPlanner";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

const ActivityPlanning = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripId) return;

      try {
        const tripResponse = await fetch(`/api/trips/${tripId}`);
        if (tripResponse.ok) {
          setTrip(await tripResponse.json());
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
        toast({
          title: "Error loading data",
          description: "Unable to load trip information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripId, toast]);

  if (loading || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/trips">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Trips
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold gradient-text">{trip.title}</h1>
            <p className="text-muted-foreground">Activity planning for {trip.destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SophisticatedActivityPlanner 
              tripId={tripId!}
              tripTitle={trip.title}
              destination={trip.destination}
            />
          </div>
          
          <div className="lg:col-span-1">
            <TravelTipsCard destination={trip.destination} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPlanning;