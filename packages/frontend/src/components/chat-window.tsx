'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useApi } from '../lib/api';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  RefreshCcw, 
  Tag, 
  Layers, 
  ChevronDown,
  Database,
  FileText,
  X,
  Plus,
  Search
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  status: 'sending' | 'complete' | 'error';
}

interface Document {
  id: string;
  file_name: string;
  section: string;
  s3_path: string;
}

const SECTIONS = ['All Sections', 'General', 'Sales', 'Engineering', 'Marketing', 'Legal', 'HR', 'Production'];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedDocs, setSelectedDocs] = useState<Document[]>([]);
  const [availableDocs, setAvailableDocs] = useState<Document[]>([]);
  const [isDocPickerOpen, setIsDocPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { getToken, user } = useAuth();
  const api = useApi();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDocs() {
      if (!user) return;
      try {
        const profile = await api.get('/auth/me');
        const docs = await api.get(`/documents/${profile.organization_id}`);
        setAvailableDocs(docs);
      } catch (e) {
        console.error("Failed to fetch docs for picker:", e);
      }
    }
    fetchDocs();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessageId = Date.now().toString();
    const userMessage: Message = { id: userMessageId, text: input, sender: 'user', status: 'complete' };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', status: 'sending' }]);

    try {
      const token = await getToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const payload = { 
        query: input,
        section: selectedSection === 'All Sections' ? null : selectedSection,
        document_id: selectedDocs.length > 0 ? selectedDocs[0].s3_path : null // For now, handle single doc filter or refine backend for multiple
      };

      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: fullText } : msg));
      }

      setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, status: 'complete' } : msg));

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, text: 'Neural relay failure. Please check intelligence configuration.', status: 'error' } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const toggleDocSelection = (doc: Document) => {
    if (selectedDocs.find(d => d.id === doc.id)) {
      setSelectedDocs(prev => prev.filter(d => d.id !== doc.id));
    } else {
      setSelectedDocs(prev => [...prev, doc]);
    }
  };

  const filteredDocs = availableDocs.filter(doc => 
    (selectedSection === 'All Sections' || doc.section === selectedSection) &&
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-5xl mx-auto bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Stratum Intelligence</h2>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Quantum Retrieval Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => setIsDocPickerOpen(!isDocPickerOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all ${
                    isDocPickerOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                }`}
            >
                <Plus className={`w-4 h-4 transition-transform ${isDocPickerOpen ? 'rotate-45' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Select Context</span>
            </button>
            <button 
                onClick={() => setMessages([])}
                className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"
            >
                <RefreshCcw className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-grow p-8 overflow-y-auto space-y-10 scrollbar-hide bg-gray-50/30">
            {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative group">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20" />
                <Bot className="w-24 h-24 text-blue-600 relative z-10 drop-shadow-2xl" />
                </div>
                <div className="space-y-3 max-w-md">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Surgical RAG Assistant</h3>
                <p className="text-gray-500 font-medium leading-relaxed px-6">
                    Connect specific documents or entire sections to my neural network for precise, zero-hallucination answers.
                </p>
                </div>
            </div>
            ) : (
            messages.map((msg) => (
                <div 
                key={msg.id} 
                className={`flex items-start space-x-5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''} animate-in slide-in-from-bottom-4 duration-500`}
                >
                <div className={`flex-shrink-0 p-3 rounded-2xl shadow-md ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-blue-600'
                }`}>
                    {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                    {msg.text || <div className="flex space-x-1.5 items-center h-5"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"/><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"/><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"/></div>}
                    </div>
                </div>
                </div>
            ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Doc Picker Sidebar */}
        {isDocPickerOpen && (
            <div className="w-80 bg-white border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl z-20">
                <div className="p-6 border-b border-gray-50 space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Target Knowledge</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Filter documents..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white transition-all"
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {filteredDocs.map(doc => (
                        <button 
                            key={doc.id}
                            onClick={() => toggleDocSelection(doc)}
                            className={`w-full p-3 rounded-2xl flex items-center space-x-3 transition-all border ${
                                selectedDocs.find(d => d.id === doc.id) 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-white border-transparent hover:bg-gray-50'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${selectedDocs.find(d => d.id === doc.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <FileText className="w-3 h-3" />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{doc.file_name}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{doc.section}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-6 border-t border-gray-50">
                    <button 
                        onClick={() => setIsDocPickerOpen(false)}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-100"
                    >
                        Confirm Context
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-gray-50 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
                <select 
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="pl-8 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none hover:bg-white transition-all cursor-pointer"
                >
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            {selectedDocs.map(doc => (
                <div key={doc.id} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 animate-in zoom-in duration-300">
                    <FileText className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter max-w-[100px] truncate">{doc.file_name}</span>
                    <button onClick={() => toggleDocSelection(doc)} className="hover:text-red-200"><X className="w-3 h-3"/></button>
                </div>
            ))}
        </div>

        <form onSubmit={handleSendMessage} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedDocs.length > 0 ? `Inquiring about selected documents...` : `Ask Stratum Intelligence (${selectedSection})...`}
            disabled={isTyping}
            className="w-full pl-8 pr-16 py-6 bg-gray-50 border border-gray-100 rounded-[28px] shadow-inner text-base font-bold focus:bg-white focus:ring-8 focus:ring-blue-50/50 outline-none transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>
  );
}
