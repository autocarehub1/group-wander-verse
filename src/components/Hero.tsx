import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MapPin, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block mb-2">Wander</span>
            <span className="gradient-text">Together</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Plan unforgettable group adventures with friends. Collaborate, coordinate, and create memories that last a lifetime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" className="group">
              Start Your Adventure
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="travel-card bg-white/10 backdrop-blur-sm p-6 text-center group hover:bg-white/15 transition-all duration-300">
              <Users className="mx-auto mb-4 text-primary-glow" size={40} />
              <h3 className="text-xl font-semibold mb-2">Group Planning</h3>
              <p className="text-white/80">Collaborate with friends to plan the perfect trip together</p>
            </div>
            
            <div className="travel-card bg-white/10 backdrop-blur-sm p-6 text-center group hover:bg-white/15 transition-all duration-300">
              <MapPin className="mx-auto mb-4 text-accent" size={40} />
              <h3 className="text-xl font-semibold mb-2">Smart Itineraries</h3>
              <p className="text-white/80">AI-powered suggestions for destinations and activities</p>
            </div>
            
            <div className="travel-card bg-white/10 backdrop-blur-sm p-6 text-center group hover:bg-white/15 transition-all duration-300">
              <Calendar className="mx-auto mb-4 text-nature" size={40} />
              <h3 className="text-xl font-semibold mb-2">Real-time Sync</h3>
              <p className="text-white/80">Stay coordinated with live updates and notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl float"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-accent/20 rounded-full blur-xl float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-nature/20 rounded-full blur-xl float" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default Hero;