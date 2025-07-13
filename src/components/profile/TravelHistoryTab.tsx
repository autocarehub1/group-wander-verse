import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const TravelHistoryTab = () => {
  return (
    <Card className="travel-card">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl">Travel History</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Your past adventures and reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 sm:py-12">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium mb-2">No Travel History Yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto">
            Start planning your first group adventure to see your travel history here.
          </p>
          <Button variant="hero" className="w-full sm:w-auto">
            Plan Your First Trip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};