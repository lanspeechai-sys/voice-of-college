import { GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, signOut } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import { toast } from "@/components/ui/sonner";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

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
            Splennet
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Features
          </a>
          
          {isLoading ? (
            <div className="w-16 h-8 bg-muted animate-pulse rounded" />
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hidden lg:inline-flex">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/human-review")} className="hidden lg:inline-flex">
                Human Review
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reviewer-dashboard")} className="hidden xl:inline-flex">
                Reviewer
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/subscription-management")} className="hidden xl:inline-flex">
                Billing
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden lg:inline-flex">
                Sign Out
              </Button>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate("/essay-builder")}
              >
                New Essay
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)} className="hidden sm:inline-flex">
                Sign In
              </Button>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <a href="/#features" className="text-lg font-medium hover:text-primary transition-colors">
                  Features
                </a>
                
                <div className="border-t pt-4 space-y-3">
                  {isLoading ? (
                    <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                  ) : user ? (
                    <>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/human-review")}>
                        Human Review
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/reviewer-dashboard")}>
                        Reviewer Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/subscription-management")}>
                        Subscription & Billing
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => navigate("/essay-builder")}
                      >
                        New Essay
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setShowAuthModal(true)}>
                        Sign In
                      </Button>
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => navigate("/auth")}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={loadUser}
        />
      </div>
    </header>
  );
};

export default Header;