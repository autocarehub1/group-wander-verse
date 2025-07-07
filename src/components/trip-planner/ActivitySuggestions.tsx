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
    try {
      setLoading(true);
      const currentUser = await supabase.auth.getUser();
      
      // Get activities with vote counts and user's vote
      const { data: activitiesData, error } = await supabase
        .from('activity_suggestions')
        .select(`
          *,
          activity_votes (
            vote_type,
            user_id
          )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to include vote counts and user's vote
      const processedActivities = (activitiesData || []).map(activity => {
        const votes = activity.activity_votes || [];
        const upvotes = votes.filter(vote => vote.vote_type === 'upvote').length;
        const downvotes = votes.filter(vote => vote.vote_type === 'downvote').length;
        const userVoteType = votes.find(vote => vote.user_id === currentUser.data.user?.id)?.vote_type;
        const userVote = (userVoteType === 'upvote' || userVoteType === 'downvote') ? userVoteType : null;

        // Remove the activity_votes property and add our computed properties
        const { activity_votes, ...activityWithoutVotes } = activity;
        
        return {
          ...activityWithoutVotes,
          upvotes,
          downvotes,
          user_vote: userVote as 'upvote' | 'downvote' | null
        } as ActivitySuggestion;
      });

      setActivities(processedActivities);
    } catch (error: any) {
      toast({
        title: "Error loading activities",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (!newActivity.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter an activity title.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_suggestions')
        .insert([{
          trip_id: tripId,
          title: newActivity.title,
          description: newActivity.description || undefined,
          location: newActivity.location || undefined,
          category: newActivity.category,
          estimated_cost: newActivity.estimated_cost ? parseFloat(newActivity.estimated_cost) : undefined,
          estimated_duration: newActivity.estimated_duration ? parseInt(newActivity.estimated_duration) : undefined
        }]);

      if (error) throw error;

      setNewActivity({
        title: '',
        description: '',
        location: '',
        category: 'attraction',
        estimated_cost: '',
        estimated_duration: ''
      });
      setIsAddOpen(false);
      await fetchActivities();
      
      toast({
        title: "Activity added successfully",
        description: "New activity suggestion has been created."
      });
    } catch (error: any) {
      toast({
        title: "Error adding activity",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activity_suggestions')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      await fetchActivities();
      
      toast({
        title: "Activity deleted",
        description: "Activity suggestion has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting activity",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const voteOnActivity = async (activityId: string, voteType: 'upvote' | 'downvote') => {
    try {
      // First check if user already voted
      const { data: existingVote } = await supabase
        .from('activity_votes')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('activity_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('activity_votes')
          .insert([{
            activity_id: activityId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            vote_type: voteType
          }]);

        if (error) throw error;
      }

      toast({
        title: "Vote recorded",
        description: `Your ${voteType} has been recorded.`
      });
      
      // Refresh activities to show updated vote counts
      await fetchActivities();
    } catch (error: any) {
      toast({
        title: "Error voting",
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