import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TripPlanningDemo from "@/components/TripPlanningDemo";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CreditCard, Users, MessageCircle, Calendar, DollarSign } from "lucide-react";
import mountainLandscape from "@/assets/mountain-landscape.jpg";
import cityDestination from "@/assets/city-destination.jpg";

const Index = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-sky">
        <Navbar />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${mountainLandscape})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          
          <div className="relative container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">Welcome back!</h1>
              <p className="text-2xl text-muted-foreground mb-8">Your travel dashboard awaits</p>
              <div className="flex justify-center mb-8">
                <div className="w-24 h-1 bg-gradient-hero rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative -mt-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Access</h2>
            <p className="text-lg text-muted-foreground">Everything you need for your next adventure</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Link to="/trips" className="block">
              <Card className="travel-card group cursor-pointer border-0 bg-white/90 backdrop-blur-md hover:bg-white/95 h-full">
                <CardHeader className="pb-4">
                  <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-hero rounded-2xl opacity-20"></div>
                    <div className="absolute inset-0 bg-white/50 rounded-2xl"></div>
                    <MapPin className="relative z-10 h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-center group-hover:text-primary transition-colors">
                    My Trips
                  </CardTitle>
                  <CardDescription className="text-center">
                    Manage your trips, chat with groups, and plan itineraries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full pointer-events-none" variant="hero">View All Trips</Button>
                </CardContent>
              </Card>
            </Link>

            {[
              { icon: CreditCard, title: "Expense Payments", desc: "Settle outstanding balances and track payments", link: "/expense-payments", variant: "outline" as const },
              { icon: Users, title: "Group Management", desc: "Invite friends and manage trip participants", link: "/trips", variant: "outline" as const },
              { icon: MessageCircle, title: "Group Chat", desc: "Chat with your travel groups and share updates", link: "/chat", variant: "outline" as const },
              { icon: Calendar, title: "Trip Planning", desc: "Plan activities, accommodations, and itineraries", link: "/trips", variant: "outline" as const },
              { icon: DollarSign, title: "Expense Tracking", desc: "Track shared expenses and split costs with your group", link: "/expense-tracking", variant: "outline" as const }
            ].map((item, index) => (
              <Link key={index} to={item.link} className="block">
                <Card className="travel-card group cursor-pointer border-0 bg-white/90 backdrop-blur-md hover:bg-white/95 h-full">
                  <CardHeader className="pb-4">
                    <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-hero rounded-2xl opacity-20"></div>
                      <div className="absolute inset-0 bg-white/50 rounded-2xl"></div>
                      <item.icon className="relative z-10 h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-center">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant={item.variant} className="w-full pointer-events-none">
                      {item.title === "Expense Payments" ? "Expense Payments" : 
                       item.title === "Group Management" ? "Group Management" :
                       item.title === "Group Chat" ? "Group Chat" :
                       item.title === "Trip Planning" ? "Trip Planning" :
                       "Expense Tracking"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Inspiration section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-8 gradient-text">Ready for Your Next Adventure?</h2>
            <div className="relative max-w-4xl mx-auto">
              <img 
                src={cityDestination} 
                alt="Beautiful travel destination" 
                className="rounded-3xl shadow-elevated w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-3xl"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white text-left">
                <h3 className="text-2xl font-bold mb-2">Start Planning Today</h3>
                <p className="text-white/90 mb-4">Create unforgettable memories with friends and family</p>
                <Button variant="hero" size="lg">
                  Create New Trip
                </Button>
              </div>
            </div>
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