import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 text-secondary h-6 w-6 animate-pulse" />
        <Sparkles className="absolute top-32 right-20 text-accent h-5 w-5 animate-bounce delay-1000" />
        <Star className="absolute bottom-32 left-20 text-primary h-4 w-4 animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">AI-Powered Essay Writing</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Craft Winning{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                College Essays
              </span>{" "}
              in Minutes
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get into your dream school with AI that preserves your unique voice while 
              crafting compelling, authentic essays tailored to any prompt.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="group"
              onClick={() => navigate("/auth")}
            >
              Start Writing My Essay
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              See How It Works
            </Button>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold border-2 border-background"
                  >
                    {String.fromCharCode(65 + i - 1)}
                  </div>
                ))}
              </div>
              <span>10,000+ essays created</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-3xl opacity-20 scale-105" />
          <img
            src={heroImage}
            alt="AI-powered college essay writing assistant"
            className="relative z-10 w-full rounded-2xl shadow-elegant"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;