import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Clock, DollarSign, Users, Star, ThumbsUp, ThumbsDown, 
  Plus, Calendar, CheckCircle, XCircle, CreditCard, UserCheck,
  Sparkles, TrendingUp, Activity as ActivityIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { ActivityTranslator } from './ActivityTranslator';
import { TranslationDemo } from './TranslationDemo';

interface Participant {
  id: string;
  user_id: string;
  role: string;
  users: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  estimated_cost: number;
  estimated_duration: number;
  status: 'suggested' | 'approved' | 'declined' | 'completed';
  suggested_by: string;
  votes?: { up: number; down: number };
  expense_id?: string;
  booking_details?: any;
  translations?: Record<string, any>;
  created_at: string;
}

interface SophisticatedActivityPlannerProps {
  tripId: string;
  tripTitle: string;
  destination: string;
}

export const SophisticatedActivityPlanner = ({ 
  tripId, 
  tripTitle, 
  destination 
}: SophisticatedActivityPlannerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { categorizeExpense, generateLocationSuggestions } = useAIFeatures();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('suggested');
  
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    location: '',
    category: 'attraction',
    estimated_cost: '',
    estimated_duration: ''
  });

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activitiesRes, participantsRes] = await Promise.all([
        fetch(`/api/trips/${tripId}/activities`),
        fetch(`/api/trips/${tripId}/participants`)
      ]);

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        console.log('📋 Fetched activities:', activitiesData?.length, 'total activities');
        console.log('📋 Activity statuses:', activitiesData?.map((a: Activity) => `${a.title}: ${a.status}`) || []);
        console.log('📋 Suggested activities:', activitiesData?.filter((a: Activity) => a.status === 'suggested')?.length);
        setActivities(activitiesData || []);
      }

      if (participantsRes.ok) {
        const participantsData = await participantsRes.json();
        setParticipants(participantsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Unable to load activities and participants.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    setGenerating(true);
    try {
      console.log('🚀 Starting AI generation for:', destination);
      const response = await generateLocationSuggestions(destination, tripId);
      console.log('🤖 AI suggestions received:', response);
      
      // Parse the response correctly - the API returns { suggestions: { activities: [...] } }
      const suggestions = response?.suggestions || response;
      console.log('📊 Activities count:', suggestions?.activities?.length);
      
      if (suggestions?.activities && suggestions.activities.length > 0) {
        // Add AI-generated activities to the database
        console.log('🔄 Processing', suggestions.activities.length, 'AI activities');
        const newActivities: any[] = [];
        for (const activity of suggestions.activities) {
          const activityData = {
            title: activity.title,
            description: activity.description,
            location: activity.location,
            category: activity.category,
            estimated_cost: activity.estimated_cost,
            estimated_duration: activity.estimated_duration,
            trip_id: tripId,
            suggested_by: user?.id,
            status: 'suggested'
          };
          
          console.log('📤 Creating activity:', activity.title, 'with status:', activityData.status);
          const response = await fetch(`/api/trips/${tripId}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
          });
          
          if (response.ok) {
            const newActivity = await response.json();
            newActivities.push(newActivity);
            console.log('✅ Created activity:', newActivity.title, 'with final status:', newActivity.status, 'ID:', newActivity.id);
          } else {
            const errorText = await response.text();
            console.error('❌ Failed to create activity:', activity.title, 'Status:', response.status, 'Error:', errorText);
            // Log the request data for debugging
            console.error('❌ Request data was:', JSON.stringify(activityData, null, 2));
            console.error('❌ Response headers:', response.headers);
            console.error('❌ Response status text:', response.statusText);
          }
        }
        
        // Update local state immediately AND refresh from server
        setActivities(prev => [...prev, ...newActivities]);
        
        // Also fetch fresh data from server to ensure sync
        await fetchData();
        
        // Switch to suggested tab to show the new activities
        setActiveTab('suggested');
        
        console.log('✅ Final result:', newActivities.length, 'activities created successfully');
        console.log('✅ New activity IDs:', newActivities.map(a => a.id));
        console.log('🔄 Now refreshing activities from server...');
        
        toast({
          title: "AI suggestions added",
          description: `Generated ${newActivities.length} fresh activity suggestions for ${destination}. Check the Suggested tab!`,
        });
      } else {
        console.error('❌ No activities in AI response:', response);
        console.error('❌ Parsed suggestions:', suggestions);
        toast({
          title: "No suggestions generated", 
          description: "AI didn't generate any activities. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: "AI generation failed",
        description: "Unable to generate AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const createActivity = async () => {
    if (!newActivity.title || !newActivity.description) {
      toast({
        title: "Missing information",
        description: "Please fill in title and description.",
        variant: "destructive"
      });
      return;
    }

    try {
      const activityData = {
        ...newActivity,
        trip_id: tripId,
        suggested_by: user?.id,
        estimated_cost: parseFloat(newActivity.estimated_cost) || 0,
        estimated_duration: parseInt(newActivity.estimated_duration) || 60,
        status: 'suggested'
      };

      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });

      if (response.ok) {
        const createdActivity = await response.json();
        setActivities(prev => [...prev, createdActivity]);
        setNewActivity({
          title: '',
          description: '',
          location: '',
          category: 'attraction',
          estimated_cost: '',
          estimated_duration: ''
        });
        
        toast({
          title: "Activity created",
          description: "Your activity suggestion has been added.",
        });
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Creation failed",
        description: "Unable to create activity. Please try again.",
        variant: "destructive"
      });
    }
  };

  const voteOnActivity = async (activityId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/activities/${activityId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user?.id, 
          vote_type: voteType 
        })
      });

      if (response.ok) {
        const updatedActivity = await response.json();
        setActivities(prev => 
          prev.map(activity => 
            activity.id === activityId ? { ...activity, votes: updatedActivity.votes } : activity
          )
        );
        
        toast({
          title: `${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}`,
          description: "Your vote has been recorded.",
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Vote failed",
        description: "Unable to record your vote.",
        variant: "destructive"
      });
    }
  };

  const approveActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        setActivities(prev => 
          prev.map(activity => 
            activity.id === activityId ? { ...activity, status: 'approved' } : activity
          )
        );
        
        toast({
          title: "Activity approved",
          description: "Activity has been approved and can now be added to itinerary.",
        });
      }
    } catch (error) {
      console.error('Error approving activity:', error);
      toast({
        title: "Approval failed",
        description: "Unable to approve activity.",
        variant: "destructive"
      });
    }
  };

  const markActivityCompleted = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    try {
      // First mark activity as completed
      const activityResponse = await fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (activityResponse.ok) {
        // Create consolidated expense if activity has cost
        if (activity.estimated_cost > 0) {
          const expenseData = {
            trip_id: tripId,
            title: `${activity.title} - Activity Expense`,
            description: `Consolidated expense for completed activity: ${activity.description}`,
            amount: activity.estimated_cost,
            category: activity.category,
            paid_by: user?.id,
            expense_date: new Date().toISOString().split('T')[0],
            is_shared: true
          };

          const expenseResponse = await fetch(`/api/trips/${tripId}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
          });

          if (expenseResponse.ok) {
            const expense = await expenseResponse.json();
            
            // Create expense splits for all participants
            const splitAmount = activity.estimated_cost / participants.length;
            
            for (const participant of participants) {
              const splitData = {
                expense_id: expense.id,
                user_id: participant.user_id,
                amount: splitAmount.toFixed(2)
              };

              await fetch(`/api/expenses/${expense.id}/splits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(splitData)
              });
            }

            // Link expense to activity
            await fetch(`/api/activities/${activityId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expense_id: expense.id })
            });
          }
        }

        setActivities(prev => 
          prev.map(a => 
            a.id === activityId ? { ...a, status: 'completed' } : a
          )
        );
        
        toast({
          title: "Activity completed",
          description: activity.estimated_cost > 0 
            ? "Activity marked complete and expense has been consolidated."
            : "Activity marked as completed.",
        });
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      toast({
        title: "Completion failed",
        description: "Unable to mark activity as completed.",
        variant: "destructive"
      });
    }
  };

  const getActivityStatusBadge = (status: string) => {
    const statusConfig = {
      suggested: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Sparkles },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      declined: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
      completed: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Star }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.suggested;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'suggested') return activity.status === 'suggested';
    if (activeTab === 'approved') return activity.status === 'approved';
    if (activeTab === 'completed') return activity.status === 'completed';
    return true;
  });

  const getParticipantAvatar = (userId: string) => {
    const participant = participants.find(p => p.user_id === userId);
    return participant?.users;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Activity Planning</h2>
          <p className="text-muted-foreground">Plan and organize group activities for {destination}</p>
        </div>
        <div className="flex gap-2">
          <TranslationDemo />
          <Button 
            onClick={generateAISuggestions} 
            disabled={generating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'AI Suggestions'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggested" className="flex items-center gap-2">
            <Sparkles size={16} />
            Suggested ({activities.filter(a => a.status === 'suggested').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle size={16} />
            Approved ({activities.filter(a => a.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Star size={16} />
            Completed ({activities.filter(a => a.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus size={16} />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggested" className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ActivityIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No suggested activities yet.</p>
                <Button 
                  onClick={generateAISuggestions}
                  disabled={generating}
                  className="mt-4"
                >
                  Generate AI Suggestions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  participants={participants}
                  onVote={voteOnActivity}
                  onApprove={approveActivity}
                  onComplete={markActivityCompleted}
                  getParticipantAvatar={getParticipantAvatar}
                  getActivityStatusBadge={getActivityStatusBadge}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No approved activities yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  participants={participants}
                  onVote={voteOnActivity}
                  onApprove={approveActivity}
                  onComplete={markActivityCompleted}
                  getParticipantAvatar={getParticipantAvatar}
                  getActivityStatusBadge={getActivityStatusBadge}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed activities yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  participants={participants}
                  onVote={voteOnActivity}
                  onApprove={approveActivity}
                  onComplete={markActivityCompleted}
                  getParticipantAvatar={getParticipantAvatar}
                  getActivityStatusBadge={getActivityStatusBadge}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Activity</CardTitle>
              <CardDescription>
                Suggest a new activity for the group to consider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Activity Title</Label>
                  <Input
                    id="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="e.g. Visit local museum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                    placeholder="e.g. Downtown area"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Describe the activity and what makes it interesting..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newActivity.category}
                    onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attraction">Attraction</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="nightlife">Nightlife</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Estimated Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newActivity.estimated_cost}
                    onChange={(e) => setNewActivity({ ...newActivity, estimated_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newActivity.estimated_duration}
                    onChange={(e) => setNewActivity({ ...newActivity, estimated_duration: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>

              <Button onClick={createActivity} className="w-full">
                <Plus size={16} className="mr-2" />
                Create Activity Suggestion
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Activity Card Component
interface ActivityCardProps {
  activity: Activity;
  participants: Participant[];
  onVote: (activityId: string, voteType: 'upvote' | 'downvote') => void;
  onApprove: (activityId: string) => void;
  onComplete: (activityId: string) => void;
  getParticipantAvatar: (userId: string) => any;
  getActivityStatusBadge: (status: string) => JSX.Element;
}

const ActivityCard = ({
  activity,
  participants,
  onVote,
  onApprove,
  onComplete,
  getParticipantAvatar,
  getActivityStatusBadge
}: ActivityCardProps) => {
  const suggestedBy = getParticipantAvatar(activity.suggested_by);

  return (
    <Card className="travel-card hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
              {getActivityStatusBadge(activity.status)}
            </div>
            <CardDescription className="text-sm">
              {activity.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {activity.votes && (
              <div className="flex items-center gap-2 text-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onVote(activity.id, 'upvote')}
                  className="p-1 h-8 w-8"
                >
                  <ThumbsUp size={14} />
                </Button>
                <span className="text-green-600">{activity.votes.up}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onVote(activity.id, 'downvote')}
                  className="p-1 h-8 w-8"
                >
                  <ThumbsDown size={14} />
                </Button>
                <span className="text-red-600">{activity.votes.down}</span>
              </div>
            )}
            <ActivityTranslator 
              activity={activity} 
              onTranslationUpdate={() => window.location.reload()} 
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {activity.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{activity.location}</span>
              </div>
            )}
            {activity.estimated_duration && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{activity.estimated_duration} min</span>
              </div>
            )}
            {activity.estimated_cost && (
              <div className="flex items-center gap-1">
                <DollarSign size={14} />
                <span>${activity.estimated_cost}</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              {activity.category}
            </Badge>
          </div>

          {suggestedBy && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Suggested by:</span>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={suggestedBy.avatar_url} key={suggestedBy.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {suggestedBy.full_name?.charAt(0) || suggestedBy.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{suggestedBy.full_name || suggestedBy.email}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {activity.status === 'suggested' && (
              <Button
                size="sm"
                onClick={() => onApprove(activity.id)}
                className="flex items-center gap-1"
              >
                <CheckCircle size={14} />
                Approve
              </Button>
            )}
            {activity.status === 'approved' && (
              <Button
                size="sm"
                onClick={() => onComplete(activity.id)}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Star size={14} />
                Mark Complete
              </Button>
            )}
            {activity.status === 'completed' && activity.expense_id && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CreditCard size={12} />
                Expense Created
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};