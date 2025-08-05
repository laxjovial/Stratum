'use client';

import { useState, useEffect } from 'react';
import api from '../../../../../lib/api';

interface Lesson {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

// A simple component to render markdown-like text
const SimpleMarkdownRenderer = ({ text }: { text: string }) => {
    return (
        <div className="prose lg:prose-xl">
            {text.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
        </div>
    );
};

export default function LessonViewPage({ params }: { params: { id: string } }) {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/lessons/${params.id}`);
                setLesson(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchLesson();
        }
    }, [params.id]);

    if (loading) return <p>Loading lesson...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!lesson) return <p>Lesson not found.</p>;

    return (
        <article className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-500 mt-2">
                    Published on {new Date(lesson.created_at).toLocaleDateString()}
                </p>
            </header>
            <div className="p-6 bg-white rounded-lg shadow">
                <SimpleMarkdownRenderer text={lesson.content} />
            </div>
        </article>
    );
}
