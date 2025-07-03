import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Bed, MapPin, DollarSign, Users, Calendar, Trash2, ExternalLink, ChevronDown } from 'lucide-react';

interface AccommodationOption {
  id: string;
  name: string;
  type?: string | null;
  location?: string | null;
  price_per_night?: number | null;
  capacity?: number | null;
  check_in_date?: string | null;
  check_out_date?: string | null;
  amenities?: string[] | null;
  external_url?: string | null;
  suggested_by?: string | null;
  trip_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  external_data?: any;
}

interface AccommodationPlanningProps {
  tripId: string;
}

const popularDestinations = [
  'Paris, France', 'London, UK', 'New York, USA', 'Tokyo, Japan', 'Barcelona, Spain',
  'Rome, Italy', 'Amsterdam, Netherlands', 'Berlin, Germany', 'Madrid, Spain',
  'Prague, Czech Republic', 'Vienna, Austria', 'Budapest, Hungary', 'Istanbul, Turkey',
  'Bangkok, Thailand', 'Singapore', 'Sydney, Australia', 'Melbourne, Australia',
  'Vancouver, Canada', 'Toronto, Canada', 'Los Angeles, USA', 'San Francisco, USA',
  'Miami, USA', 'Las Vegas, USA', 'Chicago, USA', 'Boston, USA', 'Washington DC, USA',
  'Dubai, UAE', 'Cairo, Egypt', 'Cape Town, South Africa', 'Mumbai, India',
  'Delhi, India', 'Bangalore, India', 'Seoul, South Korea', 'Hong Kong',
  'Kuala Lumpur, Malaysia', 'Jakarta, Indonesia', 'Manila, Philippines',
  'Ho Chi Minh City, Vietnam', 'Hanoi, Vietnam', 'Phnom Penh, Cambodia',
  'Yangon, Myanmar', 'Colombo, Sri Lanka', 'Kathmandu, Nepal', 'Dhaka, Bangladesh',
  'Downtown', 'City Center', 'Old Town', 'Airport Area', 'Beach Front',
  'Historic District', 'Business District', 'Shopping District', 'Waterfront'
];

