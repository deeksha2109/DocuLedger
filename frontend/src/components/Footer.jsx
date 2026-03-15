import React from 'react';
import { Hexagon, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex items-center gap-2">
                        <Hexagon className="w-6 h-6 text-purple-400" />
                        <span className="text-lg font-bold text-white/90 tracking-wide">
                            DocuLedger
                        </span>
                    </div>

                    <p className="text-sm text-white/50 text-center md:text-left">
                        © {new Date().getFullYear()} DocuLedger. Securing credentials on the blockchain.
                    </p>

                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 glass-button rounded-full text-white/70 hover:text-white">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 glass-button rounded-full text-white/70 hover:text-white">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 glass-button rounded-full text-white/70 hover:text-white">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
