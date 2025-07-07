import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MapPin, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";
import wanderTogetherLogo from "@/assets/wandertogether-logo.png";

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
          <div className="flex justify-center mb-8">
            <img 
              src={wanderTogetherLogo} 
              alt="WanderTogether Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain animate-float"
            />
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="feature-card p-8 text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <Users className="relative mx-auto text-primary-glow" size={48} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary-glow transition-colors">Group Planning</h3>
              <p className="text-white/90 leading-relaxed">Collaborate with friends to plan the perfect trip together with seamless coordination</p>
            </div>
            
            <div className="feature-card p-8 text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl"></div>
                <MapPin className="relative mx-auto text-accent" size={48} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">Smart Itineraries</h3>
              <p className="text-white/90 leading-relaxed">AI-powered suggestions for destinations and activities tailored to your group</p>
            </div>
            
            <div className="feature-card p-8 text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-nature/20 rounded-full blur-xl"></div>
                <Calendar className="relative mx-auto text-nature" size={48} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-nature transition-colors">Real-time Sync</h3>
              <p className="text-white/90 leading-relaxed">Stay coordinated with live updates and instant notifications</p>
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