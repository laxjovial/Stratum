'use client';

import { loadStripe } from '@stripe/stripe-js';
import api from '../../lib/api';

// This publishable key would be loaded from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key');

const plans = [
    { name: 'Starter', price: '$20', description: 'per user/month', priceId: 'price_starter_id_placeholder' },
    { name: 'Pro', price: '$50', description: 'per user/month', priceId: 'price_pro_id_placeholder' },
    { name: 'Enterprise', price: 'Contact Us', description: 'for custom needs', priceId: null },
];

const PlanCard = ({ plan, onSubscribe }: { plan: typeof plans[0], onSubscribe: (priceId: string) => void }) => (
    <div className="p-8 border rounded-lg shadow-lg flex flex-col">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="mt-4 text-4xl font-extrabold">{plan.price}</p>
        <p className="text-gray-500">{plan.description}</p>
        <ul className="mt-6 space-y-2 flex-grow">
            {/* Feature list would go here */}
        </ul>
        {plan.priceId ? (
            <button
                onClick={() => onSubscribe(plan.priceId)}
                className="mt-8 w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                Subscribe
            </button>
        ) : (
            <button className="mt-8 w-full px-4 py-2 font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700">
                Contact Sales
            </button>
        )}
    </div>
);


export default function PricingPage() {
    const handleCheckout = async (priceId: string) => {
        try {
            const { sessionId } = await api.post('/billing/create-checkout-session', {
                price_id: priceId,
                success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: window.location.href,
            });
            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({ sessionId });
                if (error) {
                    alert(error.message);
                }
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
            console.error("Checkout failed:", error);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold">Our Pricing</h1>
                    <p className="text-xl text-gray-600 mt-2">Simple, transparent pricing for teams of all sizes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map(plan => (
                        <PlanCard key={plan.name} plan={plan} onSubscribe={handleCheckout} />
                    ))}
                </div>
            </div>
        </div>
    );
}
