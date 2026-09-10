// Supabase Edge Function: billing-portal
//
// Returns a Stripe Billing Portal URL for the authenticated restaurant
// owner so they can update payment methods, view invoices, or cancel.
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

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

    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_user_id', user.id).single()
    if (!restaurant) {
      return new Response(JSON.stringify({ error: 'RESTAURANT_NOT_FOUND' }), { status: 404, headers: corsHeaders })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('restaurant_id', restaurant.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'NO_STRIPE_CUSTOMER' }), { status: 400, headers: corsHeaders })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard/settings`,
    })

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
