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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedTrip(null)}>
            ← Back to Trips
          </Button>
        </div>
        <GroupManagement
          tripId={trip.id}
          tripTitle={trip.title}
          tripDestination={trip.destination}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="text-muted-foreground">Manage your travel groups and adventures</p>
        </div>
        
        <CreateTripDialog />
      </div>
      
      <TripsList
        trips={trips}
        loading={loading}
        onManageGroup={setSelectedTrip}
      />
    </div>
  );
};

export default Trips;