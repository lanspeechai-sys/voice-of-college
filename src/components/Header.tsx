import { GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, memo } from "react";
import { getCurrentUser, signOut } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import { toast } from "@/components/ui/sonner";

const Header = memo(() => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      setIsMobileMenuOpen(false);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  }, [navigate]);

  const handleMobileNavigation = useCallback((path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  }, [navigate]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
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
          <a href="https://www.youtube.com/@splennet" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Demo
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
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Splennet</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex flex-col space-y-2 p-4 flex-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg py-6"
                  onClick={() => handleMobileNavigation("/#features")}
                >
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg py-6"
                  onClick={() => window.open("https://www.youtube.com/@splennet", "_blank")}
                >
                  Demo
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg py-6"
                  onClick={() => handleMobileNavigation("/pricing")}
                >
                  Pricing
                </Button>
                
                <div className="border-t pt-4 space-y-3 mt-4">
                  {isLoading ? (
                    <div className="w-full h-12 bg-muted animate-pulse rounded" />
                  ) : user ? (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-6 text-lg" 
                        onClick={() => handleMobileNavigation("/dashboard")}
                      >
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-6 text-lg" 
                        onClick={() => handleMobileNavigation("/human-review")}
                      >
                        Human Review
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-6 text-lg" 
                        onClick={() => handleMobileNavigation("/reviewer-dashboard")}
                      >
                        Reviewer Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-6 text-lg" 
                        onClick={() => handleMobileNavigation("/subscription-management")}
                      >
                        Subscription & Billing
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-6 text-lg text-destructive" 
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-6 text-lg" 
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setShowAuthModal(true);
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="p-4 border-t mt-auto">
                  {user ? (
                    <Button 
                      variant="hero" 
                      className="w-full py-6 text-lg"
                      onClick={() => handleMobileNavigation("/essay-builder")}
                    >
                      New Essay
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      className="w-full py-6 text-lg"
                      onClick={() => handleMobileNavigation("/auth")}
                    >
                      Get Started
                    </Button>
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
});

Header.displayName = "Header";

export default Header;