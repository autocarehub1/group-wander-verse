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

const worldLocations = [
  // Major Cities - North America
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA', 'Philadelphia, USA', 'San Antonio, USA', 'San Diego, USA', 'Dallas, USA', 'San Jose, USA', 'Austin, USA', 'San Francisco, USA', 'Seattle, USA', 'Denver, USA', 'Washington DC, USA', 'Boston, USA', 'Las Vegas, USA', 'Portland, USA', 'Miami, USA', 'Atlanta, USA',
  'Toronto, Canada', 'Montreal, Canada', 'Vancouver, Canada', 'Calgary, Canada', 'Edmonton, Canada', 'Ottawa, Canada', 'Winnipeg, Canada', 'Quebec City, Canada', 'Hamilton, Canada', 'Victoria, Canada',
  'Mexico City, Mexico', 'Guadalajara, Mexico', 'Monterrey, Mexico', 'Puebla, Mexico', 'Tijuana, Mexico', 'León, Mexico', 'Cancún, Mexico', 'Playa del Carmen, Mexico', 'Puerto Vallarta, Mexico', 'Acapulco, Mexico',
  
  // Europe
  'London, UK', 'Birmingham, UK', 'Manchester, UK', 'Edinburgh, UK', 'Liverpool, UK', 'Bristol, UK', 'Glasgow, UK', 'Cardiff, UK', 'Belfast, UK', 'Brighton, UK',
  'Paris, France', 'Marseille, France', 'Lyon, France', 'Toulouse, France', 'Nice, France', 'Nantes, France', 'Strasbourg, France', 'Montpellier, France', 'Bordeaux, France', 'Cannes, France',
  'Berlin, Germany', 'Hamburg, Germany', 'Munich, Germany', 'Cologne, Germany', 'Frankfurt, Germany', 'Stuttgart, Germany', 'Düsseldorf, Germany', 'Dortmund, Germany', 'Dresden, Germany', 'Leipzig, Germany',
  'Rome, Italy', 'Milan, Italy', 'Naples, Italy', 'Turin, Italy', 'Palermo, Italy', 'Genoa, Italy', 'Bologna, Italy', 'Florence, Italy', 'Venice, Italy', 'Verona, Italy',
  'Madrid, Spain', 'Barcelona, Spain', 'Valencia, Spain', 'Seville, Spain', 'Zaragoza, Spain', 'Málaga, Spain', 'Bilbao, Spain', 'Palma, Spain', 'Las Palmas, Spain', 'Granada, Spain',
  'Amsterdam, Netherlands', 'Rotterdam, Netherlands', 'The Hague, Netherlands', 'Utrecht, Netherlands', 'Eindhoven, Netherlands', 'Groningen, Netherlands', 'Haarlem, Netherlands', 'Maastricht, Netherlands',
  'Vienna, Austria', 'Graz, Austria', 'Linz, Austria', 'Salzburg, Austria', 'Innsbruck, Austria', 'Hallstatt, Austria',
  'Prague, Czech Republic', 'Brno, Czech Republic', 'Ostrava, Czech Republic', 'Plzen, Czech Republic', 'Liberec, Czech Republic',
  'Budapest, Hungary', 'Debrecen, Hungary', 'Szeged, Hungary', 'Pécs, Hungary', 'Győr, Hungary',
  'Stockholm, Sweden', 'Gothenburg, Sweden', 'Malmö, Sweden', 'Uppsala, Sweden', 'Västerås, Sweden',
  'Oslo, Norway', 'Bergen, Norway', 'Stavanger, Norway', 'Trondheim, Norway', 'Tromsø, Norway',
  'Copenhagen, Denmark', 'Aarhus, Denmark', 'Odense, Denmark', 'Aalborg, Denmark', 'Esbjerg, Denmark',
  'Helsinki, Finland', 'Espoo, Finland', 'Tampere, Finland', 'Vantaa, Finland', 'Turku, Finland',
  'Reykjavik, Iceland', 'Akureyri, Iceland', 'Kópavogur, Iceland', 'Hafnarfjörður, Iceland',
  'Dublin, Ireland', 'Cork, Ireland', 'Limerick, Ireland', 'Galway, Ireland', 'Waterford, Ireland',
  'Warsaw, Poland', 'Kraków, Poland', 'Łódź, Poland', 'Wrocław, Poland', 'Poznań, Poland', 'Gdańsk, Poland',
  'Bucharest, Romania', 'Cluj-Napoca, Romania', 'Timișoara, Romania', 'Iași, Romania', 'Constanța, Romania', 'Brașov, Romania',
  'Sofia, Bulgaria', 'Plovdiv, Bulgaria', 'Varna, Bulgaria', 'Burgas, Bulgaria', 'Ruse, Bulgaria',
  'Zagreb, Croatia', 'Split, Croatia', 'Rijeka, Croatia', 'Osijek, Croatia', 'Zadar, Croatia', 'Dubrovnik, Croatia',
  'Athens, Greece', 'Thessaloniki, Greece', 'Patras, Greece', 'Heraklion, Greece', 'Santorini, Greece', 'Mykonos, Greece',
  'Istanbul, Turkey', 'Ankara, Turkey', 'Izmir, Turkey', 'Bursa, Turkey', 'Antalya, Turkey', 'Cappadocia, Turkey',
  'Moscow, Russia', 'Saint Petersburg, Russia', 'Novosibirsk, Russia', 'Yekaterinburg, Russia', 'Kazan, Russia',
  'Lisbon, Portugal', 'Porto, Portugal', 'Braga, Portugal', 'Coimbra, Portugal', 'Funchal, Portugal',

  // Asia
  'Tokyo, Japan', 'Osaka, Japan', 'Kyoto, Japan', 'Yokohama, Japan', 'Nagoya, Japan', 'Sapporo, Japan', 'Fukuoka, Japan', 'Hiroshima, Japan', 'Sendai, Japan', 'Nara, Japan',
  'Beijing, China', 'Shanghai, China', 'Guangzhou, China', 'Shenzhen, China', 'Chengdu, China', 'Hangzhou, China', 'Nanjing, China', 'Wuhan, China', 'Xian, China', 'Suzhou, China',
  'Seoul, South Korea', 'Busan, South Korea', 'Incheon, South Korea', 'Daegu, South Korea', 'Daejeon, South Korea', 'Gwangju, South Korea', 'Jeju City, South Korea',
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Chennai, India', 'Kolkata, India', 'Pune, India', 'Jaipur, India', 'Goa, India', 'Kerala, India',
  'Bangkok, Thailand', 'Chiang Mai, Thailand', 'Phuket, Thailand', 'Pattaya, Thailand', 'Krabi, Thailand', 'Koh Samui, Thailand', 'Ayutthaya, Thailand',
  'Singapore, Singapore', 'Sentosa, Singapore', 'Marina Bay, Singapore', 'Orchard Road, Singapore',
  'Kuala Lumpur, Malaysia', 'George Town, Malaysia', 'Johor Bahru, Malaysia', 'Malacca City, Malaysia', 'Kota Kinabalu, Malaysia', 'Langkawi, Malaysia',
  'Jakarta, Indonesia', 'Bali, Indonesia', 'Yogyakarta, Indonesia', 'Surabaya, Indonesia', 'Bandung, Indonesia', 'Medan, Indonesia', 'Lombok, Indonesia',
  'Manila, Philippines', 'Cebu City, Philippines', 'Davao, Philippines', 'Boracay, Philippines', 'Palawan, Philippines', 'Baguio, Philippines',
  'Ho Chi Minh City, Vietnam', 'Hanoi, Vietnam', 'Da Nang, Vietnam', 'Hoi An, Vietnam', 'Nha Trang, Vietnam', 'Hue, Vietnam', 'Ha Long, Vietnam',
  'Phnom Penh, Cambodia', 'Siem Reap, Cambodia', 'Sihanoukville, Cambodia', 'Battambang, Cambodia',
  'Yangon, Myanmar', 'Mandalay, Myanmar', 'Bagan, Myanmar', 'Inle Lake, Myanmar',
  'Vientiane, Laos', 'Luang Prabang, Laos', 'Pakse, Laos', 'Vang Vieng, Laos',
  'Colombo, Sri Lanka', 'Kandy, Sri Lanka', 'Galle, Sri Lanka', 'Sigiriya, Sri Lanka', 'Ella, Sri Lanka',
  'Kathmandu, Nepal', 'Pokhara, Nepal', 'Chitwan, Nepal', 'Lumbini, Nepal',
  'Dhaka, Bangladesh', 'Chittagong, Bangladesh', 'Sylhet, Bangladesh', 'Cox\'s Bazar, Bangladesh',

  // Middle East
  'Dubai, UAE', 'Abu Dhabi, UAE', 'Sharjah, UAE', 'Al Ain, UAE', 'Fujairah, UAE',
  'Riyadh, Saudi Arabia', 'Jeddah, Saudi Arabia', 'Mecca, Saudi Arabia', 'Medina, Saudi Arabia', 'Dammam, Saudi Arabia',
  'Tehran, Iran', 'Isfahan, Iran', 'Shiraz, Iran', 'Tabriz, Iran', 'Mashhad, Iran',
  'Baghdad, Iraq', 'Basra, Iraq', 'Erbil, Iraq', 'Mosul, Iraq', 'Sulaymaniyah, Iraq',
  'Doha, Qatar', 'Al Rayyan, Qatar', 'Al Wakrah, Qatar', 'Al Khor, Qatar',
  'Kuwait City, Kuwait', 'Hawalli, Kuwait', 'Salmiya, Kuwait', 'Ahmadi, Kuwait',
  'Manama, Bahrain', 'Riffa, Bahrain', 'Muharraq, Bahrain', 'Hamad Town, Bahrain',
  'Muscat, Oman', 'Salalah, Oman', 'Sohar, Oman', 'Nizwa, Oman',
  'Amman, Jordan', 'Petra, Jordan', 'Aqaba, Jordan', 'Jerash, Jordan', 'Wadi Rum, Jordan',
  'Damascus, Syria', 'Aleppo, Syria', 'Homs, Syria', 'Latakia, Syria',
  'Beirut, Lebanon', 'Tripoli, Lebanon', 'Sidon, Lebanon', 'Tyre, Lebanon',
  'Tel Aviv, Israel', 'Jerusalem, Israel', 'Haifa, Israel', 'Eilat, Israel', 'Dead Sea, Israel',

  // Africa
  'Cairo, Egypt', 'Alexandria, Egypt', 'Luxor, Egypt', 'Aswan, Egypt', 'Hurghada, Egypt', 'Sharm El Sheikh, Egypt',
  'Lagos, Nigeria', 'Abuja, Nigeria', 'Kano, Nigeria', 'Ibadan, Nigeria', 'Port Harcourt, Nigeria',
  'Johannesburg, South Africa', 'Cape Town, South Africa', 'Durban, South Africa', 'Pretoria, South Africa', 'Port Elizabeth, South Africa',
  'Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Nakuru, Kenya', 'Masai Mara, Kenya',
  'Dar es Salaam, Tanzania', 'Arusha, Tanzania', 'Zanzibar, Tanzania', 'Mwanza, Tanzania', 'Serengeti, Tanzania',
  'Addis Ababa, Ethiopia', 'Dire Dawa, Ethiopia', 'Mekelle, Ethiopia', 'Bahir Dar, Ethiopia',
  'Kampala, Uganda', 'Entebbe, Uganda', 'Jinja, Uganda', 'Mbarara, Uganda',
  'Kigali, Rwanda', 'Butare, Rwanda', 'Gisenyi, Rwanda', 'Musanze, Rwanda',
  'Lusaka, Zambia', 'Kitwe, Zambia', 'Ndola, Zambia', 'Livingstone, Zambia',
  'Harare, Zimbabwe', 'Bulawayo, Zimbabwe', 'Mutare, Zimbabwe', 'Victoria Falls, Zimbabwe',
  'Casablanca, Morocco', 'Rabat, Morocco', 'Marrakech, Morocco', 'Fez, Morocco', 'Tangier, Morocco',
  'Tunis, Tunisia', 'Sfax, Tunisia', 'Sousse, Tunisia', 'Kairouan, Tunisia',
  'Algiers, Algeria', 'Oran, Algeria', 'Constantine, Algeria', 'Annaba, Algeria',
  'Tripoli, Libya', 'Benghazi, Libya', 'Misrata, Libya', 'Bayda, Libya',

  // Oceania
  'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia', 'Adelaide, Australia', 'Gold Coast, Australia', 'Canberra, Australia', 'Darwin, Australia', 'Cairns, Australia', 'Hobart, Australia',
  'Auckland, New Zealand', 'Wellington, New Zealand', 'Christchurch, New Zealand', 'Hamilton, New Zealand', 'Tauranga, New Zealand', 'Dunedin, New Zealand', 'Queenstown, New Zealand', 'Rotorua, New Zealand',
  'Port Moresby, Papua New Guinea', 'Lae, Papua New Guinea', 'Mount Hagen, Papua New Guinea',
  'Suva, Fiji', 'Nadi, Fiji', 'Lautoka, Fiji', 'Labasa, Fiji',
  'Nouméa, New Caledonia', 'Papeete, French Polynesia', 'Apia, Samoa', 'Nuku\'alofa, Tonga',

  // South America
  'São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Brasília, Brazil', 'Salvador, Brazil', 'Fortaleza, Brazil', 'Belo Horizonte, Brazil', 'Manaus, Brazil', 'Recife, Brazil', 'Porto Alegre, Brazil', 'Curitiba, Brazil',
  'Buenos Aires, Argentina', 'Córdoba, Argentina', 'Rosario, Argentina', 'Mendoza, Argentina', 'Mar del Plata, Argentina', 'Salta, Argentina', 'Bariloche, Argentina', 'Ushuaia, Argentina',
  'Lima, Peru', 'Arequipa, Peru', 'Cusco, Peru', 'Trujillo, Peru', 'Iquitos, Peru', 'Machu Picchu, Peru',
  'Bogotá, Colombia', 'Medellín, Colombia', 'Cali, Colombia', 'Barranquilla, Colombia', 'Cartagena, Colombia', 'Santa Marta, Colombia',
  'Santiago, Chile', 'Valparaíso, Chile', 'Concepción, Chile', 'Antofagasta, Chile', 'Viña del Mar, Chile', 'Atacama Desert, Chile',
  'Caracas, Venezuela', 'Maracaibo, Venezuela', 'Valencia, Venezuela', 'Maracay, Venezuela', 'Angel Falls, Venezuela',
  'Quito, Ecuador', 'Guayaquil, Ecuador', 'Cuenca, Ecuador', 'Galápagos Islands, Ecuador',
  'La Paz, Bolivia', 'Santa Cruz, Bolivia', 'Cochabamba, Bolivia', 'Sucre, Bolivia', 'Uyuni, Bolivia',
  'Asunción, Paraguay', 'Ciudad del Este, Paraguay', 'San Lorenzo, Paraguay',
  'Montevideo, Uruguay', 'Punta del Este, Uruguay', 'Salto, Uruguay',

  // Central America & Caribbean
  'Havana, Cuba', 'Santiago de Cuba, Cuba', 'Varadero, Cuba', 'Trinidad, Cuba',
  'Kingston, Jamaica', 'Montego Bay, Jamaica', 'Negril, Jamaica', 'Ocho Rios, Jamaica',
  'Santo Domingo, Dominican Republic', 'Santiago, Dominican Republic', 'Punta Cana, Dominican Republic', 'Puerto Plata, Dominican Republic',
  'Port-au-Prince, Haiti', 'Cap-Haïtien, Haiti', 'Jacmel, Haiti',
  'San Juan, Puerto Rico', 'Ponce, Puerto Rico', 'Bayamón, Puerto Rico',
  'Bridgetown, Barbados', 'Speightstown, Barbados', 'Oistins, Barbados',
  'Port of Spain, Trinidad and Tobago', 'San Fernando, Trinidad and Tobago', 'Scarborough, Trinidad and Tobago',

  // Location Types
  'Downtown', 'City Center', 'Old Town', 'Historic District', 'Business District', 'Financial District', 'Shopping District', 'Entertainment District', 'Arts District', 'Waterfront', 'Harbor', 'Marina', 'Beach Front', 'Beachside', 'Seaside', 'Oceanfront', 'Lakefront', 'Riverside', 'Airport Area', 'Near Airport', 'Train Station Area', 'Convention Center', 'Stadium District', 'University Area', 'Chinatown', 'Little Italy', 'French Quarter', 'Midtown', 'Uptown', 'Suburb', 'Mountain View', 'Valley', 'Hillside', 'Countryside', 'Village Center', 'Town Square'
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
      const filtered = worldLocations.filter(dest =>
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
                          const filtered = worldLocations.filter(dest =>
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