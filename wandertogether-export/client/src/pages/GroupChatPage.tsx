import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrips } from '@/hooks/useTrips';
import { GroupChat } from '@/components/GroupChat';

const GroupChatPage = () => {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const { trips, loading } = useTrips();

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

  if (selectedTrip) {
    const trip = trips.find(t => t.id === selectedTrip);
    if (!trip) return null;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedTrip(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip Selection
          </Button>
        </div>
        <GroupChat
          tripId={trip.id}
          tripTitle={trip.title}
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
          <h1 className="text-3xl font-bold">Group Chats</h1>
          <p className="text-muted-foreground">Select a trip to join the group chat</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-6">
            Create a trip first to start chatting with your group.
          </p>
          <Link to="/trips">
            <Button>Create Your First Trip</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {trip.destination}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(trip.status)} variant="outline">
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
                
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrip(trip.id)}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Group Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;