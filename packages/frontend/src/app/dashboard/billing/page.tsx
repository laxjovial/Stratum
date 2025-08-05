'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';

interface Subscription {
    status: string;
    current_period_end: string;
}

const SubscriptionDetails = ({ subscription }: { subscription: Subscription | null }) => {
    const handleManageSubscription = async () => {
        try {
            const { url } = await api.post('/billing/create-portal-session', {
                return_url: window.location.href,
            });
            window.location.href = url;
        } catch (error) {
            console.error("Failed to create portal session:", error);
            alert("Could not manage subscription at this time. Please try again later.");
        }
    };

    if (!subscription) {
        return (
            <div className="p-6 bg-white rounded-lg shadow text-center">
                <p className="mb-4">You do not have an active subscription.</p>
                <Link href="/pricing">
                    <span className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        View Plans
                    </span>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Subscription</h2>
            <div className="space-y-2">
                <p><strong>Status:</strong> <span className="capitalize px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">{subscription.status}</span></p>
                <p><strong>Next Billing Date:</strong> {new Date(subscription.current_period_end).toLocaleDateString()}</p>
            </div>
            <button onClick={handleManageSubscription} className="mt-6 px-4 py-2 font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700">
                Manage Subscription
            </button>
        </div>
    );
};

export default function BillingPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                // This endpoint doesn't exist yet, but illustrates the need for it.
                // It would fetch the subscription details for the logged-in user's org.
                // const data = await api.get('/billing/my-subscription');
                // setSubscription(data);

                // For now, we'll use a mock for UI development
                setSubscription({ status: 'active', current_period_end: '2025-09-04T12:00:00Z' });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Billing</h1>
            {loading && <p>Loading billing information...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && <SubscriptionDetails subscription={subscription} />}
        </div>
    );
}
