import React, { useState } from 'react';
import { uploadDocument } from '../services/documentApi';
import { Upload, CheckCircle, AlertCircle, FileText, User, Type } from 'lucide-react';

const UploadDocument = () => {
    const [email, setEmail] = useState('');
    const [docName, setDocName] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ loading: false, success: null, error: null });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file || !email || !docName) {
            setStatus({ loading: false, success: null, error: 'Please fill all fields and select a file.' });
            return;
        }

        setStatus({ loading: true, success: null, error: null });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('ownerEmail', email);
        formData.append('title', docName);

        // Get issuer from localStorage
        const userStr = localStorage.getItem('user');
        const issuerName = userStr ? JSON.parse(userStr).name : 'DocuLedger Admin';
        formData.append('issuer', issuerName);

        // Compute actual SHA-256 hash of the file for blockchain ledger
        const computeHash = async (f) => {
            const buffer = await f.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };
        const realHash = await computeHash(file);
        formData.append('hashValue', realHash);

        try {
            const token = localStorage.getItem('token');

            await uploadDocument(formData, token);

            setStatus({ loading: false, success: 'Document uploaded successfully!', error: null });
            setEmail('');
            setDocName('');
            setFile(null);

            // Reset file input visually
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            setStatus({
                loading: false,
                success: null,
                error: error.response?.data?.message || 'Failed to upload document. Please try again.'
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent opacity-50" />

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Upload Document
                    </h2>
                    <p className="text-white/60 text-sm">Issue a new certificate to a student</p>
                </div>

                {status.success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-400">
                        <CheckCircle size={20} />
                        <p className="text-sm font-medium">{status.success}</p>
                    </div>
                )}

                {status.error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{status.error}</p>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                            <User size={18} />
                        </div>
                        <input
                            type="email"
                            placeholder="Student Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                            <Type size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Document Name (e.g., B.Tech Degree)"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-8 bg-black/20 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 hover:border-blue-400 transition-all group"
                        >
                            <FileText size={24} className="text-white/40 group-hover:text-blue-400 transition-colors" />
                            <div className="text-center">
                                <span className="block text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                                    {file ? file.name : "Choose a PDF File"}
                                </span>
                                {!file && <span className="block text-xs text-white/40 mt-1">PDF max 5MB</span>}
                            </div>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.loading}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {status.loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </span>
                        ) : (
                            <>
                                <Upload size={20} />
                                Upload to Ledger
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadDocument;
