import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MapPin, MessageSquare, Star, Clock } from "lucide-react";

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
    <section className="py-20 bg-gradient-sky" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Everything You Need for Group Travel
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From planning to memories, WanderTogether has all the tools to make your group adventures seamless and unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="travel-card group border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-sky rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`${feature.color}`} size={32} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
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

        <div className="text-center">
          <Button variant="hero" size="xl" className="shadow-glow">
            Start Planning Your Trip
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;