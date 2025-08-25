import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Sparkles, Wand2 } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { useAIFeatures } from '@/hooks/useAIFeatures';

interface CreateTripDialogProps {
  onTripCreated?: () => void;
}

export const CreateTripDialog = ({ onTripCreated }: CreateTripDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generateAISuggestions, setGenerateAISuggestions] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const { createTrip } = useTrips();
  const { generateSuggestions, loading: suggestionsLoading } = useLocationSuggestions();
  const { generateTripDescription, loading: descriptionLoading } = useAIFeatures();

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
      // Generate AI suggestions if enabled
      if (generateAISuggestions && result.id) {
        await generateSuggestions(formData.destination, result.id);
      }

      setFormData({
        title: '',
        destination: '',
        description: '',
        start_date: '',
        end_date: ''
      });
      setGenerateAISuggestions(true);
      setIsOpen(false);
      onTripCreated?.();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              {formData.destination && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const description = await generateTripDescription(formData.destination, formData.start_date, formData.end_date);
                    handleInputChange('description', description);
                  }}
                  disabled={descriptionLoading}
                  className="h-8 px-3 text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  {descriptionLoading ? 'Generating...' : 'AI Generate'}
                </Button>
              )}
            </div>
            <Textarea
              id="description"
              placeholder="Tell your group about this trip... (or use AI Generate)"
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
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ai-suggestions"
              checked={generateAISuggestions}
              onCheckedChange={(checked) => setGenerateAISuggestions(checked === true)}
            />
            <Label 
              htmlFor="ai-suggestions" 
              className="text-sm font-normal flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Generate AI suggestions for activities and hotels
            </Label>
          </div>
          
          <Button 
            onClick={handleCreateTrip} 
            className="w-full"
            disabled={!formData.title.trim() || !formData.destination.trim() || suggestionsLoading}
          >
            {suggestionsLoading ? 'Creating Trip & Generating Suggestions...' : 'Create Trip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};