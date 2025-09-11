import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireCredits?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireCredits = false 
}) => {
  const { user, userProfile, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  React.useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true)
    }
  }, [loading, user])

  React.useEffect(() => {
    if (!loading && user && userProfile && requireCredits && userProfile.credits <= 0) {
      setShowSubscriptionModal(true)
    }
  }, [loading, user, userProfile, requireCredits])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-primary">Sign in required</h2>
            <p className="text-muted-foreground">
              Please sign in to access the essay assistant
            </p>
          </div>
        </div>
      </>
    )
  }

  if (requireCredits && userProfile && userProfile.credits <= 0) {
    return (
      <>
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          currentCredits={userProfile.credits}
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-primary">No credits remaining</h2>
            <p className="text-muted-foreground">
              You've used all your credits. Subscribe to continue creating essays.
            </p>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}