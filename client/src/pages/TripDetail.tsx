import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TripPlanner } from "@/components/trip-planner/TripPlanner";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

const TripDetail = () => {
  const { tripId } = useParams();
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
        } else {
          throw new Error('Failed to fetch trip');
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
        toast({
          title: "Error loading trip",
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/trips">
            <Button variant="ghost" size="sm" className="flex items-center gap-2" data-testid="button-back-to-trips">
              <ArrowLeft size={16} />
              Back to Trips
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{trip.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{trip.destination}</p>
          </div>
        </div>

        <TripPlanner 
          tripId={tripId!}
          tripTitle={trip.title}
          tripDestination={trip.destination}
        />
      </div>
    </div>
  );
};

export default TripDetail;
