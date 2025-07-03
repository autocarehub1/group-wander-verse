import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface Participant {
  user_id: string;
  users: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface BillSplittingSectionProps {
  participants: Participant[];
  selectedParticipants: string[];
  setSelectedParticipants: (participants: string[]) => void;
  splitType: 'equal' | 'custom';
  setSplitType: (type: 'equal' | 'custom') => void;
  customSplits: Record<string, string>;
  setCustomSplits: (splits: Record<string, string>) => void;
  totalAmount: string;
}

export const BillSplittingSection = ({
  participants,
  selectedParticipants,
  setSelectedParticipants,
  splitType,
  setSplitType,
  customSplits,
  setCustomSplits,
  totalAmount
}: BillSplittingSectionProps) => {
  return (
    <div className="space-y-3 p-3 bg-muted rounded-lg">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={splitType === 'equal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSplitType('equal')}
        >
          Split Equally
        </Button>
        <Button
          type="button"
          variant={splitType === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSplitType('custom')}
        >
          Custom Split
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Select Participants
        </Label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {participants.map((participant) => (
            <div key={participant.user_id} className="flex items-center space-x-2">
              <Checkbox
                id={`participant-${participant.user_id}`}
                checked={selectedParticipants.includes(participant.user_id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedParticipants([...selectedParticipants, participant.user_id]);
                  } else {
                    setSelectedParticipants(selectedParticipants.filter(id => id !== participant.user_id));
                  }
                }}
              />
              <Avatar className="h-6 w-6">
                <AvatarImage src={participant.users?.avatar_url || ''} />
                <AvatarFallback>
                  {participant.users?.full_name?.[0] || participant.users?.email[0]}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor={`participant-${participant.user_id}`} className="text-sm">
                {participant.users?.full_name || participant.users?.email}
              </Label>
              {splitType === 'custom' && selectedParticipants.includes(participant.user_id) && (
                <Input
                  type="number"
                  placeholder="Amount"
                  className="w-20 h-6 text-xs"
                  value={customSplits[participant.user_id] || ''}
                  onChange={(e) => setCustomSplits({
                    ...customSplits,
                    [participant.user_id]: e.target.value
                  })}
                />
              )}
            </div>
          ))}
        </div>
        
        {splitType === 'equal' && selectedParticipants.length > 0 && totalAmount && (
          <p className="text-xs text-muted-foreground">
            Each person pays: ${(parseFloat(totalAmount) / selectedParticipants.length).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
};