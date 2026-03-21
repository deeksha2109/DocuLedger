import React, { useState, useEffect } from 'react';
import { getMyDocuments } from '../services/documentApi';
import { Eye, FileText, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

const MyDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [status, setStatus] = useState({ loading: true, error: null });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email'); // Provided by login logic

            if (!email) {
                setStatus({ loading: false, error: 'User email not found. Please log in again.' });
                return;
            }

            const response = await getMyDocuments(email, token);

            setDocuments(response.data.documents || response.data || []);
            setStatus({ loading: false, error: null });
        } catch (error) {
            setStatus({
                loading: false,
                error: error.response?.data?.message || 'Failed to fetch documents.'
            });
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                        My Documents
                    </h1>
                    <p className="text-white/60 text-lg">Manage and view your verified certificates</p>
                </div>

                {status.loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {status.error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 max-w-2xl">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{status.error}</p>
                    </div>
                )}

                {!status.loading && !status.error && documents.length === 0 && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center shadow-lg">
                        <FileText size={48} className="mx-auto text-white/20 mb-4" />
                        <h3 className="text-xl font-medium text-white/80 mb-2">No Documents Found</h3>
                        <p className="text-white/50">You don't have any verified documents issued to this account.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!status.loading && documents.map((doc, index) => (
                        <div
                            key={doc.id || doc._id || index}
                            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg p-6 hover:bg-white/[0.15] transition-all group relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck size={80} className="text-blue-400" />
                            </div>

                            <div className="flex items-start gap-4 mb-6 relative z-10">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white truncate pr-6">{doc.documentName || doc.name || 'Untitled Document'}</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 mt-1">
                                        Verified
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-grow relative z-10 text-sm">
                                <div>
                                    <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Document ID</p>
                                    <p className="text-white/80 font-mono break-all bg-black/20 p-2 rounded-lg border border-white/5">{doc.id || doc._id || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-white/40" />
                                    <p className="text-white/70">
                                        {new Date(doc.uploadDate || doc.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                                <button
                                    onClick={() => window.open(`/api/documents/${doc.id || doc._id}`, '_blank')}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 group-hover:border-blue-500/50"
                                >
                                    <Eye size={18} className="text-blue-400" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyDocuments;
