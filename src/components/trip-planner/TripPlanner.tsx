import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItineraryPlanner } from './ItineraryPlanner';
import { ActivitySuggestions } from './ActivitySuggestions';
import { AccommodationPlanning } from './AccommodationPlanning';
import { ExpenseTracker } from './ExpenseTracker';
import { ExpenseSettlement } from './ExpenseSettlement';
import { DocumentManager } from './DocumentManager';
import { Calendar, MapPin, Bed, DollarSign, FileText, CreditCard } from 'lucide-react';

interface TripPlannerProps {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
}

export const TripPlanner = ({ tripId, tripTitle, tripDestination }: TripPlannerProps) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="itinerary" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="itinerary">
            <Calendar className="h-4 w-4 mr-2" />
            Itinerary
          </TabsTrigger>
          <TabsTrigger value="activities">
            <MapPin className="h-4 w-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="accommodation">
            <Bed className="h-4 w-4 mr-2" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <DollarSign className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="itinerary" className="mt-6">
          <ItineraryPlanner tripId={tripId} />
        </TabsContent>
        
        <TabsContent value="activities" className="mt-6">
          <ActivitySuggestions tripId={tripId} />
        </TabsContent>
        
        <TabsContent value="accommodation" className="mt-6">
          <AccommodationPlanning tripId={tripId} />
        </TabsContent>
        
        <TabsContent value="expenses" className="mt-6">
          <ExpenseTracker tripId={tripId} />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <ExpenseSettlement tripId={tripId} />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <DocumentManager tripId={tripId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};