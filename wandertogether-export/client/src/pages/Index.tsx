import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16"></div>
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 sm:opacity-20"
            style={{ backgroundImage: `url(${mountainLandscape})` }}
          />
          
          <div className="relative container mx-auto px-4 py-8 sm:py-16">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black-mobile mb-3 sm:mb-4 text-foreground">Welcome back!</h1>
              <p className="text-lg sm:text-2xl text-foreground/80 mb-6 sm:mb-8 font-medium">Your travel dashboard awaits</p>
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="w-16 sm:w-24 h-1 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">Quick Access</h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">Everything you need for your next adventure</p>
          </div>
          
          <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Link to="/trips" className="block">
              <Card className="bg-card hover:bg-card/80 group cursor-pointer border border-border hover:border-primary/40 h-full transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="relative mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                    <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-center group-hover:text-primary transition-colors font-semibold text-lg sm:text-xl text-foreground">
                    My Trips
                  </CardTitle>
                  <CardDescription className="text-center text-sm sm:text-base font-medium text-muted-foreground">
                    Manage your trips, chat with groups, and plan itineraries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full pointer-events-none h-10 sm:h-11 text-sm sm:text-base" variant="default">View All Trips</Button>
                </CardContent>
              </Card>
            </Link>

            {[
              { icon: CreditCard, title: "Payment Center", desc: "View your expense splits and payment history", link: "/expense-tracking", variant: "outline" as const },
              { icon: Users, title: "Group Management", desc: "Invite friends and manage trip participants", link: "/trips", variant: "outline" as const },
              { icon: MessageCircle, title: "Group Chat", desc: "Chat with your travel groups and share updates", link: "/chat", variant: "outline" as const },
              { icon: Calendar, title: "Activity Planning", desc: "Plan activities, accommodations, and itineraries", link: "/trips", variant: "outline" as const },
              { icon: DollarSign, title: "Expense Tracking", desc: "Track shared expenses and split costs with your group", link: "/expense-tracking", variant: "outline" as const }
            ].map((item, index) => (
              <Link key={index} to={item.link} className="block">
                <Card className="bg-card hover:bg-card/80 group cursor-pointer border border-border hover:border-primary/40 h-full transition-all duration-200 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="relative mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                      <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-secondary" />
                    </div>
                    <CardTitle className="text-center group-hover:text-primary transition-colors font-semibold text-base sm:text-lg text-foreground">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-center text-sm sm:text-base font-medium text-muted-foreground">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant={item.variant} className="w-full pointer-events-none h-10 sm:h-11 text-sm sm:text-base">
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
          <div className="mt-12 sm:mt-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground">Ready for Your Next Adventure?</h2>
            <div className="relative max-w-4xl mx-auto">
              <img 
                src={cityDestination} 
                alt="Beautiful travel destination" 
                className="rounded-2xl sm:rounded-3xl shadow-lg w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl sm:rounded-3xl"></div>
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 text-white text-left">
                <h3 className="text-lg sm:text-2xl font-bold mb-2 text-white">Start Planning Today</h3>
                <p className="text-white/90 mb-3 sm:mb-4 font-medium text-sm sm:text-base">Create unforgettable memories with friends and family</p>
                <Link to="/trips">
                  <Button variant="default" size="default" className="text-sm sm:text-base px-4 sm:px-6 h-9 sm:h-11">
                    Create New Trip
                  </Button>
                </Link>
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
    </div>
  );
};

export default Index;