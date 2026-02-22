import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export default stripe;

export const createCheckoutSession = async (
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
) => {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
};

export const createCustomer = async (email: string, userId: string) => {
    return await stripe.customers.create({
        email,
        metadata: {
            supabase_user_id: userId,
        },
    });
};

export const getSubscription = async (subscriptionId: string) => {
    return await stripe.subscriptions.retrieve(subscriptionId);
};

export const cancelSubscription = async (subscriptionId: string) => {
    return await stripe.subscriptions.cancel(subscriptionId);
};
