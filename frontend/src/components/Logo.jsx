import React, { useState } from 'react';

const Logo = ({ className = "" }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 1500);
    }

    const activeClasses = isPressed ? 'is-active' : '';

    return (
        <div 
            className={`relative select-none flex items-center justify-center p-2 group cursor-pointer ${className} ${activeClasses}`}
            onClick={handlePress}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setTimeout(() => setIsPressed(false), 1500)}
        >
            <div className="relative flex items-center justify-center w-28 h-20">
                {/* Main Planet (LEVEL) */}
                <div className="absolute top-0 left-0 transition-all duration-700 transform group-hover:-translate-y-1 group-[.is-active]:-translate-y-1 z-20">
                    {/* Interaction Glow */}
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="w-18 h-18 rounded-full bg-linear-to-br from-indigo-600 via-indigo-700 to-indigo-900 border-[3px] border-white flex items-center justify-center shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all duration-500 group-hover:shadow-[0_0_45px_rgba(129,140,248,0.8)] group-hover:scale-105 relative overflow-hidden">
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s]"></div>
                        <span className="text-[14px] font-black text-white tracking-widest leading-none uppercase relative drop-shadow-md">
                            LEVEL
                        </span>
                    </div>
                </div>

                {/* Sub-Planet (UP) */}
                <div className="absolute bottom-1 right-2 transition-all duration-700 transform group-hover:translate-x-1 group-hover:translate-y-1 group-[.is-active]:translate-x-1 group-[.is-active]:translate-y-1 z-30">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-500 via-pink-600 to-[#2d1120] border-[3px] border-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-500 group-hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] group-hover:scale-110 relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-bl from-transparent via-white/25 to-transparent translate-y-full group-hover:-translate-y-full transition-transform duration-1000"></div>
                        <span className="text-[15px] font-black text-white leading-none relative drop-shadow-md uppercase">
                            UP
                        </span>
                    </div>
                </div>
                
                {/* Subtle connecting ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] border border-white/5 rounded-full pointer-events-none"></div>
            </div>
        </div>
    );
};

export default Logo;
