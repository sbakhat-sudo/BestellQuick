// Supabase Edge Function: stripe-webhook
//
// Receives Stripe webhook events and keeps `subscriptions` / `restaurants`
// in sync. Uses the service role key, so it bypasses RLS by design — this
// is the only place (besides onboard_restaurant/create_order RPCs) allowed
// to write these rows.
//
// Configure in the Stripe dashboard: POST to
//   https://<project-ref>.functions.supabase.co/stripe-webhook
// listening for: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const PRICE_TO_PLAN: Record<string, 'pro' | 'annual'> = {
  [Deno.env.get('STRIPE_PRICE_PRO') ?? '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_ANNUAL') ?? '']: 'annual',
}

async function upsertFromSubscription(restaurantId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id
  const plan = (priceId && PRICE_TO_PLAN[priceId]) || 'pro'
  const status = subscription.status === 'trialing' ? 'trialing' : subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : subscription.status === 'canceled' ? 'canceled' : 'incomplete'

  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan,
      status,
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('restaurant_id', restaurantId)

  await supabaseAdmin.from('restaurants').update({ plan }).eq('id', restaurantId)
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', webhookSecret)
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const restaurantId = session.metadata?.restaurant_id
        if (restaurantId && session.customer && session.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ stripe_customer_id: session.customer as string })
            .eq('restaurant_id', restaurantId)

          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertFromSubscription(restaurantId, subscription)
        }
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const { data } = await supabaseAdmin
          .from('subscriptions')
          .select('restaurant_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()
        if (data) await upsertFromSubscription(data.restaurant_id, subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { data } = await supabaseAdmin
          .from('subscriptions')
          .select('restaurant_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()
        if (data) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ plan: 'free', status: 'canceled' })
            .eq('restaurant_id', data.restaurant_id)
          await supabaseAdmin.from('restaurants').update({ plan: 'free' }).eq('id', data.restaurant_id)
        }
        break
      }
      default:
        break
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
})
