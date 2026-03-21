import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, UploadCloud, FileText, CheckCircle2, XCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import QRScanner from '../components/QRScanner';
import { verifyByHash } from '../services/documentApi';

const Verify = () => {
    const [verifyMethod, setVerifyMethod] = useState('upload'); // 'upload' or 'qr'
    const [verificationStatus, setVerificationStatus] = useState(null); // 'valid', 'invalid', null
    const [certData, setCertData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Function to verify document using real backend
    const processVerification = async (data) => {
        setIsProcessing(true);
        setVerificationStatus(null);
        setCertData(null);

        try {
            let hashToVerify = data.hash;

            if (data.file) {
                const computeHash = async (f) => {
                    const buffer = await f.arrayBuffer();
                    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                };
                hashToVerify = await computeHash(data.file);
            }

            const response = await verifyByHash(hashToVerify);
            
            if (response.data) {
                setVerificationStatus('valid');
                setCertData({
                    id: response.data.docId,
                    studentName: response.data.owner || 'Verified Owner',
                    course: response.data.title || 'Verified Document',
                    issueDate: response.data.timestamp ? new Date(response.data.timestamp).toLocaleDateString() : 'N/A',
                    issuer: response.data.issuer || 'Verified Institution',
                    txHash: response.data.txHash || 'Verified on Blockchain'
                });
            } else {
                 setVerificationStatus('invalid');
            }

        } catch (error) {
            console.error("Verification failed:", error);
            setVerificationStatus('invalid');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processVerification({ file: e.target.files[0] }); 
        }
    };

    const handleQRScan = (decodedText) => {
        processVerification({ hash: decodedText });
    };

    return (
        <div className="min-h-[85vh] py-12 px-4 flex flex-col items-center">

            <div className="text-center mb-10 mt-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                    Verify Certificate
                </h1>
                <p className="text-white/60 max-w-xl mx-auto">
                    Confirm the authenticity of an academic credential instantly through the blockchain.
                </p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Input Section */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col h-full">

                    <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5 mx-auto w-full max-w-xs">
                        <button
                            onClick={() => setVerifyMethod('upload')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${verifyMethod === 'upload' ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg text-white' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            Upload PDF
                        </button>
                        <button
                            onClick={() => setVerifyMethod('qr')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${verifyMethod === 'qr' ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg text-white' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            Scan QR
                        </button>
                    </div>

                    <div className="flex-grow flex items-center justify-center">
                        {verifyMethod === 'upload' ? (
                            <label className="w-full h-64 glass-card border-2 border-dashed border-white/20 hover:border-blue-400/50 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-white/5 group relative overflow-hidden">
                                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-medium text-white/90">Click to upload or drag and drop</p>
                                    <p className="text-sm text-white/50 mt-1">PDF Certificate only (Max 5MB)</p>
                                </div>
                            </label>
                        ) : (
                            <QRScanner onScanSuccess={handleQRScan} />
                        )}
                    </div>

                </div>

                {/* Result Section */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">

                    {!isProcessing && !verificationStatus && (
                        <div className="text-center opacity-50 flex flex-col items-center gap-4">
                            <ShieldCheck className="w-16 h-16" />
                            <p>Awaiting certificate for verification...</p>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="text-center flex flex-col items-center gap-6">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin direction-reverse"></div>
                                <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-white/50 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-blue-300">Querying Blockchain Pipeline</h3>
                                <p className="text-white/50 text-sm mt-2">Checking cryptographic signatures...</p>
                            </div>
                        </div>
                    )}

                    {!isProcessing && verificationStatus === 'valid' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-full flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-green-500 shadow-[0_0_20px_#22c55e]" />

                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-3 bg-green-500/20 rounded-full shrink-0">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-400">Authentic Credential</h3>
                                    <p className="text-white/60 text-sm">This certificate is verified on the blockchain network.</p>
                                </div>
                            </div>

                            <div className="space-y-4 bg-black/30 p-6 rounded-2xl border border-white/5 flex-grow">
                                {Object.entries(certData || {}).map(([key, value]) => (
                                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                                        <span className="text-white/50 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="text-white/90 font-medium text-sm sm:text-right mt-1 sm:mt-0">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors border border-white/10 flex items-center justify-center gap-2">
                                <FileText size={18} /> View Original Document
                            </button>
                        </motion.div>
                    )}

                    {!isProcessing && verificationStatus === 'invalid' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center h-full"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-500 shadow-[0_0_20px_#ef4444]" />

                            <div className="p-4 bg-red-500/20 rounded-full mb-6">
                                <XCircle className="w-16 h-16 text-red-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-red-400 mb-2">Verification Failed</h3>
                            <p className="text-white/60 mb-6 max-w-xs">
                                The provided document does not match any valid record on the blockchain. It may be forged or tampered with.
                            </p>

                            <div className="glass-panel p-4 bg-red-500/10 border-red-500/30 w-full rounded-xl">
                                <div className="flex items-center gap-3 text-red-300 text-sm text-left">
                                    <ShieldAlert className="shrink-0" />
                                    <p>Hash mismatch detected. The cryptographic signature is invalid.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Verify;
