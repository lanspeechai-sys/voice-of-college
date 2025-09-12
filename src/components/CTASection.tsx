import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-10 left-10 text-secondary h-8 w-8 animate-pulse opacity-30" />
        <Star className="absolute bottom-10 right-10 text-accent h-6 w-6 animate-pulse delay-1000 opacity-30" />
        <Star className="absolute top-1/2 left-1/4 text-primary h-4 w-4 animate-pulse delay-500 opacity-30" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Ready to Write Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Dream School Essay?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            Join thousands of students who've already crafted compelling essays with EssayAI. 
            Start your journey to college admission success today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="group"
              onClick={() => navigate("/auth")}
            >
              Start Writing Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
              ))}
            </div>
            <span>Free to try • No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;