import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MapPin, MessageSquare, Star, Clock } from "lucide-react";
import friendsTravel from "@/assets/friends-travel.jpg";
import planningWorkspace from "@/assets/planning-workspace.jpg";
import cityDestination from "@/assets/city-destination.jpg";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Group Collaboration",
      description: "Invite friends and plan together in real-time. Everyone stays in the loop.",
      color: "text-primary",
      variant: "default" as const
    },
    {
      icon: Calendar,
      title: "Smart Itineraries", 
      description: "AI-powered trip planning with personalized recommendations for your group.",
      color: "text-nature",
      variant: "nature" as const
    },
    {
      icon: MapPin,
      title: "Location Sharing",
      description: "Stay connected with optional real-time location sharing during your trip.",
      color: "text-adventure",
      variant: "adventure" as const
    },
    {
      icon: MessageSquare,
      title: "Group Chat",
      description: "Built-in messaging with photo sharing and trip coordination tools.",
      color: "text-cultural",
      variant: "cultural" as const
    },
    {
      icon: Star,
      title: "Expense Tracking",
      description: "Split bills easily and track shared expenses with automatic calculations.",
      color: "text-primary",
      variant: "default" as const
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications about itinerary changes and group activities.",
      color: "text-nature",
      variant: "nature" as const
    }
  ];

  return (
    <section className="py-24 bg-gradient-sky relative overflow-hidden" id="features">
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Hero section with image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Everything You Need for Group Travel
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              From planning to memories, WanderTogether has all the tools to make your group adventures seamless and unforgettable.
            </p>
            <Button variant="hero" size="xl" className="shadow-glow">
              Explore Features
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-xl opacity-30"></div>
            <img 
              src={friendsTravel} 
              alt="Friends traveling together" 
              className="relative rounded-3xl shadow-elevated w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="travel-card group border-0 bg-white/90 backdrop-blur-md hover:bg-white/95">
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-6 w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-hero rounded-3xl opacity-20"></div>
                    <div className="absolute inset-0 bg-white/50 rounded-3xl"></div>
                    <IconComponent className={`relative z-10 ${feature.color} group-hover:scale-110 transition-transform`} size={36} />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional visual sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img 
              src={planningWorkspace} 
              alt="Travel planning workspace" 
              className="rounded-3xl shadow-elevated w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-6 text-foreground">
              Plan Like a Pro
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Our intuitive interface makes trip planning feel effortless. Collaborate in real-time, share ideas, and build the perfect itinerary together.
            </p>
            <Button variant="outline" size="lg" className="shadow-feature">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;