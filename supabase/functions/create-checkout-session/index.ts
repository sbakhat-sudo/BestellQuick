// Supabase Edge Function: create-checkout-session
//
// Called from the dashboard's Settings page (Pro / Annual "Upgrade" buttons).
// Creates (or reuses) a Stripe Customer for the restaurant, then a Checkout
// Session for the requested plan, and returns its URL for the client to
// redirect to.
//
// Required secrets (set with `supabase secrets set`):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_PRICE_ANNUAL, APP_URL
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

const PRICE_IDS: Record<string, string | undefined> = {
  pro: Deno.env.get('STRIPE_PRICE_PRO'),
  annual: Deno.env.get('STRIPE_PRICE_ANNUAL'),
}

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'AUTH_REQUIRED' }), { status: 401, headers: corsHeaders })
    }

    const { plan } = await req.json()
    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'INVALID_PLAN' }), { status: 400, headers: corsHeaders })
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, email')
      .eq('owner_user_id', user.id)
      .single()
    if (restaurantError || !restaurant) {
      return new Response(JSON.stringify({ error: 'RESTAURANT_NOT_FOUND' }), { status: 404, headers: corsHeaders })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('restaurant_id', restaurant.id)
      .single()

    let customerId = subscription?.stripe_customer_id ?? undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: restaurant.email ?? user.email,
        name: restaurant.name,
        metadata: { restaurant_id: restaurant.id },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: plan === 'pro' ? { trial_period_days: 3 } : undefined,
      success_url: `${appUrl}/dashboard/settings?checkout=success`,
      cancel_url: `${appUrl}/dashboard/settings?checkout=cancelled`,
      metadata: { restaurant_id: restaurant.id, plan },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
