import { useState, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, AlertTriangle } from 'lucide-react';
import { STRIPE_PRODUCTS } from '@/stripe-config';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

