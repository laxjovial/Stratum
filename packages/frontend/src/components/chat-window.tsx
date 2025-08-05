'use client';

import React, { useState, useRef, useEffect } from 'react';
import api from '../lib/api'; // Using our centralized API utility

// --- Types ---
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

// --- Chat Window Component ---
export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);

        try {
            // NOTE: We are using a raw `fetch` call here instead of our `api` utility
            // because the utility is not designed to handle streaming responses.
            // A more advanced implementation might extend the api utility to support streams.
            const token = await api.auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error("User not authenticated.");
            }

            const response = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: input }),
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });

                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, text: msg.text + chunk } : msg
                ));
            }

        } catch (error) {
            console.error("Error fetching chat response:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, text: 'Sorry, I encountered an error.' } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow">
            {/* Message Display Area */}
            <div className="flex-grow p-6 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.text || '...'}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none"
                    />
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-r-lg disabled:bg-gray-400">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
