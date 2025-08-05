'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';

export default function LessonBuilderPage() {
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
            const newLesson = await api.post('/lessons/', { title, content });
            alert('Lesson created successfully!');
            router.push(`/dashboard/learn/lesson/${newLesson.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Lesson Builder</h1>
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Lesson Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 mt-1 border rounded-md"
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content (Markdown supported)
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        className="w-full px-3 py-2 mt-1 border rounded-md"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                    {isLoading ? 'Saving...' : 'Save Lesson'}
                </button>
            </form>
        </div>
    );
}
