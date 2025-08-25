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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="itinerary" className="text-xs sm:text-sm px-1 sm:px-2 py-2 flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Itinerary</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs sm:text-sm px-1 sm:px-2 py-2 flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Activities</span>
            <span className="sm:hidden">Do</span>
          </TabsTrigger>
          <TabsTrigger value="accommodation" className="text-xs sm:text-sm px-1 sm:px-2 py-2 flex items-center justify-center gap-1">
            <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Hotels</span>
            <span className="sm:hidden">Stay</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm px-1 sm:px-2 py-2 flex items-center justify-center gap-1">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Expenses</span>
            <span className="sm:hidden">Cost</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm px-1 sm:px-2 py-2 flex items-center justify-center gap-1">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Payments</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm px-1 sm:px-2 py-2 flex items-center justify-center gap-1">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
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