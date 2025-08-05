'use client';

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import Link from 'next/link';

// --- Types ---
interface Post {
    id: string;
    content: string;
    created_at: string;
    // author: { full_name: string };
}

interface Thread {
    id: string;
    title: string;
    posts: Post[];
    // author: { full_name: string };
}

// --- Reply Form Component ---
const ReplyForm = ({ threadId, onPostSuccess }: { threadId: string; onPostSuccess: () => void }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.post(`/forums/posts/${threadId}`, { content });
            setContent('');
            onPostSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Post a Reply</h3>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
                className="w-full p-2 border rounded-md"
                placeholder="Share your thoughts..."
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <button type="submit" disabled={isLoading} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                {isLoading ? 'Replying...' : 'Reply'}
            </button>
        </form>
    );
};

// --- Main Page ---
export default function ThreadViewPage({ params }: { params: { id: string } }) {
    const [thread, setThread] = useState<Thread | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchThread = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/forums/threads/${params.id}`);
            setThread(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchThread();
        }
    }, [params.id]);

    if (loading) return <p>Loading thread...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!thread) return <p>Thread not found.</p>;

    return (
        <div>
            <Link href="/dashboard/forums">
                <span className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to all forums</span>
            </Link>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{thread.title}</h1>

            <div className="space-y-4">
                {thread.posts.map(post => (
                    <div key={post.id} className="p-4 bg-white rounded-lg shadow">
                        <p className="text-gray-700">{post.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Posted on {new Date(post.created_at).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <ReplyForm threadId={thread.id} onPostSuccess={fetchThread} />
        </div>
    );
}
