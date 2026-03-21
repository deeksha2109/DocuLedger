import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ShieldAlert, KeyRound, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ loading: false, error: null });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null });

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/auth/login`, {
                email,
                password
            });

            // Assuming the backend returns the user object and a JWT token
            const { token, user } = response.data;

            // Basic role check - if user attempts to login to wrong portal
            if (user.role && user.role !== role && role === 'admin') {
                setStatus({ loading: false, error: "Unauthorized: Admin access required." });
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('email', user.email);

            if (role === 'admin' || user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student'); // Adjust based on your routing
            }
        } catch (error) {
            setStatus({
                loading: false,
                error: error.response?.data?.message || 'Login failed. Please check your credentials.'
            });
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4">

            {/* Decorative Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden group">

                    {/* Subtle gradient border effect top */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent opacity-50" />

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-white/50 text-sm">Sign in to your Web3 Identity</p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setRole('user')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            <UserCircle size={16} /> Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            <ShieldAlert size={16} /> Admin
                        </button>
                    </div>

                    {status.error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm leading-relaxed">{status.error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="relative">
                            <input
                                type="email"
                                id="identifier"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl peer placeholder-transparent text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="identifier"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm transition-all
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1d] peer-focus:px-2 peer-focus:rounded
                           peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#0a0f1d] peer-valid:px-2 peer-valid:rounded peer-valid:text-blue-400"
                            >
                                Email Address
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl peer placeholder-transparent text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm transition-all
                           peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1d] peer-focus:px-2 peer-focus:rounded
                           peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#0a0f1d] peer-valid:px-2 peer-valid:rounded peer-valid:text-blue-400"
                            >
                                Passkey / Password
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={status.loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {status.loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connecting...
                                </span>
                            ) : (
                                <>
                                    <KeyRound size={20} /> Access Gateway
                                </>
                            )}
                        </button>

                    </form>

                    <p className="mt-6 text-center text-sm text-white/60">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-400 font-semibold hover:text-purple-400 transition-colors"
                        >
                            Register
                        </button>
                    </p>
                    <p className="mt-4 text-center text-xs text-white/40">
                        Secure login powered by decentralized identity protocols.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
