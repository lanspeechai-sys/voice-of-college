import { GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <GraduationCap className="h-8 w-8 text-primary" />
            <Sparkles className="h-4 w-4 text-secondary absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            EssayAI
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
            How it Works
          </a>
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </a>
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button 
            variant="hero" 
            size="sm"
            onClick={() => navigate("/essay-builder")}
          >
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;