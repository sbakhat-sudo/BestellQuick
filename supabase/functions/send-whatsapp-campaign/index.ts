// Supabase Edge Function: send-whatsapp-campaign
//
// Sends a WhatsApp campaign message to a restaurant's customer list (or a
// segment of it) using the Meta WhatsApp Cloud API. Reserved for Pro/Annual
// plans (enforced both here and in the dashboard UI).
//
// Required secrets: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID
// (Twilio's WhatsApp API is a drop-in alternative — swap the fetch call in
// sendWhatsappMessage() below for Twilio's REST API if preferred.)
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN') ?? ''
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') ?? ''
const INACTIVE_DAYS_THRESHOLD = 30

async function sendWhatsappMessage(to: string, body: string): Promise<boolean> {
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    })
    return res.ok
  } catch {
    return false
  }
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

    const { campaignId } = await req.json()

    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('*, restaurants!inner(id, owner_user_id, plan)')
      .eq('id', campaignId)
      .single()
    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: 'CAMPAIGN_NOT_FOUND' }), { status: 404, headers: corsHeaders })
    }

    const restaurant = campaign.restaurants as { id: string; owner_user_id: string; plan: string }
    if (restaurant.owner_user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'NOT_AUTHORIZED' }), { status: 403, headers: corsHeaders })
    }
    if (restaurant.plan === 'free') {
      return new Response(JSON.stringify({ error: 'PLAN_UPGRADE_REQUIRED' }), { status: 402, headers: corsHeaders })
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('customer_name, customer_phone, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })
    if (ordersError) throw ordersError

    const latestByPhone = new Map<string, string>()
    for (const order of orders ?? []) {
      if (!latestByPhone.has(order.customer_phone)) {
        latestByPhone.set(order.customer_phone, order.created_at)
      }
    }

    const cutoff = Date.now() - INACTIVE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000
    const recipients = Array.from(latestByPhone.entries()).filter(([, lastOrderAt]) => {
      if (campaign.target_segment === 'inactive') {
        return new Date(lastOrderAt).getTime() < cutoff
      }
      return true
    })

    let successCount = 0
    for (const [phone] of recipients) {
      const ok = await sendWhatsappMessage(phone, campaign.message)
      if (ok) successCount++
    }

    await supabase
      .from('whatsapp_campaigns')
      .update({ sent_at: new Date().toISOString(), recipients_count: successCount })
      .eq('id', campaignId)

    return new Response(JSON.stringify({ recipients_count: successCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
