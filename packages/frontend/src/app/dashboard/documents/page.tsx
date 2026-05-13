'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../hooks/use-auth';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  MoreVertical, 
  Tag, 
  Layers,
  ChevronDown,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Check
} from 'lucide-react';

enum DocumentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

interface Document {
  id: string;
  file_name: string;
  status: DocumentStatus;
  section: string;
  uploaded_at: string;
  s3_path: string;
}

const SECTIONS = ['General', 'Sales', 'Engineering', 'Marketing', 'Legal', 'HR', 'Production'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedSection, setSelectedSection] = useState('General');
  const [filterSection, setFilterSection] = useState('All');
  
  // Edit State
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editSection, setEditSection] = useState('');

  const api = useApi();
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const profile = await api.get('/auth/me');
      if (profile.organization_id) {
        const url = filterSection === 'All' 
          ? `/documents/${profile.organization_id}` 
          : `/documents/${profile.organization_id}?section=${filterSection}`;
        const data = await api.get(url);
        setDocuments(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user, filterSection]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const profile = await api.get('/auth/me');

      // 1. Get a pre-signed URL (Dual Provider: S3 or Supabase)
      const presignedData = await api.post('/documents/presigned-url', {
        file_name: file.name,
        file_type: file.type,
      });

      // 2. Upload directly to provider
      if (presignedData.provider === 's3') {
        const formData = new FormData();
        Object.entries(presignedData.fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append('file', file);
        const s3Response = await fetch(presignedData.url, { method: 'POST', body: formData });
        if (!s3Response.ok) throw new Error('S3 Upload failed');
      } else {
        // Supabase Direct Upload via Signed URL
        const supabaseResponse = await fetch(presignedData.url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type, 'x-upsert': 'true' }
        });
        if (!supabaseResponse.ok) throw new Error('Supabase Storage Upload failed');
      }

      // 3. Create document record
      await api.post('/documents/', {
        file_name: file.name,
        s3_path: presignedData.fields.key,
        section: selectedSection,
        organization_id: profile.organization_id,
        uploader_id: profile.id
      });

      setFile(null);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This will remove its intelligence from the RAG system.')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateSection = async (id: string) => {
    try {
      await api.patch(`/documents/${id}`, { section: editSection });
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, section: editSection } : d));
      setEditingDoc(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Knowledge Assets</h1>
          <p className="text-gray-500 font-medium italic">Provider-agnostic storage & intelligence (S3/Supabase Integration)</p>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold"
            >
              <option value="All">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-black text-gray-900">Ingest New Data</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Office, Excel, PDF, MD, TXT</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Section</label>
                <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none appearance-none transition-all font-bold text-sm"
                    >
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group overflow-hidden">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-500 mb-2 transition-colors" />
                  <p className="text-xs text-gray-500 font-bold max-w-[150px] truncate">
                    {file ? file.name : 'Drop file here'}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>

              <button 
                type="submit" 
                disabled={!file || uploading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-100 transition-all flex items-center justify-center space-x-2"
              >
                {uploading ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>{uploading ? 'Processing Neural Chunks...' : 'Ingest to ' + selectedSection}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900">Knowledge Inventory</h2>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{documents.length} Managed Assets</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px] scrollbar-hide">
            {loading ? (
                <div className="p-20 text-center"><Clock className="w-10 h-10 animate-spin mx-auto text-gray-200" /></div>
            ) : documents.length === 0 ? (
                <div className="p-20 text-center text-gray-400 font-bold">No assets in this section.</div>
            ) : (
                documents.map((doc) => (
                    <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center space-x-4 min-w-0">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 flex-shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                    <p className="font-black text-gray-900 truncate max-w-[200px]">{doc.file_name}</p>
                                    {editingDoc === doc.id ? (
                                        <div className="flex items-center space-x-1">
                                            <select 
                                                value={editSection}
                                                onChange={(e) => setEditSection(e.target.value)}
                                                className="text-[10px] font-black bg-gray-100 p-1 rounded-md outline-none"
                                            >
                                                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button onClick={() => handleUpdateSection(doc.id)} className="p-1 text-emerald-600"><Check className="w-3 h-3"/></button>
                                            <button onClick={() => setEditingDoc(null)} className="p-1 text-red-600"><X className="w-3 h-3"/></button>
                                        </div>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-md uppercase">
                                            {doc.section}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Status: {doc.status} • {new Date(doc.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => { setEditingDoc(doc.id); setEditSection(doc.section); }}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                                title="Change Section"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-red-600 transition-all"
                                title="Delete Asset"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5" />
          <span>Storage Engine Fault: {error}</span>
        </div>
      )}
    </div>
  );
}
