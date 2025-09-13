import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { signIn, signUp, getCurrentUser } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { Loader2, GraduationCap, Sparkles, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const planDetails = {
  free: { name: 'Free Plan', price: '$0', essays: 1, reviews: 0 },
  monthly: { name: 'Monthly Pro', price: '$20/month', essays: 'Unlimited', reviews: 5 },
  yearly: { name: 'Yearly Pro', price: '$100/year', essays: 'Unlimited', reviews: 20 }
};

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if user is already authenticated
    getCurrentUser().then(user => {
      if (user) {
        navigate('/dashboard');
      }
    });

    // Get selected plan from navigation state or localStorage
    const planFromState = location.state?.selectedPlan;
    const planFromStorage = localStorage.getItem('selectedPlan');
    const plan = planFromState || planFromStorage || 'free';
    setSelectedPlan(plan);
  }, [navigate, location]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully signed in!");
        localStorage.removeItem('selectedPlan');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Welcome to EssayAI!");
        localStorage.removeItem('selectedPlan');
        
        // For non-free plans, redirect to payment
        if (selectedPlan !== 'free') {
          toast.info("Please complete payment to activate your plan");
          // TODO: Integrate with payment processor
        }
        
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = planDetails[selectedPlan as keyof typeof planDetails];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Header />
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Plan Selection */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="relative">
                <GraduationCap className="h-10 w-10 text-primary" />
                <Sparkles className="h-5 w-5 text-secondary absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                EssayAI
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Join Thousands of Students
            </h1>
            <p className="text-muted-foreground">
              Create compelling college essays with AI that bypasses detection systems
            </p>
          </div>

          {/* Plan Selection */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Selected Plan</CardTitle>
              <CardDescription>You can change this anytime after signup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(planDetails).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{plan.name}</h3>
                          {key === 'monthly' && (
                            <Badge variant="secondary">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.price}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{plan.essays} essays</p>
                        <p>{plan.reviews} human reviews</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">AI essays that bypass detection systems</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Voice input for natural storytelling</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Professional human reviews available</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Secure essay storage and sharing</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your account to start writing winning essays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      By signing up, you agree to our Terms of Service and Privacy Policy. 
                      You're selecting the <strong>{currentPlan.name}</strong> plan.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account & Start Writing
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/pricing')}
              >
                View All Plans & Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}