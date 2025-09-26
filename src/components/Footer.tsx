import { GraduationCap, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <GraduationCap className="h-8 w-8 text-primary" />
                <Sparkles className="h-4 w-4 text-secondary absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Splennet
              </span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Empowering students to craft compelling college essays with AI assistance while preserving their authentic voice.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="/#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="/auth" className="hover:text-primary transition-colors">Get Started</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="mailto:support@essayai.com" className="hover:text-primary transition-colors">Contact Support</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Plans & Pricing</a></li>
              <li><a href="/auth" className="hover:text-primary transition-colors">Sign Up</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="/refunds" className="hover:text-primary transition-colors">Refund Policy</a></li>
              <li><a href="/academic-integrity" className="hover:text-primary transition-colors">Academic Integrity</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2024 Splennet. All rights reserved. Built to help students succeed ethically.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;