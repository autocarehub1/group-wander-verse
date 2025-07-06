import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTrips } from '@/hooks/useTrips';
import { GroupManagement } from '@/components/GroupManagement';
import { MapPin, Plus, Calendar, Users, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Trips = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const { trips, loading, createTrip } = useTrips();
  const navigate = useNavigate();

  const handleCreateTrip = async () => {
    if (!formData.title.trim() || !formData.destination.trim()) {
      return;
    }

    const result = await createTrip({
      title: formData.title,
      destination: formData.destination,
      description: formData.description || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined
    });

    if (result) {
      setFormData({
        title: '',
        destination: '',
        description: '',
        start_date: '',
        end_date: ''
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
              <DialogDescription>
                Start planning your next adventure by creating a new trip group.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Europe Adventure"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, France"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell your group about this trip..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCreateTrip} 
                className="w-full"
                disabled={!formData.title.trim() || !formData.destination.trim()}
              >
                Create Trip
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first trip to start planning amazing group adventures.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Trip
          </Button>
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
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(trip.start_date || trip.end_date) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {trip.start_date && trip.end_date ? (
                        <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                      ) : trip.start_date ? (
                        <span>Starts {formatDate(trip.start_date)}</span>
                      ) : (
                        <span>Ends {formatDate(trip.end_date)}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrip(trip.id)}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Group
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

export default Trips;