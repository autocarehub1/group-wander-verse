import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Trip {
  id: string;
  title: string;
  destination: string;
  description?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface TripCardProps {
  trip: Trip;
  onManageGroup: (tripId: string) => void;
}

export const TripCard = ({ trip, onManageGroup }: TripCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-1 text-base sm:text-lg">{trip.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 truncate text-xs sm:text-sm">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(trip.status ?? undefined)} whitespace-nowrap text-xs`} variant="outline">
            {trip.status || 'planning'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {trip.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {trip.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {(trip.start_date || trip.end_date) && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {trip.start_date && trip.end_date ? (
                <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              ) : trip.start_date ? (
                <span>Starts {formatDate(trip.start_date)}</span>
              ) : (
                <span>Ends {formatDate(trip.end_date ?? undefined)}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageGroup(trip.id)}
            className="w-full text-xs sm:text-sm"
            data-testid={`button-manage-group-${trip.id}`}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Manage </span>Group
          </Button>
          <Link to={`/trips/${trip.id}/activities`}>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm" data-testid={`button-activities-${trip.id}`}>
              <Compass className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Activities
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};