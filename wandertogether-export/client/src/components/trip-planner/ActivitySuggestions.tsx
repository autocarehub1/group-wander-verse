import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, Clock, DollarSign, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';

interface ActivitySuggestion {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  estimated_cost?: number | null;
  estimated_duration?: number | null;
  suggested_by?: string | null;
  trip_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  external_data?: any;
  external_id?: string | null;
  upvotes?: number;
  downvotes?: number;
  user_vote?: 'upvote' | 'downvote' | null;
}

interface ActivitySuggestionsProps {
  tripId: string;
}

export const ActivitySuggestions = ({ tripId }: ActivitySuggestionsProps) => {
  const [activities, setActivities] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    location: '',
    category: 'attraction',
    estimated_cost: '',
    estimated_duration: ''
  });
  const { toast } = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      } else {
        console.error('Failed to fetch activity suggestions');
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    try {
      const activityData = {
        trip_id: tripId,
        title: newActivity.title.trim(),
        description: newActivity.description.trim() || null,
        location: newActivity.location.trim() || null,
        category: newActivity.category,
        estimated_cost: newActivity.estimated_cost ? parseFloat(newActivity.estimated_cost) : null,
        estimated_duration: newActivity.estimated_duration ? parseInt(newActivity.estimated_duration) : null
      };

      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity suggestion');
      }

      const createdActivity = await response.json();
      setActivities(prev => [createdActivity, ...prev]);
      setNewActivity({
        title: '',
        description: '',
        location: '',
        category: 'attraction',
        estimated_cost: '',
        estimated_duration: ''
      });
      setIsAddOpen(false);
      
      toast({
        title: "Activity added!",
        description: "Your activity suggestion has been added successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      toast({
        title: "Activity deleted",
        description: "The activity suggestion has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const voteOnActivity = async (activityId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/activities/${activityId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote on activity');
      }

      const updatedActivity = await response.json();
      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? updatedActivity : activity
      ));
      
      toast({
        title: "Vote recorded",
        description: `Your ${voteType} has been recorded.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [tripId]);

  if (loading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Activity Suggestions</h3>
          <p className="text-sm text-muted-foreground">Suggest and vote on activities for your trip</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Suggest Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggest Activity</DialogTitle>
              <DialogDescription>Add a new activity suggestion for the group to vote on.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-title">Title</Label>
                <Input
                  id="activity-title"
                  placeholder="e.g., Visit the Louvre Museum"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-description">Description</Label>
                <Textarea
                  id="activity-description"
                  placeholder="Brief description of the activity"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-location">Location</Label>
                <Input
                  id="activity-location"
                  placeholder="e.g., Paris, France"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full h-10 px-3 border rounded-md"
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                  >
                    <option value="attraction">Attraction</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="culture">Culture</option>
                    <option value="shopping">Shopping</option>
                    <option value="nightlife">Nightlife</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-cost">Estimated Cost ($)</Label>
                  <Input
                    id="estimated-cost"
                    type="number"
                    placeholder="0.00"
                    value={newActivity.estimated_cost}
                    onChange={(e) => setNewActivity({ ...newActivity, estimated_cost: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated-duration">Estimated Duration (hours)</Label>
                <Input
                  id="estimated-duration"
                  type="number"
                  placeholder="2"
                  value={newActivity.estimated_duration}
                  onChange={(e) => setNewActivity({ ...newActivity, estimated_duration: e.target.value })}
                />
              </div>
              <Button onClick={addActivity} className="w-full">Add Activity</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity suggestions yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to suggest an activity for the trip!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {activity.title}
                      <Badge variant="outline">{activity.category}</Badge>
                    </CardTitle>
                    {activity.description && (
                      <CardDescription>{activity.description}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {activity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {activity.location}
                      </div>
                    )}
                    {activity.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {activity.estimated_duration}h
                      </div>
                    )}
                    {activity.estimated_cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${activity.estimated_cost}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activity.user_vote === 'upvote' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => voteOnActivity(activity.id, 'upvote')}
                      className="flex items-center gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {activity.upvotes || 0}
                    </Button>
                    <Button
                      variant={activity.user_vote === 'downvote' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => voteOnActivity(activity.id, 'downvote')}
                      className="flex items-center gap-1"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {activity.downvotes || 0}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};