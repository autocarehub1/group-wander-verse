import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TripPlanningDemo from "@/components/TripPlanningDemo";

const Index = () => {
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