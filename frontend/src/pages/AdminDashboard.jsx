import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileUp, Eye, EyeOff, Plus, FileBadge, Users, UserPlus, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const location = useLocation();
    const currentTab = location.hash || '#overview';

    const [issuedCerts, setIssuedCerts] = useState([
        { id: 'CERT-2025-001', name: 'Alice Smith', course: 'Computer Science', date: '2025-06-15', status: 'Minted' },
        { id: 'CERT-2025-002', name: 'Bob Jones', course: 'Information Tech', date: '2025-06-16', status: 'Pending tx' },
        { id: 'CERT-2025-003', name: 'Charlie Brown', course: 'Data Science', date: '2025-06-18', status: 'Minted' },
    ]);

    const [students, setStudents] = useState([
        { id: 'STU-104523', name: 'John Doe', email: 'john@university.edu', course: 'B.Tech Computer Science', status: 'Active' },
        { id: 'STU-104524', name: 'Alice Smith', email: 'alice@university.edu', course: 'Information Tech', status: 'Active' },
        { id: 'STU-104525', name: 'Bob Jones', email: 'bob@university.edu', course: 'Information Tech', status: 'Inactive' },
    ]);
    const [isAddingStudent, setIsAddingStudent] = useState(false);

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
                                            <td className="py-4 px-4 font-mono text-blue-300">{cert.id}</td>
                                            <td className="py-4 px-4 text-white/90">{cert.name}</td>
                                            <td className="py-4 px-4 text-white/70">{cert.course}</td>
                                            <td className="py-4 px-4 text-white/60">{cert.date}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cert.status === 'Minted' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 truncate block w-fit'
                                                    }`}>
                                                    {cert.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* -------------------- ISSUE CERTIFICATE VIEW (FORM) -------------------- */}
                {currentTab === '#issue' && (
                    <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-2xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                            <div className="p-2 bg-blue-500/20 rounded-lg"><Plus className="text-blue-400" size={20} /></div>
                            <h2 className="text-xl font-semibold">Certificate Details</h2>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Student Name</label>
                                    <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. John Doe" />
                                </div>

                                <div>
                                    <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Course / Degree</label>
                                    <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. B.Tech Computer Science" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Student Wallet Address / ID</label>
                                <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" placeholder="0x..." />
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 ml-1 uppercase tracking-wider">Upload Certificate (PDF)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 hover:border-blue-400/50 rounded-2xl cursor-pointer bg-black/20 hover:bg-black/40 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:bg-blue-500/20 transition-colors">
                                                <FileUp className="w-8 h-8 text-white/40 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <p className="text-sm text-white/60"><span className="font-semibold text-blue-400">Click to upload</span></p>
                                            <p className="text-xs text-white/40 mt-1">PDF format (Max 10MB)</p>
                                        </div>
                                        <input type="file" className="hidden" accept=".pdf" />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-xs text-white/60 mb-2 ml-1 uppercase tracking-wider">Student Passport Photo</label>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 hover:border-purple-400/50 rounded-2xl cursor-pointer bg-black/20 hover:bg-black/40 transition-all group relative overflow-hidden">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:bg-purple-500/20 transition-colors">
                                                <svg className="w-8 h-8 text-white/40 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-white/60"><span className="font-semibold text-purple-400">Click to upload</span></p>
                                            <p className="text-xs text-white/40 mt-1">JPG/PNG (Max 2MB)</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/jpeg, image/png" />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold mt-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]">
                                    <FileBadge size={20} />
                                    Mint on Blockchain
                                </button>
                                <p className="text-center text-xs text-white/40 mt-4">
                                    Minting will incur a gas fee on the network and requires wallet signature.
                                </p>
                            </div>
                        </form>
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
                                                            <button className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove Student">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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

                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddingStudent(false); }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Full Name</label>
                                            <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. Satoshi Nakamoto" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                                            <input type="email" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="student@university.edu" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Course / Degree</label>
                                            <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. Web3 Engineering" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Enrollment ID</label>
                                            <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" placeholder="STU-..." required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Wallet Address (Optional)</label>
                                        <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" placeholder="0x..." />
                                    </div>

                                    <div className="pt-6 border-t border-white/10 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingStudent(false)}
                                            className="w-1/3 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                        >
                                            Add to Ledger
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
