import React, { useState } from 'react';

const Logo = ({ className = "" }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 1500); // 1.5s animation burst
    }

    const activeClasses = isPressed ? 'is-active' : '';

    return (
        <div 
            className={`relative select-none w-32 h-20 group flex items-center justify-center ${className} ${activeClasses}`}
            onClick={handlePress}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setTimeout(() => setIsPressed(false), 1500)}
        >
            {/* Multi-layered Nebula Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-500/10 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-1000 animate-nebula`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-3/4 -translate-y-3/4 w-16 h-16 bg-purple-500/10 rounded-full blur-[25px] opacity-0 group-hover:opacity-80 group-[.is-active]:opacity-80 transition-opacity duration-1000 animate-nebula`} style={{animationDelay: '-2s'}}></div>
            </div>
            
            {/* Comet Streaks (Shooting Stars) */}
            <div className={`absolute inset-x-[-20px] inset-y-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-700`}>
                <div className="shooting-star animate-comet w-24 top-1/4 left-0"></div>
                <div className="shooting-star animate-comet w-20 top-1/2 -left-4" style={{animationDelay: '-2.2s', opacity: 0.6}}></div>
            </div>

            {/* Orbiting Stardust */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-orbit blur-[0.5px]"></div>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-orbit-reverse blur-[1px]"></div>
            </div>

            <div className="relative z-20 flex items-center justify-center w-24 h-16 animate-float-cosmic">
                {/* Main Planet (LEVELUP) */}
                <div className={`absolute top-0 left-0 transition-all duration-700 transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-[.is-active]:-translate-x-1 group-[.is-active]:-translate-y-1`}>
                    {/* Planet Ring */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65px] h-3 border border-indigo-400/30 rounded-full opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-700 animate-ring`}></div>
                    
                    <div className={`w-14 h-14 rounded-full bg-linear-to-br from-indigo-950 via-indigo-900 to-slate-900 border-[3px] border-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(129,140,248,0.7)] group-[.is-active]:shadow-[0_0_40px_rgba(129,140,248,0.7)] group-hover:scale-[1.05] group-[.is-active]:scale-[1.05] group-hover:border-indigo-50 group-[.is-active]:border-indigo-50 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full group-[.is-active]:translate-x-full transition-transform duration-[1.5s]`}></div>
                        <span className="text-[11px] font-black text-white tracking-tighter leading-none uppercase relative drop-shadow-sm">
                            LEVELUP
                        </span>
                    </div>
                </div>

                {/* Sub-Planet (Map) */}
                <div className={`absolute bottom-0 right-1 transition-all duration-700 transform group-hover:translate-x-1 group-hover:translate-y-1 group-[.is-active]:translate-x-1 group-[.is-active]:translate-y-1`}>
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br from-[#5c2a44] via-[#4a1d35] to-[#2d1120] border-[3px] border-white flex items-center justify-center shadow-[0_0_15px_rgba(92,42,68,0.4)] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] group-[.is-active]:shadow-[0_0_30px_rgba(236,72,153,0.5)] group-hover:scale-110 group-[.is-active]:scale-110 group-hover:border-pink-50 group-[.is-active]:border-pink-50 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-linear-to-bl from-transparent via-white/15 to-transparent translate-y-full group-hover:-translate-y-full group-[.is-active]:-translate-y-full transition-transform duration-[1.2s]`}></div>
                        <span className="text-[11px] font-bold text-white leading-none relative drop-shadow-sm">
                            Map
                        </span>
                    </div>
                </div>
            </div>

            {/* Distant Sparkling Stars */}
            <div className={`absolute -inset-8 opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-1000 pointer-events-none`}>
                <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-star" style={{'--duration': '2s'}}></div>
                <div className="absolute bottom-4 right-8 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-star" style={{'--duration': '3s'}}></div>
                <div className="absolute top-12 right-2 w-1 h-1 bg-purple-200 rounded-full animate-star" style={{'--duration': '2.5s'}}></div>
                <div className="absolute bottom-0 left-1/4 w-0.5 h-0.5 bg-blue-100 rounded-full animate-star" style={{'--duration': '4s'}}></div>
            </div>
        </div>
    );
};

export default Logo;
