'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth'; // To get user/org info

interface Thread {
    id: string;
    title: string;
    created_at: string;
    // author info would be nice here
}

// TODO: Create a dedicated component for creating a new thread
const NewThreadButton = () => (
    <div className="mb-6">
        <Link href="/dashboard/forums/new">
            <span className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Create New Thread
            </span>
        </Link>
    </div>
);

export default function ForumsListPage() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchThreads = async () => {
            if (!user) return; // Wait for user context

            try {
                // We need the user's organization ID. This should be part of the user context.
                // For now, this is a placeholder. A real implementation would fetch this from the user's profile.
                const orgId = 'placeholder-organization-id';
                const data = await api.get(`/forums/organization/${orgId}/threads`);
                setThreads(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [user]);

    if (loading) return <p>Loading forums...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Community Forums</h1>
                <NewThreadButton />
            </div>
            <div className="bg-white rounded-lg shadow">
                <ul className="divide-y divide-gray-200">
                    {threads.length > 0 ? threads.map(thread => (
                        <li key={thread.id} className="p-4 hover:bg-gray-50">
                            <Link href={`/dashboard/forums/${thread.id}`}>
                                <span className="font-medium text-blue-600 cursor-pointer">{thread.title}</span>
                                <p className="text-sm text-gray-500 mt-1">
                                    Created on {new Date(thread.created_at).toLocaleDateString()}
                                </p>
                            </Link>
                        </li>
                    )) : (
                        <li className="p-4 text-center text-gray-500">No threads yet. Be the first to create one!</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
