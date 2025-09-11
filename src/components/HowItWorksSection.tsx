import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, MessageSquare, Sparkles, FileText } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: School,
      step: "01",
      title: "Choose Your School & Prompt",
      description: "Select your target university and essay prompt from our comprehensive database or add your own custom prompt.",
      color: "text-primary"
    },
    {
      icon: MessageSquare,
      step: "02", 
      title: "Share Your Story",
      description: "Answer guided questions about your experiences, goals, and background. Use text or voice input to tell your story naturally.",
      color: "text-secondary"
    },
    {
      icon: Sparkles,
      step: "03",
      title: "AI Crafts Your Essay",
      description: "Our AI analyzes your responses and creates a compelling, authentic essay that captures your unique voice and experiences.",
      color: "text-accent"
    },
    {
      icon: FileText,
      step: "04",
      title: "Review & Refine",
      description: "Edit your essay, get feedback from advisors, and make final refinements before submitting your application.",
      color: "text-primary"
    }
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            How It{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to create standout college essays that reflect your authentic voice
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
              )}
              
              <Card className="relative z-10 text-center hover:shadow-card transition-all duration-300 border-0 bg-background">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`text-sm font-semibold ${step.color} mb-2`}>
                    STEP {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;