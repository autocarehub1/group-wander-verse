import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { TripCard } from './TripCard';
import { CreateTripDialog } from './CreateTripDialog';

interface Trip {
  id: string;
  title: string;
  destination: string;
  description?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface TripsListProps {
  trips: Trip[];
  loading: boolean;
  onManageGroup: (tripId: string) => void;
  onTripCreated?: () => void;
}

export const TripsList = ({ trips, loading, onManageGroup, onTripCreated }: TripsListProps) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading trips...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first trip to start planning amazing group adventures.
        </p>
        <CreateTripDialog onTripCreated={onTripCreated} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onManageGroup={onManageGroup}
        />
      ))}
    </div>
  );
};