export const AccommodationPlanning = ({ tripId }: AccommodationPlanningProps) => {
  const [accommodations, setAccommodations] = useState<AccommodationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const [newAccommodation, setNewAccommodation] = useState({
    name: '',
    type: 'hotel',
    location: '',
    price_per_night: '',
    capacity: '',
    check_in_date: '',
    check_out_date: '',
    amenities: '',
    external_url: ''
  });
  const { toast } = useToast();

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accommodation_options')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading accommodations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccommodation = async () => {
    if (!newAccommodation.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an accommodation name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const amenitiesArray = newAccommodation.amenities
        ? newAccommodation.amenities.split(',').map(a => a.trim()).filter(a => a)
        : [];

      const { error } = await supabase
        .from('accommodation_options')
        .insert([{
          trip_id: tripId,
          name: newAccommodation.name,
          type: newAccommodation.type,
          location: newAccommodation.location || undefined,
          price_per_night: newAccommodation.price_per_night ? parseFloat(newAccommodation.price_per_night) : undefined,
          capacity: newAccommodation.capacity ? parseInt(newAccommodation.capacity) : undefined,
          check_in_date: newAccommodation.check_in_date || undefined,
          check_out_date: newAccommodation.check_out_date || undefined,
          amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined,
          external_url: newAccommodation.external_url || undefined
        }]);

      if (error) throw error;

      setNewAccommodation({
        name: '',
        type: 'hotel',
        location: '',
        price_per_night: '',
        capacity: '',
        check_in_date: '',
        check_out_date: '',
        amenities: '',
        external_url: ''
      });
      setIsAddOpen(false);
      await fetchAccommodations();
      
      toast({
        title: "Accommodation added successfully",
        description: "New accommodation option has been created."
      });
    } catch (error: any) {
      toast({
        title: "Error adding accommodation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAccommodation = async (accommodationId: string) => {
    try {
      const { error } = await supabase
        .from('accommodation_options')
        .delete()
        .eq('id', accommodationId);

      if (error) throw error;

      await fetchAccommodations();
      
      toast({
        title: "Accommodation deleted",
        description: "Accommodation option has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting accommodation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLocationChange = (value: string) => {
    setNewAccommodation({ ...newAccommodation, location: value });
    
    if (value) {
      const filtered = popularDestinations.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setFilteredLocations(filtered);
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setFilteredLocations([]);
      setShowLocationDropdown(false);
    }
  };

  const selectLocation = (location: string) => {
    setNewAccommodation({ ...newAccommodation, location });
    setShowLocationDropdown(false);
    setFilteredLocations([]);
  };

  useEffect(() => {
    fetchAccommodations();
  }, [tripId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading accommodations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Accommodation Options</h3>
          <p className="text-sm text-muted-foreground">Compare and choose where to stay</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Accommodation Option</DialogTitle>
              <DialogDescription>Add a new accommodation option for the group to consider.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="accommodation-name">Name</Label>
                <Input
                  id="accommodation-name"
                  placeholder="e.g., Hotel Magnificent"
                  value={newAccommodation.name}
                  onChange={(e) => setNewAccommodation({ ...newAccommodation, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 border rounded-md"
                    value={newAccommodation.type}
                    onChange={(e) => setNewAccommodation({ ...newAccommodation, type: e.target.value })}
                  >
                    <option value="hotel">Hotel</option>
                    <option value="hostel">Hostel</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="bnb">Bed & Breakfast</option>
                    <option value="resort">Resort</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accommodation-location">Location</Label>
                  <div className="relative" ref={locationDropdownRef}>
                    <Input
                      id="accommodation-location"
                      placeholder="e.g., Downtown Paris"
                      value={newAccommodation.location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => {
                        if (newAccommodation.location) {
                          const filtered = popularDestinations.filter(dest =>
                            dest.toLowerCase().includes(newAccommodation.location.toLowerCase())
                          ).slice(0, 8);
                          setFilteredLocations(filtered);
                          setShowLocationDropdown(filtered.length > 0);
                        }
                      }}
                    />
                    {showLocationDropdown && filteredLocations.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredLocations.map((location, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none transition-colors"
                            onClick={() => selectLocation(location)}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {location}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price-per-night">Price per Night ($)</Label>
                  <Input
                    id="price-per-night"
                    type="number"
                    placeholder="150.00"
                    value={newAccommodation.price_per_night}
                    onChange={(e) => setNewAccommodation({ ...newAccommodation, price_per_night: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (guests)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="4"
                    value={newAccommodation.capacity}
                    onChange={(e) => setNewAccommodation({ ...newAccommodation, capacity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-in">Check-in Date</Label>
                  <Input
                    id="check-in"
                    type="date"
                    value={newAccommodation.check_in_date}
                    onChange={(e) => setNewAccommodation({ ...newAccommodation, check_in_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out">Check-out Date</Label>
                  <Input
                    id="check-out"
                    type="date"
                    value={newAccommodation.check_out_date}
                    onChange={(e) => setNewAccommodation({ ...newAccommodation, check_out_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  placeholder="WiFi, Pool, Gym, Breakfast"
                  value={newAccommodation.amenities}
                  onChange={(e) => setNewAccommodation({ ...newAccommodation, amenities: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external-url">Website/Booking URL</Label>
                <Input
                  id="external-url"
                  placeholder="https://booking.com/hotel"
                  value={newAccommodation.external_url}
                  onChange={(e) => setNewAccommodation({ ...newAccommodation, external_url: e.target.value })}
                />
              </div>
              <Button onClick={addAccommodation} className="w-full">Add Accommodation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accommodations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No accommodation options yet.</p>
            <p className="text-sm text-muted-foreground">Add accommodation options to compare and decide where to stay!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accommodations.map((accommodation) => (
            <Card key={accommodation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {accommodation.name}
                      <Badge variant="outline">{accommodation.type}</Badge>
                    </CardTitle>
                    {accommodation.location && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {accommodation.location}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {accommodation.external_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(accommodation.external_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAccommodation(accommodation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    {accommodation.price_per_night && (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-4 w-4" />
                        ${accommodation.price_per_night}/night
                      </div>
                    )}
                    {accommodation.capacity && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Up to {accommodation.capacity} guests
                      </div>
                    )}
                  </div>
                  
                  {(accommodation.check_in_date || accommodation.check_out_date) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {accommodation.check_in_date && new Date(accommodation.check_in_date).toLocaleDateString()}
                      {accommodation.check_in_date && accommodation.check_out_date && ' - '}
                      {accommodation.check_out_date && new Date(accommodation.check_out_date).toLocaleDateString()}
                    </div>
                  )}
                  
                  {accommodation.amenities && accommodation.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {accommodation.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};