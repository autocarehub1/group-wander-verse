import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Star } from "lucide-react";

const TripPlanningDemo = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See <span className="gradient-text">Group Planning</span> in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how easy it is to plan and coordinate amazing group adventures with your friends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Demo Interface */}
          <div className="space-y-6">
            {/* Trip Header */}
            <Card className="travel-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <MapPin className="text-primary" size={24} />
                      Bali Adventure 2024
                    </CardTitle>
                    <CardDescription className="mt-2">March 15-25 • 7 travelers</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-nature text-nature-foreground">
                    Planning
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Group Members */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="text-primary" size={20} />
                  Group Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {['Sarah', 'Mike', 'Anna', 'Tom', 'Lisa'].map((name, index) => (
                    <div key={index} className="text-center">
                      <Avatar className="w-10 h-10 bg-gradient-hero border-2 border-primary/20">
                        <AvatarFallback className="text-white text-sm font-semibold">
                          {name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs mt-1 text-muted-foreground">{name}</p>
                    </div>
                  ))}
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">+2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itinerary Items */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="text-primary" size={20} />
                  Today's Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Ubud Rice Terraces</p>
                    <p className="text-sm text-muted-foreground">9:00 AM - 12:00 PM</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-adventure fill-current" size={16} />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Traditional Cooking Class</p>
                    <p className="text-sm text-muted-foreground">2:00 PM - 5:00 PM</p>
                  </div>
                  <Badge variant="secondary" className="bg-cultural text-cultural-foreground">
                    Voted
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border-2 border-dashed border-muted rounded-lg">
                  <div>
                    <p className="font-medium text-muted-foreground">Evening Activity</p>
                    <p className="text-sm text-muted-foreground">Pending votes</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Vote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Group</h3>
                  <p className="text-muted-foreground">
                    Start by creating a trip and inviting your travel companions. Everyone gets access to the shared planning space.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-nature rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Plan Together</h3>
                  <p className="text-muted-foreground">
                    Collaborate on itineraries, vote on activities, and make decisions as a group. Everyone's voice is heard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-adventure rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Travel & Coordinate</h3>
                  <p className="text-muted-foreground">
                    Stay connected during your trip with real-time updates, location sharing, and group messaging.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button variant="hero" size="xl" className="w-full md:w-auto">
                Try the Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripPlanningDemo;