import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, AlertTriangle } from 'lucide-react';
import { STRIPE_PRODUCTS } from '@/stripe-config';
import { getCurrentUser } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'essay' | 'human_review';
  remaining: number;
}

export default function UpgradeModal({ isOpen, onClose, actionType, remaining }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (productKey: 'monthlyPro' | 'yearlyPro') => {
    setIsLoading(true);
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('Please sign in to upgrade');
        return;
      }

      const product = STRIPE_PRODUCTS[productKey];
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/dashboard?upgrade=success`,
          cancel_url: `${window.location.origin}/pricing?upgrade=cancelled`,
          mode: product.mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (remaining === 0) {
      return actionType === 'essay' ? 'Essay Limit Reached' : 'Human Review Limit Reached';
    }
    return 'Upgrade to Continue';
  };

  const getDescription = () => {
    if (remaining === 0) {
      return actionType === 'essay' 
        ? "You've used all your free essays. Upgrade to continue creating essays."
        : "You've used all your free human reviews. Upgrade to get professional feedback.";
    }
    return `You have ${remaining} ${actionType === 'essay' ? 'essay' : 'human review'}${remaining === 1 ? '' : 's'} remaining on your free plan.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Monthly Pro</CardTitle>
                <Badge variant="secondary">Popular</Badge>
              </div>
              <div className="text-2xl font-bold text-primary">$20<span className="text-sm font-normal">/month</span></div>
              <CardDescription>Perfect for active essay writers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Unlimited essays</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>5 human reviews per month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Priority support</span>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => handleUpgrade('monthlyPro')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Monthly'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-secondary" />
                <CardTitle className="text-lg">Yearly Pro</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Save $140</Badge>
              </div>
              <div className="text-2xl font-bold text-secondary">$100<span className="text-sm font-normal">/year</span></div>
              <CardDescription>Best value for serious applicants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Unlimited essays</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>20 human reviews per year</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Dedicated account manager</span>
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={() => handleUpgrade('yearlyPro')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Yearly'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onClose} disabled={remaining === 0}>
            {remaining === 0 ? 'Upgrade Required' : 'Maybe Later'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}