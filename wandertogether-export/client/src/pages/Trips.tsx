import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrips } from '@/hooks/useTrips';
import { GroupManagement } from '@/components/GroupManagement';
import { TripsList } from '@/components/trips/TripsList';
import { CreateTripDialog } from '@/components/trips/CreateTripDialog';

const Trips = () => {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const { trips, loading } = useTrips();

  if (selectedTrip) {
    const trip = trips.find(t => t.id === selectedTrip);
    if (!trip) return null;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <Button variant="outline" onClick={() => setSelectedTrip(null)} className="h-10 sm:h-11 text-sm sm:text-base">
              ← Back to Trips
            </Button>
          </div>
          <GroupManagement
            tripId={trip.id}
            tripTitle={trip.title}
            tripDestination={trip.destination}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4 h-10 sm:h-11 text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your travel groups and adventures</p>
          </div>
          
          <div className="sm:ml-4">
            <CreateTripDialog />
          </div>
        </div>
        
        <TripsList
          trips={trips}
          loading={loading}
          onManageGroup={setSelectedTrip}
        />
      </div>
    </div>
  );
};

export default Trips;