import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, ExternalLink, ShieldCheck, ShieldAlert, Clock, QrCode, X, Copy, Check, User, Mail, School, Wallet, Settings, AlertCircle, Lock, Eye, EyeOff, UploadCloud } from 'lucide-react';
import { getMyDocuments, changePassword, getDownloadUrl, verifyByHash } from '../services/documentApi';

const StudentDashboard = () => {
    const location = useLocation();
    const currentTab = location.hash || '#certificates';

    const [shareCert, setShareCert] = useState(null);
    const [expandedCert, setExpandedCert] = useState(null);
    const [copied, setCopied] = useState(false);
    
    // Dynamic State
    const [myCerts, setMyCerts] = useState([]);
    const [userData, setUserData] = useState({ name: 'Student', email: '', id: 'N/A', role: 'user' });
    const [status, setStatus] = useState({ loading: true, error: null });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwStatus, setPwStatus] = useState({ loading: false, error: null, success: null });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    // Verify tab state
    const [verifyFile, setVerifyFile] = useState(null);
    const [verifyDrag, setVerifyDrag] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState(null); // null | 'loading' | 'valid' | 'invalid'
    const [verifyCert, setVerifyCert] = useState(null);

    useEffect(() => {
        // Load user info from local storage
        const storedUser = localStorage.getItem('user');
        const email = localStorage.getItem('email');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }

        if (email) {
            fetchDocuments(email);
        } else {
            setStatus({ loading: false, error: 'User email not found. Please log in again.' });
        }
    }, []);

    const fetchDocuments = async (email) => {
        try {
            const token = localStorage.getItem('token');
            const response = await getMyDocuments(email, token);
            
            const docs = response.data.documents || response.data || [];
            const formattedDocs = docs.map(doc => ({
                id: doc._id || doc.id || 'N/A',
                docId: doc.docId || doc._id,         // blockchain doc ID for download
                title: doc.title || doc.documentName || doc.name || 'Untitled Document',
                issuer: doc.issuer || 'DocuLedger Institution',
                date: new Date(doc.createdAt || doc.uploadDate).toLocaleDateString(),
                status: doc.verified ? 'Verified' : 'Minted',
                hash: doc.txHash || doc.transactionHash || doc.hash || '0x...',
                hasFile: !!doc.filePath   // whether a downloadable file exists
            }));

            setMyCerts(formattedDocs);
            setStatus({ loading: false, error: null });
        } catch (error) {
            setStatus({ 
                loading: false, 
                error: error.response?.data?.message || 'Failed to fetch your verified documents.' 
            });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwStatus({ loading: false, error: 'New passwords do not match.', success: null });
            return;
        }
        setPwStatus({ loading: true, error: null, success: null });
        try {
            const token = localStorage.getItem('token');
            await changePassword(pwForm.currentPassword, pwForm.newPassword, token);
            setPwStatus({ loading: false, error: null, success: 'Password changed successfully!' });
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPwStatus({
                loading: false,
                error: error.response?.data?.message || 'Failed to change password.',
                success: null
            });
        }
    };

    const handleVerify = async (file) => {
        if (!file) return;
        setVerifyFile(file);
        setVerifyStatus('loading');
        setVerifyCert(null);
        try {
            // Compute SHA-256 hash of the uploaded file
            const buffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashValue = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const response = await verifyByHash(hashValue);
            if (response.data) {
                setVerifyStatus('valid');
                setVerifyCert(response.data);
            } else {
                setVerifyStatus('invalid');
            }
        } catch (error) {
            // 404 means not found
            if (error.response?.status === 404) {
                setVerifyStatus('invalid');
            } else {
                setVerifyStatus('invalid');
                console.error('Verify error:', error);
            }
        }
    };

    const handleDownload = async (cert) => {
        if (!cert.hasFile) {
            alert('No file was uploaded for this certificate.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await getDownloadUrl(cert.docId, token);
            const { url } = response.data;

            // Open the PDF/file URL directly in a new browser tab for viewing
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            alert('Could not retrieve file. ' + (error.response?.data?.message || ''));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {currentTab === '#issue' ? 'Issue New Certificate'
                        : currentTab === '#students' ? 'Student Management'
                        : currentTab === '#profile' ? 'My Profile'
                        : currentTab === '#settings' ? 'Account Settings'
                        : currentTab === '#verify' ? 'Verify Certificate'
                        : 'My Digital Wallet'}
                    </h1>
                    <p className="text-white/50 mt-1">
                        {currentTab === '#profile' ? 'Manage your personal details and academic identity.' :
                        currentTab === '#settings' ? 'Configure your preferences and security.' :
                        currentTab === '#verify' ? 'Upload a certificate to check its authenticity on the blockchain.' :
                            'View and manage your blockchain-secured credentials.'}
                    </p>
                </div>

                <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 w-fit border-blue-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-mono text-blue-300">
                        {userData.email ? userData.email.substring(0, 6) + '...' + userData.email.slice(-8) : 'Connected'}
                    </span>
                </div>
            </div>

            {/* -------------------- CERTIFICATES VIEW -------------------- */}
            {currentTab === '#certificates' || currentTab === '' ? (
                <div>
                    {status.loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    )}

                    {status.error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm leading-relaxed">{status.error}</p>
                        </div>
                    )}

                    {!status.loading && !status.error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myCerts.map((cert, idx) => (
                        <div key={idx} className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30">

                            {/* Status Badge */}
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${cert.status === 'Verified'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                    {cert.status === 'Verified' ? <ShieldCheck size={14} /> : <Clock size={14} />}
                                    {cert.status}
                                </div>

                                <button
                                    onClick={() => setExpandedCert(cert)}
                                    title="View Full Details"
                                    className="p-2 glass-button rounded-xl text-white/50 hover:text-blue-400 transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            </div>

                            {/* Cert Details */}
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-white/90 mb-2 leading-tight group-hover:text-blue-300 transition-colors">
                                    {cert.title}
                                </h3>
                                <p className="text-white/60 text-sm mb-4">{cert.issuer}</p>

                                <div className="space-y-2 mt-6">
                                    <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                        <span className="text-white/40">Issued On</span>
                                        <span className="text-white/80">{cert.date}</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                        <span className="text-white/40">Cert ID</span>
                                        <span className="text-white/80 font-mono">{cert.id}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/40">Tx Hash</span>
                                        <span className="text-blue-400/80 font-mono truncate max-w-[120px]">{cert.hash}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleDownload(cert)}
                                    disabled={!cert.hasFile}
                                    title={cert.hasFile ? 'View & Download Certificate' : 'No file uploaded for this certificate'}
                                    className="py-2.5 glass-button rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Download size={16} /> {cert.hasFile ? 'PDF' : 'No File'}
                                </button>
                                <button
                                    onClick={() => setShareCert(cert)}
                                    disabled={cert.status !== 'Verified'}
                                    title={cert.status !== 'Verified' ? 'Share Link is available only for verified certificates' : 'Share this certificate'}
                                    className="py-2.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                >
                                    <QrCode size={16} /> Share Link
                                </button>
                            </div>

                        </div>
                    ))}

                    {myCerts.length === 0 && (
                        <div className="col-span-full glass-panel py-20 rounded-3xl flex flex-col items-center justify-center text-center border-dashed border-white/20">
                            <ShieldCheck className="w-16 h-16 text-white/20 mb-4" />
                            <h3 className="text-xl font-medium text-white/60">No Certificates Found</h3>
                            <p className="text-white/40 text-sm mt-2 max-w-sm">
                                Your blockchain-verified certificates will appear here once issued by your institution.
                            </p>
                        </div>
                    )}
                </div>
                )}
            </div>
            ) : null}

            {/* -------------------- VERIFY CERTIFICATE VIEW -------------------- */}
            {currentTab === '#verify' && (
                <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4 duration-500">

                    {/* Upload Zone */}
                    {verifyStatus !== 'loading' && (
                        <div
                            onDragOver={e => { e.preventDefault(); setVerifyDrag(true); }}
                            onDragLeave={() => setVerifyDrag(false)}
                            onDrop={e => {
                                e.preventDefault(); setVerifyDrag(false);
                                const f = e.dataTransfer.files[0];
                                if (f) handleVerify(f);
                            }}
                            onClick={() => document.getElementById('verify-file-input').click()}
                            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                                verifyDrag
                                    ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                                    : 'border-white/20 hover:border-blue-400/60 hover:bg-white/5'
                            }`}
                        >
                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <UploadCloud size={36} className="text-blue-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-white/80 font-medium text-lg">Drop your certificate here</p>
                                <p className="text-white/40 text-sm mt-1">or <span className="text-blue-400">click to browse</span> — PDF, PNG, JPG</p>
                            </div>
                            {verifyFile && (
                                <p className="text-xs text-white/40 font-mono bg-white/5 px-3 py-1.5 rounded-lg">{verifyFile.name}</p>
                            )}
                            <input
                                id="verify-file-input"
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={e => { if (e.target.files[0]) handleVerify(e.target.files[0]); }}
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {verifyStatus === 'loading' && (
                        <div className="glass-panel rounded-2xl p-12 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-white/60 text-sm">Computing hash and checking blockchain ledger...</p>
                            <p className="text-white/30 text-xs font-mono">{verifyFile?.name}</p>
                        </div>
                    )}

                    {/* VALID Result (Authentic but maybe not theirs) */}
                    {verifyStatus === 'valid' && verifyCert && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            
                            {/* Ownership Mismatch Warning */}
                            {verifyCert.owner !== userData.email && (
                                <div className="glass-panel p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4">
                                    <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-400 font-bold text-lg">Ownership Mismatch</h4>
                                        <p className="text-white/70 text-sm mt-1">
                                            This certificate is <span className="text-white font-medium">authentic</span> and exists on the blockchain, but it <span className="text-amber-300 font-medium">belongs to someone else</span>.
                                        </p>
                                        <div className="mt-3 flex flex-col gap-1 text-sm bg-black/20 p-3 rounded-xl border border-white/5">
                                            <div className="flex justify-between">
                                                <span className="text-white/40">Issued to:</span>
                                                <span className="text-white font-medium">{verifyCert.owner}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/40">You are logged in as:</span>
                                                <span className="text-white/60">{userData.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`glass-panel rounded-2xl p-6 border ${verifyCert.owner === userData.email ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-3 rounded-xl border ${verifyCert.owner === userData.email ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${verifyCert.owner === userData.email ? 'text-green-400' : 'text-white/90'}`}>
                                            Authentic Certificate Record
                                        </h3>
                                        <p className="text-white/50 text-sm">Blockchain ledger details for this document.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 rounded-xl p-5 border border-white/5">
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Certificate Title</p>
                                        <p className="text-white/90 font-semibold">{verifyCert.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Issued To</p>
                                        <p className={`font-medium ${verifyCert.owner !== userData.email ? 'text-amber-400' : 'text-white/90'}`}>{verifyCert.owner}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Issuing Authority</p>
                                        <p className="text-white/90">{verifyCert.issuer}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Issue Date</p>
                                        <p className="text-white/90">{verifyCert.timestamp ? new Date(verifyCert.timestamp).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Blockchain Tx Hash</p>
                                        <p className="text-blue-400/80 font-mono text-xs break-all bg-black/30 px-3 py-2 rounded-lg">{verifyCert.txHash || verifyCert.hashValue}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setVerifyFile(null); setVerifyStatus(null); setVerifyCert(null); }}
                                className="w-full py-3 glass-button rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Verify Another Certificate
                            </button>
                        </div>
                    )}

                    {/* INVALID Result */}
                    {verifyStatus === 'invalid' && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="glass-panel rounded-2xl p-8 border border-red-500/30 bg-red-500/5 flex flex-col items-center text-center gap-4">
                                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
                                    <ShieldAlert size={36} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-red-400">Certificate Not Found</h3>
                                    <p className="text-white/50 text-sm mt-1 max-w-sm">
                                        This document was not found in the blockchain ledger. It may be tampered, invalid, or not yet issued.
                                    </p>
                                </div>
                                {verifyFile && (
                                    <p className="text-xs text-white/30 font-mono bg-white/5 px-3 py-1.5 rounded-lg">{verifyFile.name}</p>
                                )}
                            </div>

                            <button
                                onClick={() => { setVerifyFile(null); setVerifyStatus(null); setVerifyCert(null); }}
                                className="w-full py-3 glass-button rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Try Another File
                            </button>
                        </div>
                    )}

                </div>
            )}

            {/* -------------------- PROFILE VIEW -------------------- */}
            {currentTab === '#profile' && (
                <div className="max-w-3xl glass-panel p-8 rounded-3xl">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-1 shrink-0 mx-auto md:mx-0">
                            <div className="w-full h-full bg-[#0a0f1d] rounded-full flex items-center justify-center overflow-hidden">
                                <User className="w-16 h-16 text-white/50" />
                            </div>
                        </div>

                        <div className="flex-grow space-y-6 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <div className="flex items-center gap-3 glass-input px-4 py-3 rounded-xl">
                                        <User size={18} className="text-white/40" />
                                        <span className="text-white/90 font-medium">{userData.name}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Student ID</label>
                                    <div className="flex items-center gap-3 glass-input px-4 py-3 rounded-xl bg-black/40">
                                        <School size={18} className="text-white/40" />
                                        <span className="text-white/70 font-mono">{userData.id || 'STU-104523'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Email Address</label>
                                    <div className="flex items-center gap-3 glass-input px-4 py-3 rounded-xl bg-black/40">
                                        <Mail size={18} className="text-white/40" />
                                        <span className="text-white/70">{userData.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Role Identity</label>
                                    <div className="flex items-center gap-3 glass-input px-4 py-3 rounded-xl bg-black/40">
                                        <Wallet size={18} className="text-white/40" />
                                        <span className="text-blue-400 font-mono text-sm truncate uppercase">{userData.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-6 border-t border-white/10">
                                <button className="glass-button px-6 py-2.5 rounded-xl font-medium text-sm text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                                    Request Profile Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------- SETTINGS VIEW -------------------- */}
            {currentTab === '#settings' && (
                <div className="max-w-3xl glass-panel p-8 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <Settings className="text-purple-400" size={24} />
                        <h2 className="text-xl font-bold">Preferences & Security</h2>
                    </div>

                    <div className="space-y-8">
                        {/* Change Password Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Lock size={18} className="text-blue-400" />
                                <h3 className="text-white/80 font-medium">Change Password</h3>
                            </div>

                            {pwStatus.error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <p className="text-sm">{pwStatus.error}</p>
                                </div>
                            )}
                            {pwStatus.success && (
                                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                                    <p className="text-sm font-medium">{pwStatus.success}</p>
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPw.current ? 'text' : 'password'}
                                            value={pwForm.currentPassword}
                                            onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                                            className="glass-input w-full px-4 py-3 rounded-xl text-sm pr-12"
                                            placeholder="Enter your current password"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                                            {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* New Password */}
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw.new ? 'text' : 'password'}
                                                value={pwForm.newPassword}
                                                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                                className="glass-input w-full px-4 py-3 rounded-xl text-sm pr-12"
                                                placeholder="Min. 6 characters"
                                                required
                                                minLength={6}
                                            />
                                            <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                                                {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm New Password */}
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw.confirm ? 'text' : 'password'}
                                                value={pwForm.confirmPassword}
                                                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                                className={`glass-input w-full px-4 py-3 rounded-xl text-sm pr-12 ${
                                                    pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                                                        ? 'border-red-500/50' : ''
                                                }`}
                                                placeholder="Re-enter new password"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                                                {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1 ml-1">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={pwStatus.loading}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-sm text-white transition-all transform hover:scale-[1.01] shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                                    >
                                        {pwStatus.loading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Lock size={16} />
                                        )}
                                        {pwStatus.loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Notifications Section */}
                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-white/80 font-medium mb-4">Notifications</h3>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                                    <div>
                                        <p className="font-medium text-white/90">Email Alerts</p>
                                        <p className="text-xs text-white/50">Get notified when new certificates are issued.</p>
                                    </div>
                                    <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </label>
                                <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                                    <div>
                                        <p className="font-medium text-white/90">Blockchain TX Alerts</p>
                                        <p className="text-xs text-white/50">Alerts for verification checks on your certificates.</p>
                                    </div>
                                    <div className="w-12 h-6 bg-white/10 rounded-full relative">
                                        <div className="w-5 h-5 bg-white/50 rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-white/80 font-medium mb-4 text-red-400">Danger Zone</h3>
                            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                                <p className="text-sm text-white/70 mb-4">
                                    Revoke connection to the current wallet. You will need to re-authenticate with your private key to access your records.
                                </p>
                                <button className="glass-button px-4 py-2 rounded-lg text-sm font-medium border-red-500/30 text-red-400 hover:bg-red-500/20">
                                    Disconnect Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------- SHARE QR MODAL -------------------- */}
            {shareCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShareCert(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="glass-panel p-8 rounded-3xl w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShareCert(null)}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Share Certificate</h3>
                            <p className="text-sm text-white/60">Scan to verify instantly</p>
                        </div>

                        {/* QR Code Container */}
                        <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareCert.id)}&color=0a0f1d`}
                                alt="QR Code"
                                className="w-48 h-48"
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1 text-center">Certificate ID</p>
                                <p className="text-center font-mono text-blue-300 bg-white/5 py-2 rounded-lg border border-white/5">
                                    {shareCert.id}
                                </p>
                            </div>

                            <button
                                onClick={() => copyToClipboard(`https://doculedger.app/verify?id=${shareCert.id}`)}
                                className="w-full py-3 glass-button hover:bg-white/10 border-white/20 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                {copied ? 'Copied to clipboard!' : 'Copy Verification Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------- EXPANDED CERT MODAL -------------------- */}
            {expandedCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm h-full w-full"
                        onClick={() => setExpandedCert(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="bg-[#0a0f1d] p-8 md:p-10 rounded-3xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-200 my-8 shadow-2xl border border-white/10 mx-auto">
                        <button
                            onClick={() => setExpandedCert(null)}
                            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 mt-2">
                            <div className={`p-4 rounded-2xl shrink-0 w-fit ${expandedCert.status === 'Verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                {expandedCert.status === 'Verified' ? <ShieldCheck size={36} /> : <Clock size={36} />}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{expandedCert.title}</h2>
                                <p className="text-white/60 text-lg flex items-center gap-2">
                                    <School size={16} /> {expandedCert.issuer}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/30 p-6 rounded-2xl border border-white/5 mb-8">
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><ShieldCheck size={14} /> Verification Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${expandedCert.status === 'Verified' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                                    <p className={`font-medium ${expandedCert.status === 'Verified' ? 'text-green-400' : 'text-yellow-400'}`}>{expandedCert.status}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock size={14} /> Date Issued</p>
                                <p className="text-white/90 font-medium">{expandedCert.date}</p>
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-white/5">
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Credential ID</p>
                                <p className="font-mono text-blue-300 text-sm bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 inline-block w-full">{expandedCert.id}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Blockchain Transaction Hash</p>
                                <p className="font-mono text-blue-400/80 text-sm break-all bg-black/40 p-3 rounded-xl border border-white/5">
                                    {expandedCert.hash !== '0x...' ? expandedCert.hash : 'Pending network confirmation...'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={() => handleDownload(expandedCert)}
                                disabled={!expandedCert.hasFile}
                                title={expandedCert.hasFile ? 'View & Download Certificate' : 'No file uploaded for this certificate'}
                                className="flex-1 py-3.5 glass-button rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <Download size={18} /> {expandedCert.hasFile ? 'Download Document' : 'No File Uploaded'}
                            </button>
                            <button
                                onClick={() => { setShareCert(expandedCert); setExpandedCert(null); }}
                                disabled={expandedCert.status !== 'Verified'}
                                className="flex-1 py-3.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] shadow-[0_0_20px_rgba(59,130,246,0.15)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <QrCode size={18} /> Quick Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentDashboard;
