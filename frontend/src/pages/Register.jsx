import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCircle, ShieldAlert, KeyRound, Mail, Type } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        // Simulate registration success, redirect to login
        navigate('/login');
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4">

            {/* Decorative Orbs */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg my-12"
            >
                <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden group">

                    {/* Subtle gradient border effect top */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent opacity-50" />

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                            <UserPlus className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                            Create Account
                        </h2>
                        <p className="text-white/50 text-sm">Join the decentralized verification network</p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5 mx-auto max-w-xs">
                        <button
                            onClick={() => setRole('student')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'student' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            <UserCircle size={16} /> Student
                        </button>
                        <button
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            <ShieldAlert size={16} /> Institution
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <input
                                    type="text"
                                    id="fullname"
                                    className="glass-input w-full px-4 py-3 rounded-xl peer placeholder-transparent"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="fullname"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm transition-all
                            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1d] peer-focus:px-2 peer-focus:rounded
                            peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#0a0f1d] peer-valid:px-2 peer-valid:rounded peer-valid:text-blue-400 flex items-center gap-1"
                                >
                                    <Type size={14} /> {role === 'admin' ? 'Institution Name' : 'Full Name'}
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    className="glass-input w-full px-4 py-3 rounded-xl peer placeholder-transparent"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm transition-all
                            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1d] peer-focus:px-2 peer-focus:rounded
                            peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#0a0f1d] peer-valid:px-2 peer-valid:rounded peer-valid:text-blue-400 flex items-center gap-1"
                                >
                                    <Mail size={14} /> Email Address
                                </label>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                id="identifier"
                                className="glass-input w-full px-4 py-3 rounded-xl peer placeholder-transparent"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="identifier"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm transition-all
                        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1d] peer-focus:px-2 peer-focus:rounded
                        peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#0a0f1d] peer-valid:px-2 peer-valid:rounded peer-valid:text-blue-400 flex items-center gap-1"
                            >
                                {role === 'admin' ? 'Institution License ID' : 'Student Wallet Address (0x...)'}
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                className="glass-input w-full px-4 py-3 rounded-xl peer placeholder-transparent"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm transition-all
                        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1d] peer-focus:px-2 peer-focus:rounded
                        peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#0a0f1d] peer-valid:px-2 peer-valid:rounded peer-valid:text-blue-400 flex items-center gap-1"
                            >
                                <KeyRound size={14} /> Create Passkey
                            </label>
                        </div>

                        <p className="text-xs text-white/40 pl-1">
                            By registering, you agree to secure your credentials on the blockchain ledger.
                        </p>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
                        >
                            Complete Registration
                        </button>

                    </form>

                    <p className="mt-6 text-center text-sm text-white/60 pt-4 border-t border-white/5">
                        Already part of the network?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-400 font-semibold hover:text-purple-400 transition-colors"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
