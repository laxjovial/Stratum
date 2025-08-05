'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import Link from 'next/link';

export default function NewThreadPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const newThread = await api.post('/forums/threads', {
                title,
                first_post_content: content,
                // In a real app, we might have a dropdown to select a department
                department_id: null,
            });
            router.push(`/dashboard/forums/${newThread.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Link href="/dashboard/forums">
                <span className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to all forums</span>
            </Link>
            <h1 className="text-3xl font-bold mb-6">Create New Forum Thread</h1>
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Thread Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 mt-1 border rounded-md"
                        placeholder="A clear and concise title"
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Your first post
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        required
                        className="w-full px-3 py-2 mt-1 border rounded-md"
                        placeholder="Start the conversation..."
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                    {isLoading ? 'Creating...' : 'Create Thread'}
                </button>
            </form>
        </div>
    );
}
