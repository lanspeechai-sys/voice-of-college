import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown } from 'lucide-react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentCredits: number
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentCredits
}) => {
  const handleSubscribe = async (planType: 'monthly' | 'annual') => {
    // This will be implemented with Stripe integration
    console.log(`Subscribing to ${planType} plan`)
    // For now, just close the modal
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            You're out of credits! 
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Choose a plan to continue creating amazing essays
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Monthly Plan */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-secondary mr-2" />
                <CardTitle className="text-xl">Monthly Plan</CardTitle>
              </div>
              <div className="text-4xl font-bold text-primary">$20</div>
              <p className="text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">50 essay generations per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">AI-powered personalized essays</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">Voice input support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">School-specific prompts</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">Email support</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => handleSubscribe('monthly')}
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative overflow-hidden border-2 border-secondary hover:border-secondary/70 transition-colors">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-secondary to-accent text-white text-center py-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Best Value - Save $140/year
              </Badge>
            </div>
            <CardHeader className="text-center pt-12">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-8 w-8 text-secondary mr-2" />
                <CardTitle className="text-xl">Annual Plan</CardTitle>
              </div>
              <div className="text-4xl font-bold text-primary">$100</div>
              <p className="text-muted-foreground">per year</p>
              <p className="text-sm text-secondary font-medium">
                Just $8.33/month - 58% savings!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">600 essay generations per year</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">AI-powered personalized essays</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">Voice input support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">School-specific prompts</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">Priority email support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-secondary">Bonus: Extra revision features</span>
                </div>
              </div>
              <Button 
                variant="hero"
                className="w-full mt-6" 
                onClick={() => handleSubscribe('annual')}
              >
                Choose Annual
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Current credits: <span className="font-semibold text-foreground">{currentCredits}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Each essay generation uses 1 credit
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}