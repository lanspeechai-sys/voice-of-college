import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, Crown } from 'lucide-react';
import { getCurrentUser, getUserUsage } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface UsageData {
  essays_generated: number;
  human_reviews_used: number;
  subscription_plan: string;
  plan_limits: {
    essays: number;
    human_reviews: number;
  };
}

export default function UsageIndicator() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getUserUsage(user.id);
      if (!error && data) {
        setUsage(data);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return null;
  }

  const essayProgress = usage.plan_limits.essays === -1 
    ? 100 
    : (usage.essays_generated / usage.plan_limits.essays) * 100;
  
  const reviewProgress = usage.plan_limits.human_reviews === -1 
    ? 100 
    : usage.plan_limits.human_reviews === 0 
      ? 0 
      : (usage.human_reviews_used / usage.plan_limits.human_reviews) * 100;

  const isNearLimit = essayProgress >= 80 || reviewProgress >= 80;
  const isAtLimit = essayProgress >= 100 || (usage.plan_limits.human_reviews > 0 && reviewProgress >= 100);

  if (usage.subscription_plan !== 'free') {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {usage.subscription_plan === 'yearly' ? (
                <Crown className="h-4 w-4 text-secondary" />
              ) : (
                <Zap className="h-4 w-4 text-primary" />
              )}
              {usage.subscription_plan === 'monthly' ? 'Monthly Pro' : 'Yearly Pro'}
            </CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Essays</span>
              <span className="text-green-600 font-medium">Unlimited</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Human Reviews</span>
              <span>{usage.human_reviews_used} / {usage.plan_limits.human_reviews}</span>
            </div>
            <Progress value={reviewProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isAtLimit ? 'border-destructive' : isNearLimit ? 'border-yellow-500' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Free Plan Usage</CardTitle>
          {isAtLimit && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limit Reached
            </Badge>
          )}
          {isNearLimit && !isAtLimit && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Near Limit
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Essays Generated</span>
            <span className={essayProgress >= 100 ? 'text-destructive font-medium' : ''}>
              {usage.essays_generated} / {usage.plan_limits.essays}
            </span>
          </div>
          <Progress 
            value={essayProgress} 
            className={`h-2 ${essayProgress >= 100 ? '[&>div]:bg-destructive' : essayProgress >= 80 ? '[&>div]:bg-yellow-500' : ''}`} 
          />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Human Reviews</span>
            <span className={reviewProgress >= 100 ? 'text-destructive font-medium' : ''}>
              {usage.human_reviews_used} / {usage.plan_limits.human_reviews}
            </span>
          </div>
          <Progress 
            value={reviewProgress} 
            className={`h-2 ${reviewProgress >= 100 ? '[&>div]:bg-destructive' : reviewProgress >= 80 ? '[&>div]:bg-yellow-500' : ''}`} 
          />
        </div>

        {(isNearLimit || isAtLimit) && (
          <div className="pt-2 border-t">
            <Button 
              variant="hero" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/pricing')}
            >
              {isAtLimit ? 'Upgrade to Continue' : 'Upgrade Plan'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}