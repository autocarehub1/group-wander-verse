import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TripPlanningDemo from "@/components/TripPlanningDemo";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CreditCard, Users, MessageCircle, Calendar, DollarSign } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
            <p className="text-xl text-muted-foreground">Quick access to all your travel features</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  My Trips
                </CardTitle>
                <CardDescription>
                  Manage your trips, chat with groups, and plan itineraries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/trips">
                  <Button className="w-full">View All Trips</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Expense Payments
                </CardTitle>
                <CardDescription>
                  Settle outstanding balances and track payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/trips">
                  <Button variant="outline" className="w-full">Manage Expenses</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Management
                </CardTitle>
                <CardDescription>
                  Invite friends and manage trip participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/trips">
                  <Button variant="outline" className="w-full">Manage Groups</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Group Chat
                </CardTitle>
                <CardDescription>
                  Chat with your travel groups and share updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/trips">
                  <Button variant="outline" className="w-full">Open Chats</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trip Planning
                </CardTitle>
                <CardDescription>
                  Plan activities, accommodations, and itineraries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/trips">
                  <Button variant="outline" className="w-full">Plan Trips</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Expense Tracking
                </CardTitle>
                <CardDescription>
                  Track shared expenses and split costs with your group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/trips">
                  <Button variant="outline" className="w-full">Track Expenses</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <TripPlanningDemo />
    </div>
  );
};

export default Index;