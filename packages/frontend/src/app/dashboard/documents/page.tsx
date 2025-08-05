'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

// --- Types ---
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
    uploaded_at: string;
}

// --- Uploader Component ---
const DocumentUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }
        setUploading(true);
        setError(null);

        try {
            // 1. Get a pre-signed URL from our backend
            const presignedUrlData = await api.post('/documents/presigned-url', {
                file_name: file.name,
                file_type: file.type,
            });

            // 2. Upload the file directly to S3 using the pre-signed URL
            const formData = new FormData();
            Object.entries(presignedUrlData.fields).forEach(([key, value]) => {
                formData.append(key, value as string);
            });
            formData.append('file', file);

            const s3Response = await fetch(presignedUrlData.url, {
                method: 'POST',
                body: formData,
            });

            if (!s3Response.ok) {
                throw new Error('Failed to upload file to S3.');
            }

            // 3. Inform the user and refresh the list
            alert('File uploaded successfully! It will be processed shortly.');
            onUploadSuccess();
            setFile(null);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
            <form onSubmit={handleUpload}>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx" className="mb-4" />
                <button type="submit" disabled={!file || uploading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
};


// --- Document List Component ---
const DocumentList = ({ documents }: { documents: Document[] }) => {
    if (documents.length === 0) {
        return <p>No documents found.</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <ul className="divide-y divide-gray-200">
                {documents.map(doc => (
                    <li key={doc.id} className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{doc.file_name}</p>
                            <p className="text-sm text-gray-500">
                                Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                            </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.status === DocumentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                            doc.status === DocumentStatus.FAILED ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {doc.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- Main Page ---
export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // This would come from user context
    const organizationId = 'your-organization-id';

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/documents/${organizationId}`);
            setDocuments(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [organizationId]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Document Management</h1>
            <DocumentUploader onUploadSuccess={fetchDocuments} />
            <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
            {loading && <p>Loading documents...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && <DocumentList documents={documents} />}
        </div>
    );
}
