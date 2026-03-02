import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ title, description, children, className = "", delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay }}
            className={`glass-panel rounded-3xl p-6 md:p-8 flex flex-col items-start ${className}`}
        >
            {title && <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-3">{title}</h3>}
            {description && <p className="text-white/70 text-sm md:text-base mb-6 leading-relaxed">{description}</p>}

            <div className="w-full flex-grow">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
