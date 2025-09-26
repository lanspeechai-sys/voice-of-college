import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Clock, Users, Shield, Sparkles, Target } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI That Understands You",
      description: "Our advanced AI captures your unique voice and experiences to create authentic, personalized essays.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Clock,
      title: "Write Essays in Minutes",
      description: "Complete your application essays quickly with our guided questionnaire and instant AI generation.",
      gradient: "from-secondary to-accent"
    },
    {
      icon: Target,
      title: "School-Specific Tailoring",
      description: "Essays optimized for your target schools' preferences and admission criteria.",
      gradient: "from-accent to-primary"
    },
    {
      icon: Users,
      title: "Human Review Ready",
      description: "Essays structured for easy review and collaboration with counselors, teachers, or mentors.",
      gradient: "from-primary to-secondary"
    },
    {
      icon: Shield,
      title: "Plagiarism-Free Guarantee",
      description: "Every essay is uniquely generated based on your personal experiences and stories.",
      gradient: "from-secondary to-primary"
    },
    {
      icon: Sparkles,
      title: "Voice Input Support",
      description: "Share your stories naturally through voice input for a more conversational experience.",
      gradient: "from-accent to-secondary"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Stand Out
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Powerful AI tools designed to help you create compelling essays that showcase your unique story
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-card transition-all duration-300 border-0 bg-background touch-manipulation">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;