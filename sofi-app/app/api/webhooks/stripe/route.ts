import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.supabase_user_id;

    if (!userId) {
        console.error('No supabase_user_id in subscription metadata');
        return;
    }

    const plan = subscription.items.data[0]?.price.recurring?.interval;

    await supabase
        .from('subscriptions')
        .update({
            status: 'active',
            plan: plan === 'month' ? 'monthly' : 'annual',
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            trial_ends_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.supabase_user_id;

    if (!userId) {
        console.error('No supabase_user_id in subscription metadata');
        return;
    }

    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscription = invoice.subscription;

    if (!subscription) return;

    // Get subscription to find user_id
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription as string);
    const userId = stripeSubscription.metadata.supabase_user_id;

    if (!userId) {
        console.error('No supabase_user_id in subscription metadata');
        return;
    }

    await supabase
        .from('subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
}
