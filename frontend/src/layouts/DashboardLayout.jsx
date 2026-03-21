import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileBadge,
    LogOut,
    ChevronRight,
    Menu,
    X,
    User,
    Settings,
    Users,
    ShieldCheck
} from 'lucide-react';
import ReactLoading from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DashboardLayout = ({ children, role = 'student' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const currentHash = location.hash || '';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setUserName(userObj.name);
            } catch(e) {}
        }
    }, []);

    const handleLogout = () => {
        // Basic logout flow simulation
        navigate('/');
    };

    const adminLinks = [
        { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Issue Certificates', path: '/admin#issue', icon: <FileBadge size={20} /> },
        { name: 'Manage Students', path: '/admin#students', icon: <Users size={20} /> },
    ];

    const studentLinks = [
        { name: 'My Certificates', path: '/student', icon: <FileBadge size={20} /> },
        { name: 'Verify Certificate', path: '/student#verify', icon: <ShieldCheck size={20} /> },
        { name: 'Profile', path: '/student#profile', icon: <User size={20} /> },
        { name: 'Settings', path: '/student#settings', icon: <Settings size={20} /> },
    ];

    const links = role === 'admin' ? adminLinks : studentLinks;

    const isLinkActive = (linkPath) => {
        const linkBase = linkPath.split('#')[0];
        const linkHash = linkPath.includes('#') ? '#' + linkPath.split('#')[1] : '';

        if (location.pathname !== linkBase) return false;
        if (linkHash) return currentHash === linkHash;
        return currentHash === '';
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-2xl border-r border-white/10 select-none">

            {/* User Profile Area */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                    <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <User className="text-white/80" size={24} />
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-semibold">
                        {userName || (role === 'admin' ? 'Institution Admin' : 'Student')}
                    </h4>
                    <p className="text-xs text-blue-400 capitalize">{role} Account</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={() => setSidebarOpen(false)}
                        className={() => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                            ${isLinkActive(link.path)
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        {link.icon}
                        <span className="font-medium tracking-wide">{link.name}</span>
                        <ChevronRight size={16} className="ml-auto opacity-40" />
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex flex-col md:flex-row relative">

            {/* Mobile Header for Sidebar Toggle */}
            <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/10 z-30">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Dashboard
                </span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-20 md:top-20 left-0 h-[calc(100vh-5rem)] z-50 w-72 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-hidden">
                {children}
            </main>

        </div>
    );
};

export default DashboardLayout;
