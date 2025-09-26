import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/sonner";

const plans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out our AI essay assistant',
    icon: Star,
    features: [
      '1 AI-generated essay',
      'Basic essay templates',
      'Standard AI detection bypass',
      'Download & copy functionality',
      'Community support'
    ],
    limitations: [
      'No human reviews',
      'Limited customization',
      'Basic support only'
    ],
    buttonText: 'Start Free',
    popular: false,
    color: 'text-muted-foreground'
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$20',
    period: 'per month',
    description: 'Unlimited essays with professional human reviews',
    icon: Zap,
    features: [
      'Unlimited AI-generated essays',
      'Advanced AI detection bypass',
      '5 human essay reviews',
      'Premium essay templates',
      'Voice input functionality',
      'Priority support',
      'Essay sharing & collaboration',
      'Advanced editing tools'
    ],
    limitations: [],
    buttonText: 'Start Monthly Plan',
    popular: true,
    color: 'text-primary'
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: '$100',
    period: 'per year',
    description: 'Best value with maximum human reviews',
    icon: Crown,
    features: [
      'Unlimited AI-generated essays',
      'Advanced AI detection bypass',
      '20 human essay reviews',
      'Premium essay templates',
      'Voice input functionality',
      'Priority support',
      'Essay sharing & collaboration',
      'Advanced editing tools',
      '2 months free (save $140)',
      'Dedicated account manager'
    ],
    limitations: [],
    buttonText: 'Start Yearly Plan',
    popular: false,
    color: 'text-secondary'
  }
];

const additionalServices = [
  {
    name: 'Additional Human Review',
    price: '$5',
    period: 'per essay',
    description: 'Professional essay review by experienced admissions counselors',
    icon: Users,
    features: [
      'Detailed feedback and suggestions',
      'Grammar and style improvements',
      'Content and structure analysis',
      '48-hour turnaround',
      'Unlimited revisions based on feedback'
    ]
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Store selected plan in localStorage for signup process
    localStorage.setItem('selectedPlan', planId);
    navigate('/auth', { state: { selectedPlan: planId } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choose Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Get AI-powered essays that bypass detection systems and professional human reviews 
              to maximize your college admission success
            </p>
            
            <div className="mt-8 p-4 sm:p-4 bg-gradient-primary/10 rounded-lg max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ AI Detection Bypass Guaranteed
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All our AI-generated essays are designed to appear completely human and pass 
                Turnitin, ZeroGPT, Grammarly AI Checker, and other detection systems
              </p>
            </div>
          </div>

          {/* Main Plans */}
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-card touch-manipulation ${
                  plan.popular ? 'border-primary shadow-elegant md:scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center">
                            <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                          </div>
                          <span className="text-xs text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full"
                    variant={plan.popular ? "hero" : "outline"}
                    size="lg"
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Services */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Additional Services</h2>
            {additionalServices.map((service, index) => (
              <Card key={index} className="mb-6">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                      <service.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-secondary">{service.price}</span>
                        <span className="text-muted-foreground">{service.period}</span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">How does AI detection bypass work?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our advanced AI uses sophisticated techniques to create essays that mimic natural human writing patterns, 
                    including varied sentence structures, natural flow, and authentic personal voice that passes all major 
                    AI detection systems.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">What's included in human reviews?</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional admissions counselors review your essay for content, structure, grammar, and authenticity. 
                    You'll receive detailed feedback and suggestions for improvement with a 48-hour turnaround.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate any billing differences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}