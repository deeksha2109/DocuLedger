import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileKey, Zap, ArrowRight, ArrowDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Home = () => {
    const features = [
        {
            icon: <ShieldCheck className="w-10 h-10 text-green-400" />,
            title: "Tamper-Proof Security",
            description: "Certificates are permanently secured on the blockchain, making forgery mathematically impossible."
        },
        {
            icon: <Zap className="w-10 h-10 text-yellow-400" />,
            title: "Instant Verification",
            description: "Verify any certificate globally within seconds using a simple QR code or certificate ID."
        },
        {
            icon: <FileKey className="w-10 h-10 text-blue-400" />,
            title: "Decentralized Storage",
            description: "No single point of failure. Your records are distributed across a decentralized network."
        }
    ];

    const steps = [
        { num: "01", title: "Institution Issues", desc: "Authorized University uploads the certificate PDF and details." },
        { num: "02", title: "Blockchain Record", desc: "A unique cryptographic hash is generated and stored on the immutable ledger." },
        { num: "03", title: "Student Access", desc: "Students can access their digital certificates via their personalized dashboard." },
        { num: "04", title: "Global Verification", desc: "Employers and verifiers scan or upload to confirm authenticity instantly." }
    ];

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col w-full">

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">

                {/* Animated background elements typical of Web3 */}
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 max-w-4xl"
                >
                    <div className="glass-panel inline-block px-4 py-1.5 rounded-full mb-8">
                        <span className="text-sm font-semibold tracking-wider text-blue-300 uppercase">
                            The Future of Credentialing
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Blockchain-Based</span>
                        <br /> Certificate Verification
                    </h1>

                    <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Eliminate fake degrees and provide instant, zero-trust verification of academic credentials through decentralized ledger technology.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
                        >
                            Issue Certificate <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/verify"
                            className="w-full sm:w-auto px-8 py-4 glass-button rounded-full font-bold text-lg hover:bg-white/10"
                        >
                            Verify Certificate
                        </Link>
                    </div>
                </motion.div>

                <motion.button
                    onClick={scrollToFeatures}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ duration: 1.5, delay: 1, repeat: Infinity }}
                    className="absolute bottom-10 p-3 glass-button rounded-full"
                >
                    <ArrowDown className="text-blue-400" />
                </motion.button>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 max-w-7xl mx-auto relative z-10 w-full">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Why Choose Blockchain?</h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">Traditional paper certificates are easily forged. Our solution brings cryptography and decentralization to academic records.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <GlassCard key={idx} delay={idx * 0.2} className="hover:-translate-y-2 transition-transform duration-300">
                            <div className="mb-6 p-4 rounded-xl bg-white/5 inline-block border border-white/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-white/60 leading-relaxed">{feature.description}</p>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-4 bg-black/20 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto">A seamless transparent flow from issuance to verification.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative glass-panel rounded-2xl p-8 group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-8xl transition-transform group-hover:scale-110 group-hover:text-blue-400">
                                    {step.num}
                                </div>
                                <h4 className="text-xl font-bold text-blue-300 mb-4 tracking-wide relative z-10">{step.title}</h4>
                                <p className="text-white/70 text-sm leading-relaxed relative z-10">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
