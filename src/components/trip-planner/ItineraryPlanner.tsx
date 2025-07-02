import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';

interface ItineraryItem {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  category?: string | null;
  cost?: number | null;
  order_index?: number | null;
  day_id: string;
  trip_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  status?: string | null;
}

interface ItineraryDay {
  id: string;
  day_date: string;
  title?: string;
  description?: string;
  items: ItineraryItem[];
}

interface ItineraryPlannerProps {
  tripId: string;
}

export const ItineraryPlanner = ({ tripId }: ItineraryPlannerProps) => {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDayOpen, setIsAddDayOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [newDay, setNewDay] = useState({ date: '', title: '', description: '' });
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    category: 'activity',
    cost: ''
  });
  const { toast } = useToast();

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      
      // Fetch itinerary days
      const { data: daysData, error: daysError } = await supabase
        .from('itinerary_days')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_date', { ascending: true });

      if (daysError) throw daysError;

      // Fetch itinerary items for all days
      const { data: itemsData, error: itemsError } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (itemsError) throw itemsError;

      // Group items by day
      const daysWithItems = (daysData || []).map(day => ({
        ...day,
        items: (itemsData || []).filter(item => item.day_id === day.id)
      }));

      setDays(daysWithItems);
    } catch (error: any) {
      toast({
        title: "Error loading itinerary",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addDay = async () => {
    if (!newDay.date.trim()) {
      toast({
        title: "Date required",
        description: "Please select a date for the itinerary day.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('itinerary_days')
        .insert([{
          trip_id: tripId,
          day_date: newDay.date,
          title: newDay.title || undefined,
          description: newDay.description || undefined
        }]);

      if (error) throw error;

      setNewDay({ date: '', title: '', description: '' });
      setIsAddDayOpen(false);
      await fetchItinerary();
      
      toast({
        title: "Day added successfully",
        description: "New itinerary day has been created."
      });
    } catch (error: any) {
      toast({
        title: "Error adding day",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addItem = async () => {
    if (!newItem.title.trim() || !selectedDayId) {
      toast({
        title: "Required fields missing",
        description: "Please enter a title and select a day.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('itinerary_items')
        .insert([{
          trip_id: tripId,
          day_id: selectedDayId,
          title: newItem.title,
          description: newItem.description || undefined,
          location: newItem.location || undefined,
          start_time: newItem.start_time || undefined,
          end_time: newItem.end_time || undefined,
          category: newItem.category,
          cost: newItem.cost ? parseFloat(newItem.cost) : undefined
        }]);

      if (error) throw error;

      setNewItem({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        category: 'activity',
        cost: ''
      });
      setIsAddItemOpen(false);
      setSelectedDayId('');
      await fetchItinerary();
      
      toast({
        title: "Activity added successfully",
        description: "New itinerary item has been created."
      });
    } catch (error: any) {
      toast({
        title: "Error adding activity",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchItinerary();
      
      toast({
        title: "Activity deleted",
        description: "Itinerary item has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting activity",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  if (loading) {
    return <div className="text-center py-8">Loading itinerary...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Trip Itinerary</h3>
          <p className="text-sm text-muted-foreground">Plan your daily activities and schedule</p>
        </div>
        <Dialog open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Day
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Itinerary Day</DialogTitle>
              <DialogDescription>Create a new day for your trip itinerary.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDay.date}
                  onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Arrival Day, City Tour"
                  value={newDay.title}
                  onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the day's plan"
                  value={newDay.description}
                  onChange={(e) => setNewDay({ ...newDay, description: e.target.value })}
                />
              </div>
              <Button onClick={addDay} className="w-full">Add Day</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {days.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No itinerary days created yet.</p>
            <p className="text-sm text-muted-foreground">Add your first day to start planning your trip!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <Card key={day.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {new Date(day.day_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    {day.title && <CardDescription className="font-medium">{day.title}</CardDescription>}
                    {day.description && <CardDescription>{day.description}</CardDescription>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDayId(day.id);
                      setIsAddItemOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {day.items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No activities planned for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {day.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge variant="outline">{item.category}</Badge>
                            {item.cost && (
                              <Badge variant="secondary">${item.cost}</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {(item.start_time || item.end_time) && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.start_time && item.end_time
                                  ? `${item.start_time} - ${item.end_time}`
                                  : item.start_time || item.end_time}
                              </div>
                            )}
                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>Add a new activity to your itinerary.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-title">Title</Label>
              <Input
                id="activity-title"
                placeholder="e.g., Visit Eiffel Tower"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-description">Description</Label>
              <Textarea
                id="activity-description"
                placeholder="Details about the activity"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newItem.start_time}
                  onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newItem.end_time}
                  onChange={(e) => setNewItem({ ...newItem, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Paris, France"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full h-10 px-3 border rounded-md"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="activity">Activity</option>
                  <option value="meal">Meal</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0.00"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={addItem} className="w-full">Add Activity</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};