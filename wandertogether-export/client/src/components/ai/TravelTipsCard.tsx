import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, MapPin, DollarSign, Shield, Utensils, Clock, Sparkles } from 'lucide-react';
import { useAIFeatures } from '@/hooks/useAIFeatures';

interface TravelTipsCardProps {
  destination: string;
  tripType?: string;
  season?: string;
  budget?: string;
}

export const TravelTipsCard = ({ destination, tripType, season, budget }: TravelTipsCardProps) => {
  const [tips, setTips] = useState<any>(null);
  const [showTips, setShowTips] = useState(false);
  const { getTravelTips, loading } = useAIFeatures();

  const handleGetTips = async () => {
    const travelTips = await getTravelTips(destination, tripType, season, budget);
    setTips(travelTips);
    setShowTips(true);
  };

  if (!showTips) {
    return (
      <Card className="bg-card hover:bg-card/80 border border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold text-foreground">AI Travel Tips</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Get personalized recommendations and tips for {destination}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGetTips} disabled={loading} className="w-full">
            {loading ? 'Getting Tips...' : 'Get AI Travel Tips'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold text-foreground">AI Travel Tips for {destination}</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Personalized recommendations powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Essential Tips */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <h3 className="font-semibold text-sm text-foreground">Essential Tips</h3>
          </div>
          <ul className="space-y-2">
            {tips?.essential_tips?.map((tip: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Best Time to Visit */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm text-foreground">Best Time to Visit</h3>
          </div>
          <p className="text-sm text-muted-foreground">{tips?.best_time_to_visit}</p>
        </div>

        <Separator />

        {/* Budget Tips */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold text-sm text-foreground">Budget Tips</h3>
          </div>
          <ul className="space-y-2">
            {tips?.budget_tips?.map((tip: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Safety Notes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-sm text-foreground">Safety Notes</h3>
          </div>
          <ul className="space-y-2">
            {tips?.safety_notes?.map((note: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Must Try */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="h-4 w-4 text-orange-500" />
            <h3 className="font-semibold text-sm text-foreground">Must Try</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tips?.must_try?.map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Local Customs */}
        {tips?.local_customs?.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-purple-500" />
                <h3 className="font-semibold text-sm text-foreground">Local Customs</h3>
              </div>
              <ul className="space-y-2">
                {tips.local_customs.map((custom: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    {custom}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowTips(false)}
          className="w-full mt-4"
        >
          Hide Tips
        </Button>
      </CardContent>
    </Card>
  );
};