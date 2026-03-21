import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileUp, Eye, EyeOff, Plus, FileBadge, Users, UserPlus, Trash2, AlertCircle, FileText, X, UploadCloud, ShieldCheck, ShieldAlert } from 'lucide-react';
import UploadDocument from './UploadDocument';
import { getAllDocuments, getAllUsers, addStudent, verifyDocument, deleteStudent, unverifyDocument } from '../services/documentApi';

const AdminDashboard = () => {
    const location = useLocation();
    const currentTab = location.hash || '#overview';

    const [issuedCerts, setIssuedCerts] = useState([]);
    const [students, setStudents] = useState([]);
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [status, setStatus] = useState({ loading: true, error: null });
    const [newStudent, setNewStudent] = useState({ name: '', email: '', course: '', enrollmentId: '', walletAddress: '', certificate: '' });
    const [addStatus, setAddStatus] = useState({ loading: false, error: null, success: null });
    const [certFile, setCertFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setStatus({ loading: true, error: null });
            try {
                const token = localStorage.getItem('token');
                
                // Fetch both concurrently for speed
                const [certsResponse, usersResponse] = await Promise.all([
                    getAllDocuments(token),
                    getAllUsers(token)
                ]);

                // Map certificates
                const formattedCerts = (certsResponse.data || []).map(cert => ({
                    id: cert.docId || cert._id,
                    docId: cert.docId,         // blockchain docId for verify action
                    name: cert.ownerEmail,
                    course: cert.title,
                    date: new Date(cert.createdAt).toLocaleDateString(),
                    verified: !!cert.verified,
                    status: cert.verified ? 'Verified' : 'Minted'
                }));

                // Map Users
                const formattedUsers = (usersResponse.data || []).map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    course: user.course || 'Registered User', 
                    status: 'Active'
                }));

                setIssuedCerts(formattedCerts);
                setStudents(formattedUsers);
                setStatus({ loading: false, error: null });

            } catch (error) {
                console.error("Dashboard error:", error);
                setStatus({ 
                    loading: false, 
                    error: error.response?.data?.message || 'Failed to load dashboard data.' 
                });
            }
        };

        if (currentTab === '#overview' || currentTab === '' || currentTab === '#students') {
             fetchDashboardData();
        }
    }, [currentTab]);

    const [verifyingId, setVerifyingId] = useState(null);

    const handleVerifyToggle = async (cert) => {
        if (!cert.docId) return alert('No blockchain docId for this certificate.');
        setVerifyingId(cert.docId);
        try {
            const token = localStorage.getItem('token');
            if (cert.verified) {
                // Currently verified -> Unverify it
                await unverifyDocument(cert.docId, token);
                setIssuedCerts(prev => prev.map(c =>
                    c.docId === cert.docId
                        ? { ...c, verified: false, status: 'Minted' }
                        : c
                ));
            } else {
                // Currently unverified -> Verify it
                await verifyDocument(cert.docId, token);
                setIssuedCerts(prev => prev.map(c =>
                    c.docId === cert.docId
                        ? { ...c, verified: true, status: 'Verified' }
                        : c
                ));
            }
        } catch (error) {
            alert('Failed to update verification status: ' + (error.response?.data?.message || error.message));
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDeleteStudent = async (student) => {
        if (!window.confirm(`Delete student "${student.name}" (${student.email})? This cannot be undone.`)) return;
        setDeletingId(student.id);
        try {
            const token = localStorage.getItem('token');
            await deleteStudent(student.id, token);
            setStudents(prev => prev.filter(s => s.id !== student.id));
        } catch (error) {
            alert('Failed to delete student: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAddStatus({ loading: true, error: null, success: null });
        try {
            const token = localStorage.getItem('token');

            // Build FormData so we can include optional file
            const fd = new FormData();
            fd.append('name', newStudent.name);
            fd.append('email', newStudent.email);
            fd.append('course', newStudent.course);
            fd.append('enrollmentId', newStudent.enrollmentId);
            fd.append('walletAddress', newStudent.walletAddress);
            fd.append('certificate', newStudent.certificate);
            // Pass admin info so the backend can use it as issuer
            const userStr = localStorage.getItem('user');
            fd.append('adminInfo', userStr || '{}');
            if (certFile) {
                fd.append('certificateFile', certFile);
            }

            await addStudent(fd, token);
            setAddStatus({ loading: false, error: null, success: certFile ? 'Student registered & certificate minted on blockchain!' : 'Student added successfully!' });

            // Refresh users list immediately
            const usersResponse = await getAllUsers(token);
            const formattedUsers = (usersResponse.data || []).map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                course: user.course || 'Registered User',
                status: 'Active'
            }));
            setStudents(formattedUsers);

            setTimeout(() => {
                setIsAddingStudent(false);
                setNewStudent({ name: '', email: '', course: '', enrollmentId: '', walletAddress: '', certificate: '' });
                setCertFile(null);
                setAddStatus({ loading: false, error: null, success: null });
            }, 1800);
        } catch (error) {
            setAddStatus({
                loading: false,
                error: error.response?.data?.message || 'Failed to register student.',
                success: null
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {currentTab === '#issue' ? 'Issue New Certificate' : currentTab === '#students' ? 'Student Management' : 'Institution Overview'}
                </h1>
                <p className="text-white/50 mt-1">
                    {currentTab === '#issue' ? 'Mint new academic credentials directly to the blockchain.' : currentTab === '#students' ? 'Manage enrolled students and their network access.' : 'Manage and view all blockchain certificates issued by your institution.'}
                </p>
            </div>

            <div className="w-full max-w-5xl">

                {/* -------------------- OVERVIEW VIEW (TABLE) -------------------- */}
                {(currentTab === '#overview' || currentTab === '') && (
                    <div className="glass-panel p-6 rounded-3xl overflow-hidden flex flex-col w-full">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                            <h2 className="text-xl font-semibold">Recent Issuances</h2>
                            <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/60 border border-white/10 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Network Active
                            </div>
                        </div>

                        {status.error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                                <p className="text-sm leading-relaxed">{status.error}</p>
                            </div>
                        )}

                        {status.loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto flex-grow">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-sm text-white/50 border-b border-white/10">
                                        <th className="pb-3 px-4 font-medium">Cert ID</th>
                                        <th className="pb-3 px-4 font-medium">Student</th>
                                        <th className="pb-3 px-4 font-medium">Course</th>
                                        <th className="pb-3 px-4 font-medium">Date Issued</th>
                                        <th className="pb-3 px-4 font-medium">Status</th>
                                        <th className="pb-3 px-4 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {issuedCerts.map((cert, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 px-4 font-mono text-blue-300 text-xs max-w-[160px] truncate">{cert.id}</td>
                                            <td className="py-4 px-4 text-white/90">{cert.name}</td>
                                            <td className="py-4 px-4 text-white/70">{cert.course}</td>
                                            <td className="py-4 px-4 text-white/60">{cert.date}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium block w-fit ${
                                                    cert.status === 'Verified'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                    {cert.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right flex justify-end gap-2">
                                                {cert.verified ? (
                                                    <button
                                                        onClick={() => handleVerifyToggle(cert)}
                                                        disabled={verifyingId === cert.docId}
                                                        title="Revoke Verification Status"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[100px] justify-center"
                                                    >
                                                        {verifyingId === cert.docId ? (
                                                            <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <ShieldAlert size={13} />
                                                        )}
                                                        {verifyingId === cert.docId ? 'Processing' : 'Unverify'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleVerifyToggle(cert)}
                                                        disabled={verifyingId === cert.docId}
                                                        title="Mark as Verified on blockchain"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[100px] justify-center"
                                                    >
                                                        {verifyingId === cert.docId ? (
                                                            <span className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <ShieldCheck size={13} />
                                                        )}
                                                        {verifyingId === cert.docId ? 'Processing' : 'Verify'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {issuedCerts.length === 0 && (
                                <div className="text-center py-12 text-white/40">
                                    No certificates have been issued yet.
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                )}

                {/* -------------------- ISSUE CERTIFICATE VIEW (FORM) -------------------- */}
                {currentTab === '#issue' && (
                    <div className="w-full">
                         <UploadDocument />
                    </div>
                )}

                {/* -------------------- STUDENTS VIEW -------------------- */}
                {currentTab === '#students' && (
                    <div className="space-y-6 w-full animate-in slide-in-from-right-4 duration-500">

                        {!isAddingStudent ? (
                            <>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsAddingStudent(true)}
                                        className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <UserPlus size={18} /> Add New Student
                                    </button>
                                </div>

                                <div className="glass-panel p-6 rounded-3xl overflow-hidden flex flex-col w-full">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                        <div className="p-2 bg-purple-500/20 rounded-lg"><Users className="text-purple-400" size={20} /></div>
                                        <h2 className="text-xl font-semibold">Enrolled Students</h2>
                                    </div>

                                    {status.error && (
                                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                                            <p className="text-sm leading-relaxed">{status.error}</p>
                                        </div>
                                    )}

                                    {status.loading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto flex-grow">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-sm text-white/50 border-b border-white/10">
                                                    <th className="pb-3 px-4 font-medium">Student ID</th>
                                                    <th className="pb-3 px-4 font-medium">Name</th>
                                                    <th className="pb-3 px-4 font-medium">Email</th>
                                                    <th className="pb-3 px-4 font-medium">Course</th>
                                                    <th className="pb-3 px-4 font-medium">Status</th>
                                                    <th className="pb-3 px-4 text-right font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {students.map((student, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                        <td className="py-4 px-4 font-mono text-blue-300">{student.id}</td>
                                                        <td className="py-4 px-4 text-white/90">{student.name}</td>
                                                        <td className="py-4 px-4 text-white/70">{student.email}</td>
                                                        <td className="py-4 px-4 text-white/60">{student.course}</td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'} block w-fit truncate`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteStudent(student)}
                                                                disabled={deletingId === student.id}
                                                                className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                                title="Delete Student"
                                                            >
                                                                {deletingId === student.id
                                                                    ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                                                                    : <Trash2 size={16} />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {students.length === 0 && (
                                            <div className="text-center py-12 text-white/40">
                                                No students are currently registered in the network.
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-2xl mx-auto w-full relative">
                                <button
                                    onClick={() => setIsAddingStudent(false)}
                                    className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Cancel"
                                >
                                    <EyeOff size={20} /> {/* Reusing EyeOff as a visually close substitute, or ideally an X */}
                                </button>

                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                                    <div className="p-2 bg-blue-500/20 rounded-lg"><UserPlus className="text-blue-400" size={20} /></div>
                                    <h2 className="text-xl font-semibold">Register New Student</h2>
                                </div>

                                {addStatus.error && (
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                                        <p className="text-sm leading-relaxed">{addStatus.error}</p>
                                    </div>
                                )}

                                {addStatus.success && (
                                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3 text-green-400">
                                        <p className="text-sm leading-relaxed font-medium">{addStatus.success}</p>
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={handleAddStudent}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Full Name</label>
                                            <input type="text" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. Satoshi Nakamoto" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                                            <input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="student@university.edu" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Course / Degree</label>
                                            <input type="text" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. Web3 Engineering" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Enrollment ID</label>
                                            <input type="text" value={newStudent.enrollmentId} onChange={e => setNewStudent({...newStudent, enrollmentId: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" placeholder="STU-..." required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Certificate Being Issued</label>
                                            <input type="text" value={newStudent.certificate} onChange={e => setNewStudent({...newStudent, certificate: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. B.Tech Computer Science" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Wallet Address (Optional)</label>
                                            <input type="text" value={newStudent.walletAddress} onChange={e => setNewStudent({...newStudent, walletAddress: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" placeholder="0x..." />
                                        </div>
                                    </div>

                                    {/* ---- Certificate File Upload ---- */}
                                    <div className="pt-2">
                                        <label className="block text-xs text-white/60 mb-2 ml-1 uppercase tracking-wider">Upload Certificate / Document <span className="text-white/30">(Optional)</span></label>

                                        {!certFile ? (
                                            <div
                                                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                                onDragLeave={() => setDragActive(false)}
                                                onDrop={e => {
                                                    e.preventDefault(); setDragActive(false);
                                                    const f = e.dataTransfer.files[0];
                                                    if (f) setCertFile(f);
                                                }}
                                                onClick={() => document.getElementById('cert-upload-input').click()}
                                                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                                                    dragActive
                                                        ? 'border-blue-400 bg-blue-500/10'
                                                        : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
                                                }`}
                                            >
                                                <UploadCloud size={28} className="text-white/40" />
                                                <div className="text-center">
                                                    <p className="text-sm text-white/60">Drag & drop or <span className="text-blue-400 font-medium">click to browse</span></p>
                                                    <p className="text-xs text-white/30 mt-1">PDF, PNG, JPG — Max 10 MB</p>
                                                </div>
                                                <input
                                                    id="cert-upload-input"
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    className="hidden"
                                                    onChange={e => { if (e.target.files[0]) setCertFile(e.target.files[0]); }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                                <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                                                    <FileText size={20} className="text-blue-400" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-medium text-white/90 truncate">{certFile.name}</p>
                                                    <p className="text-xs text-white/40">{(certFile.size / 1024).toFixed(1)} KB · Will be minted on blockchain</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCertFile(null)}
                                                    className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-white/10 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingStudent(false)}
                                            disabled={addStatus.loading}
                                            className="w-1/3 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-white transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={addStatus.loading}
                                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                                        >
                                            {addStatus.loading ? (
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            ) : (
                                                "Add to Ledger"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
