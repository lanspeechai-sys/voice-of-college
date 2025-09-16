import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CreditCard, Calendar, DollarSign, Settings, Download, ExternalLink } from "lucide-react";
import { getCurrentUser, supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SubscriptionData {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

interface OrderData {
  order_id: number;
  checkout_session_id: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
}

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      setUser(currentUser);

      // Load subscription data
      const { data: subData, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error loading subscription:', subError);
      } else if (subData) {
        setSubscription(subData);
      }

      // Load order history
      const { data: orderData, error: orderError } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (orderError) {
        console.error('Error loading orders:', orderError);
      } else {
        setOrders(orderData || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load subscription data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerPortal = async () => {
    if (!user) return;

    setIsCreatingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-customer-portal`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/subscription-management`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Customer portal error:', error);
      toast.error('Failed to open customer portal. Please try again.');
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const getPlanName = (priceId: string | null) => {
    if (!priceId) return 'Free Plan';
    if (priceId.includes('monthly')) return 'Monthly Pro';
    if (priceId.includes('yearly')) return 'Yearly Pro';
    return 'Pro Plan';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'incomplete':
        return <Badge className="bg-orange-100 text-orange-800">Incomplete</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
                <p className="text-muted-foreground">
                  Manage your subscription, billing, and payment methods
                </p>
              </div>
              <Button 
                onClick={handleCustomerPortal}
                disabled={isCreatingPortal}
                className="gap-2"
              >
                {isCreatingPortal ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    Manage Billing
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscription">Current Subscription</TabsTrigger>
              <TabsTrigger value="billing">Billing History</TabsTrigger>
            </TabsList>

            <TabsContent value="subscription" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {getPlanName(subscription?.price_id)}
                      </span>
                      {getStatusBadge(subscription?.subscription_status || 'not_started')}
                    </div>
                    
                    {subscription?.subscription_status === 'active' && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Billing Cycle:</span>
                            <span>{subscription.price_id?.includes('yearly') ? 'Yearly' : 'Monthly'}</span>
                          </div>
                          {subscription.current_period_end && (
                            <div className="flex justify-between text-sm">
                              <span>Next Billing Date:</span>
                              <span>{formatDate(subscription.current_period_end)}</span>
                            </div>
                          )}
                          {subscription.cancel_at_period_end && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                Your subscription will cancel at the end of the current billing period.
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {(!subscription || subscription.subscription_status === 'not_started') && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">You're currently on the free plan</p>
                        <Button onClick={() => navigate('/pricing')}>
                          Upgrade to Pro
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscription?.payment_method_brand && subscription?.payment_method_last4 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {subscription.payment_method_brand.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• {subscription.payment_method_last4}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.payment_method_brand} ending in {subscription.payment_method_last4}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No payment method on file</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start gap-2"
                      onClick={handleCustomerPortal}
                      disabled={isCreatingPortal}
                    >
                      <Settings className="h-4 w-4" />
                      Update Payment Method
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-2"
                      onClick={() => navigate('/pricing')}
                    >
                      <DollarSign className="h-4 w-4" />
                      Change Plan
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-2"
                      onClick={handleCustomerPortal}
                      disabled={isCreatingPortal}
                    >
                      <Download className="h-4 w-4" />
                      Download Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Billing History
                  </CardTitle>
                  <CardDescription>
                    View your past payments and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.order_id}>
                            <TableCell>
                              {formatDate(order.order_date)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">Splennet Subscription</p>
                                <p className="text-sm text-muted-foreground">
                                  Order #{order.order_id}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(order.amount_total, order.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={order.payment_status === 'paid' ? 'default' : 'destructive'}
                                className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {order.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={handleCustomerPortal}
                                disabled={isCreatingPortal}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Invoice
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No billing history</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't made any payments yet
                      </p>
                      <Button onClick={() => navigate('/pricing')}>
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}