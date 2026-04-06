/**
 * Edge Function stripe-webhook — Reçoit les événements Stripe
 * Gère : checkout.session.completed, customer.subscription.updated/deleted
 * Met à jour la table subscriptions dans Supabase
 */

import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-12-18.acacia',
  })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Verify webhook signature
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set')
      return new Response('Webhook secret not configured', { status: 500 })
    }
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  console.log(`Stripe event: ${event.type}`)

  try {
    switch (event.type) {
      // Paiement réussi — activer l'abonnement
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.customer_email ?? session.metadata?.email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!email) {
          console.error('No email in checkout session')
          break
        }

        // Récupérer les détails de l'abonnement
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await supabase.from('subscriptions').upsert(
          {
            email,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )

        console.log(`Subscription activated for ${email}`)
        break
      }

      // Abonnement mis à jour (renouvellement, changement)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Trouver l'email via le customer
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const email = customer.email

        if (!email) break

        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : 'inactive'

        await supabase.from('subscriptions').upsert(
          {
            email,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )

        console.log(`Subscription ${status} for ${email}`)
        break
      }

      // Abonnement annulé
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId)
          .select()

        if (data?.[0]) {
          console.log(`Subscription canceled for ${data[0].email}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook processing error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
