import React, { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

const FeatureCard = ({ icon, title, description, delay }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ScrollReveal delay={delay}>
            <div
                className={`p-8 rounded-3xl transition-all duration-500 group flex flex-col items-center text-center h-full card-tilt glow-border cursor-pointer ${
                    isHovered 
                    ? 'bg-violet-400/20 border-violet-400/40 shadow-[0_20px_40px_rgba(167,139,250,0.25)] -translate-y-2' 
                    : 'bg-white/5 border-white/10'
                }`}
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
                onClick={() => setIsHovered(!isHovered)}
            >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 transition-all duration-500 ${
                    isHovered ? 'shadow-lg shadow-indigo-500/40 -translate-y-1' : ''
                }`}>
                    <i className={`fa-solid ${icon} text-white text-xl transition-all duration-500 ${isHovered ? 'scale-110 animate-icon-spin' : ''}`}></i>
                </div>
                <h3 className={`text-xl font-semibold mb-3 transition-colors duration-500 ${isHovered ? 'text-white' : 'text-slate-200'}`}>
                    {title}
                </h3>
                <p className={`leading-relaxed transition-colors duration-500 ${isHovered ? 'text-slate-200' : 'text-slate-400'}`}>
                    {description}
                </p>
            </div>
        </ScrollReveal>
    );
};

export default FeatureCard;
