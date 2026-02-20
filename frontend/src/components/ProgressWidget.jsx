import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ProgressWidget = ({
    data,
    completedNodes,
    isGenerating,
    generationProgress,
    generationGoal,
    generationError,
    onReturn,
    visible
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef(null);

    // Hide if on Generator page (provided by visible prop) 
    // OR if there's no active generation/data to track
    if (!visible) return null;
    if (!isGenerating && !generationError && !data) return null;

    // Calculate roadmap completion
    const totalNodes = data?.nodes?.length || 0;
    const finishedNodes = completedNodes?.size || 0;
    const completionPercentage = totalNodes > 0 ? Math.round((finishedNodes / totalNodes) * 100) : 0;
    const displayProgress = isGenerating ? generationProgress : completionPercentage;

    // Status Determination
    let statusText = "Mission Active";
    let statusLabel = "Done";
    let statusColor = "text-emerald-400";
    let gradId = "hud-grad-live";

    if (isGenerating) {
        statusText = "Generating Matrix...";
        statusLabel = "Arch";
        statusColor = "text-indigo-400";
        gradId = "hud-grad-gen";
    } else if (generationError) {
        statusText = "Sync Interrupted";
        statusLabel = "Err";
        statusColor = "text-red-400";
        gradId = "hud-grad-err";
    } else if (completionPercentage === 100 && totalNodes > 0) {
        statusText = "Mission Completed";
        statusLabel = "100%";
        statusColor = "text-amber-400";
        gradId = "hud-grad-gold";
    }

    // Circular Progress Math
    const size = 95;
    const strokeWidth = 5;
    const center = size / 2;
    const radius = center - strokeWidth - 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayProgress / 100) * circumference;

    const isPC = window.innerWidth > 768;

    return (
        <motion.div
            drag={!isPC}
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{
                top: -window.innerHeight + 150,
                bottom: 50,
                left: -window.innerWidth + 150,
                right: 50
            }}
            whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`fixed bottom-8 right-8 z-50 transition-opacity duration-700 ${!isPC ? '' : 'pointer-events-auto'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ touchAction: !isPC ? 'none' : 'auto' }} // Critical for mobile dragging
        >
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.4)); }
                    50% { filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.7)); }
                }
                @keyframes rotate-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .circular-glass {
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                }
            `}</style>

            <div className="relative cursor-pointer group" onClick={onReturn}>
                {/* HUD Label (Tooltip) */}
                <div className={`absolute bottom-full right-0 mb-5 transition-all duration-500 transform ${isHovered || isGenerating || generationError ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl min-w-[180px] max-w-[260px] overflow-hidden">
                        {/* Status Header */}
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${statusColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-current ${isGenerating ? 'animate-ping' : ''}`}></span>
                                {statusText}
                            </span>
                            {!isGenerating && !generationError && (
                                <span className="text-[10px] font-bold text-white/40">{finishedNodes}/{totalNodes}</span>
                            )}
                        </div>

                        {/* Content */}
                        <p className="text-xs font-bold text-white leading-snug wrap-break-word">
                            {generationError ?
                                <span className="text-red-300">Architecture failure: Check connection</span> :
                                isGenerating ? (generationGoal || 'Neural synthesis in progress...') :
                                    (data?.title || 'System Standby')}
                        </p>

                        {/* Animated indicators during generation */}
                        {isGenerating && (
                            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-1/3 animate-[shimmer_2s_infinite]" />
                            </div>
                        )}

                        {/* Tooltip Arrow */}
                        <div className="absolute top-full right-10 w-3 h-3 bg-slate-900 border-r border-b border-white/10 transform rotate-45 -translate-y-1.5"></div>
                    </div>
                </div>

                {/* Main Circular HUD Module */}
                <div className={`relative w-[95px] h-[95px] rounded-full circular-glass flex items-center justify-center transition-all duration-500 scale-100 group-hover:scale-105 ${isGenerating ? 'animate-[pulse-glow_2s_infinite]' : ''}`}>

                    {/* SVG Circular Progress */}
                    <svg className="absolute inset-0 -rotate-90" width="95" height="95">
                        {/* Background Track */}
                        <circle
                            cx="47.5"
                            cy="47.5"
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress Fill */}
                        <circle
                            cx="47.5"
                            cy="47.5"
                            r={radius}
                            fill="transparent"
                            stroke={`url(#${gradId})`}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="hud-grad-gen" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient id="hud-grad-live" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                            <linearGradient id="hud-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                            <linearGradient id="hud-grad-err" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#b91c1c" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Central Content */}
                    <div className="flex flex-col items-center justify-center z-10 select-none">
                        <div className={`text-xl font-black tracking-tighter transition-colors ${generationError ? 'text-red-400' : isGenerating ? 'text-indigo-400' : 'text-white'}`}>
                            {generationError ? '!' : `${Math.round(displayProgress)}%`}
                        </div>
                        <div className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${statusColor}`}>
                            {statusLabel}
                        </div>
                    </div>

                    {/* Outer HUD Rings */}
                    <div className="absolute inset-0 border border-white/5 rounded-full scale-110 pointer-events-none"></div>
                    <div className={`absolute inset-0 border border-dashed border-white/10 rounded-full scale-[1.18] pointer-events-none opacity-20 ${isGenerating ? 'animate-[rotate-slow_10s_linear_infinite]' : ''}`}></div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProgressWidget;
