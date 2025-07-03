import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const TravelHistoryTab = () => {
  return (
    <Card className="travel-card">
      <CardHeader>
        <CardTitle>Travel History</CardTitle>
        <CardDescription>
          Your past adventures and reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Travel History Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start planning your first group adventure to see your travel history here.
          </p>
          <Button variant="hero">Plan Your First Trip</Button>
        </div>
      </CardContent>
    </Card>
  );
};