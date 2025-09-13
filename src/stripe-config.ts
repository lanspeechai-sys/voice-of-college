export const STRIPE_PRODUCTS = {
  humanReview: {
    priceId: 'price_human_review_5',
    name: 'Human Review',
    description: 'Professional essay review by admissions counselors',
    price: '$5.00',
    mode: 'payment' as const
  },
  monthlyPro: {
    priceId: 'price_monthly_pro_20',
    name: 'Monthly Pro',
    description: 'Unlimited essays and 5 human reviews per month',
    price: '$20.00',
    mode: 'subscription' as const
  },
  yearlyPro: {
    priceId: 'price_yearly_pro_100',
    name: 'Yearly Pro',
    description: 'Unlimited essays and 20 human reviews per year',
    price: '$100.00',
    mode: 'subscription' as const
  }
} as const;

export const PLAN_LIMITS = {
  free: {
    essays: 1,
    humanReviews: 0
  },
  monthly: {
    essays: -1, // unlimited
    humanReviews: 5
  },
  yearly: {
    essays: -1, // unlimited
    humanReviews: 20
  }
} as const;