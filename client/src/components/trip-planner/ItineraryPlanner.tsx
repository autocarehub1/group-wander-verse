import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, MapPin, Trash2, GripVertical } from 'lucide-react';

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
      
      const response = await fetch(`/api/trips/${tripId}/itinerary`);
      if (response.ok) {
        const data = await response.json();
        setDays(data || []);
      } else {
        console.error('Failed to fetch itinerary');
        setDays([]);
      }
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
    try {
      const dayData = {
        trip_id: tripId,
        day_date: newDay.date,
        title: newDay.title.trim() || '',
        description: newDay.description.trim() || ''
      };

      const response = await fetch(`/api/trips/${tripId}/itinerary/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dayData),
      });

      if (!response.ok) {
        throw new Error('Failed to create itinerary day');
      }

      const createdDay = await response.json();
      setDays(prev => [...prev, { ...createdDay, items: [] }]);
      setNewDay({ date: '', title: '', description: '' });
      setIsAddDayOpen(false);
      
      toast({
        title: "Day added!",
        description: "New itinerary day has been created successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addItem = async () => {
    try {
      const itemData = {
        day_id: selectedDayId,
        trip_id: tripId,
        title: newItem.title.trim(),
        description: newItem.description.trim() || null,
        location: newItem.location.trim() || null,
        start_time: newItem.start_time || null,
        end_time: newItem.end_time || null,
        category: newItem.category,
        cost: newItem.cost ? parseFloat(newItem.cost) : null
      };

      const response = await fetch(`/api/itinerary/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error('Failed to create itinerary item');
      }

      const createdItem = await response.json();
      setDays(prev => prev.map(day => 
        day.id === selectedDayId 
          ? { ...day, items: [...day.items, createdItem] }
          : day
      ));
      
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
      
      toast({
        title: "Activity added!",
        description: "New itinerary item has been added successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/itinerary/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete itinerary item');
      }

      setDays(prev => prev.map(day => ({
        ...day,
        items: day.items.filter(item => item.id !== itemId)
      })));
      
      toast({
        title: "Item deleted",
        description: "The itinerary item has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceDayId = source.droppableId;
    const destDayId = destination.droppableId;

    // Update local state immediately for better UX
    setDays(prev => {
      const newDays = [...prev];
      const sourceDayIndex = newDays.findIndex(day => day.id === sourceDayId);
      const sourceDayItems = [...newDays[sourceDayIndex].items];
      const [movedItem] = sourceDayItems.splice(source.index, 1);

      if (sourceDayId === destDayId) {
        // Moving within the same day
        sourceDayItems.splice(destination.index, 0, movedItem);
        newDays[sourceDayIndex] = {
          ...newDays[sourceDayIndex],
          items: sourceDayItems
        };
      } else {
        // Moving to a different day
        const destDayIndex = newDays.findIndex(day => day.id === destDayId);
        const destDayItems = [...newDays[destDayIndex].items];
        
        // Update the moved item's day_id
        const updatedItem = { ...movedItem, day_id: destDayId };
        destDayItems.splice(destination.index, 0, updatedItem);
        
        newDays[sourceDayIndex] = {
          ...newDays[sourceDayIndex],
          items: sourceDayItems
        };
        newDays[destDayIndex] = {
          ...newDays[destDayIndex],
          items: destDayItems
        };
      }

      return newDays;
    });

    try {
      if (sourceDayId !== destDayId) {
        // Update the item's day_id on the server
        await fetch(`/api/itinerary/items/${draggableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day_id: destDayId })
        });
      }

      // Reorder items in the destination day
      const day = days.find(d => d.id === destDayId);
      if (day) {
        const reorderedItems = [...day.items];
        const movedItem = reorderedItems.find(item => item.id === draggableId);
        if (movedItem) {
          const filteredItems = reorderedItems.filter(item => item.id !== draggableId);
          filteredItems.splice(destination.index, 0, movedItem);
          const itemIds = filteredItems.map(item => item.id);

          await fetch(`/api/itinerary/days/${destDayId}/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemIds })
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reorder items. Please refresh the page.",
        variant: "destructive"
      });
      // Reload the data on error
      fetchItinerary();
    }
  }, [days, toast, fetchItinerary]);

  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  if (loading) {
    return <div className="text-center py-8">Loading itinerary...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Trip Itinerary</h3>
            <p className="text-sm text-muted-foreground">Drag and drop activities to create your perfect day-by-day itinerary</p>
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
                <Droppable droppableId={day.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[100px] transition-colors ${
                        snapshot.isDraggingOver
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg'
                          : ''
                      }`}
                    >
                      {day.items.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No activities planned for this day.</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag activities here or add new ones
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {day.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                                    snapshot.isDragging
                                      ? 'shadow-lg bg-white dark:bg-gray-800 border-primary'
                                      : 'hover:shadow-md'
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 text-muted-foreground hover:text-foreground cursor-move"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
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
                              )}
                            </Draggable>
                          ))}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
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
    </DragDropContext>
  );
};