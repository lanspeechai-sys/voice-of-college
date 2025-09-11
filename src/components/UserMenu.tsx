import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { AuthModal } from '@/components/auth/AuthModal'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { User, Coins, CreditCard, LogOut, Settings } from 'lucide-react'

export const UserMenu: React.FC = () => {
  const { user, userProfile, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  if (!user) {
    return (
      <>
        <Button onClick={() => setShowAuthModal(true)}>
          Sign In
        </Button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    )
  }

  const getSubscriptionBadge = () => {
    if (!userProfile?.subscription_status || userProfile.subscription_status === 'free') {
      return <Badge variant="outline">Free</Badge>
    }
    if (userProfile.subscription_status === 'monthly') {
      return <Badge variant="secondary">Monthly</Badge>
    }
    if (userProfile.subscription_status === 'annual') {
      return <Badge className="bg-gradient-primary text-white">Annual</Badge>
    }
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        {/* Credits Display */}
        <div className="flex items-center space-x-1 text-sm">
          <Coins className="h-4 w-4 text-secondary" />
          <span className="font-medium">{userProfile?.credits || 0}</span>
          <span className="text-muted-foreground">credits</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {userProfile?.full_name || user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col space-y-1">
              <span>{userProfile?.full_name || 'User'}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs">Plan:</span>
                {getSubscriptionBadge()}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="flex items-center justify-between">
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-2" />
                Credits
              </div>
              <Badge variant="outline">{userProfile?.credits || 0}</Badge>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setShowSubscriptionModal(true)}
              className="flex items-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Plan
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={signOut}
              className="flex items-center text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentCredits={userProfile?.credits || 0}
      />
    </>
  )
}