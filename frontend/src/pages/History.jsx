import { useState, useEffect } from 'react'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'

export default function History({ onNavigate, onLoadRoadmap }) {
    const [history, setHistory] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => {
        const saved = localStorage.getItem('roadmap_history')
        if (saved) {
            try {
                setHistory(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse history:', e)
            }
        }
    }, [])

    const deleteItem = (id, e) => {
        e.stopPropagation()
        const newHistory = history.filter((item) => item.id !== id)
        setHistory(newHistory)
        localStorage.setItem('roadmap_history', JSON.stringify(newHistory))
        if (selectedItem?.id === id) {
            setSelectedItem(null)
        }
    }

    const clearHistory = () => {
        setHistory([])
        localStorage.removeItem('roadmap_history')
        setSelectedItem(null)
    }

    const loadRoadmap = (item) => {
        onLoadRoadmap(item)
        onNavigate('generator')
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getProgress = (item) => {
        if (!item.data?.nodes) return 0
        const total = item.data.nodes.length
        const completed = item.completedNodes?.length || 0
        return Math.round((completed / total) * 100)
    }

    return (
        <div className="page-container min-h-screen bg-transparent overflow-x-hidden">
            {/* Hero Section */}
            <section className="min-h-[60vh] flex items-center justify-center px-4 sm:px-12 lg:px-20 relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <ScrollReveal delay={0}>
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-jakarta font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
                            <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                            <span>Your Journey</span>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={200}>
                        <h1 className="text-5xl sm:text-8xl lg:text-9xl font-outfit font-black text-white mb-8 sm:mb-10 tracking-tight leading-[0.9]">
                            Roadmap
                            <span className="block mt-2 text-shimmer">
                                History
                            </span>
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal delay={400}>
                        <p className="text-lg sm:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
                            Browse and revisit your previously generated learning paths. Your progress is saved automatically.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* History Content */}
            <section className="py-16 px-8 sm:px-12 lg:px-20 relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-center">
                            {/* Cosmic 3D Sphere System */}
                            <div className="relative group mb-16 h-96 flex items-center justify-center">
                                {/* Back Glow Layers */}
                                <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                                <div className="absolute w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]"></div>

                                {/* Orbital Rings */}
                                <div className="absolute w-[420px] h-[420px] rounded-full border border-indigo-500/10 animate-spin" style={{ animationDuration: '15s' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                                </div>
                                <div className="absolute w-[380px] h-[180px] rounded-full border border-purple-500/10 rotate-45 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
                                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)]"></div>
                                </div>

                                {/* Main 3D Node Sphere */}
                                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-linear-to-br from-indigo-600 via-indigo-950 to-slate-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),inset_0_-20px_40px_rgba(0,0,0,0.6),inset_0_20px_40px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center p-8 sm:p-12 border border-white/5 overflow-hidden animate-float">
                                    {/* Procedural Shine */}
                                    <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none"></div>

                                    {/* Core Pulse */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_70%)] animate-pulse"></div>

                                    <h3 className="text-3xl font-outfit font-black text-white mb-2 tracking-tighter relative z-10 drop-shadow-lg">
                                        Singularity
                                    </h3>
                                    <div className="flex items-center gap-2 relative z-10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                        <p className="text-xs font-jakarta font-bold text-indigo-300/60 uppercase tracking-[0.3em]">
                                            History Void
                                        </p>
                                    </div>

                                    {/* Scanline effect */}
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent h-4 w-full -translate-y-full group-hover:animate-scanline pointer-events-none"></div>
                                </div>

                                {/* Energy Motes */}
                                <div className="absolute -top-10 right-20 w-3 h-3 bg-indigo-400/20 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute bottom-10 -left-10 w-4 h-4 bg-purple-400/20 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }}></div>
                            </div>

                            <p className="text-xl font-jakarta font-light text-slate-400 max-w-md leading-relaxed mb-12 opacity-80">
                                Every legend starts with a single step. Initiate your first AI-generated learning path.
                            </p>

                            <button
                                onClick={() => onNavigate('generator')}
                                className="group relative px-8 sm:px-12 py-4 sm:py-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white font-outfit font-black text-lg sm:text-xl transition-all duration-500 hover:scale-[1.05] active:scale-[0.98] overflow-hidden shadow-2xl hover:shadow-indigo-500/20"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-indigo-600/10 to-purple-600/10 transition-opacity group-hover:opacity-100"></div>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>

                                <span className="relative z-10 flex items-center gap-4">
                                    <i className="fa-solid fa-bolt-lightning text-indigo-400 group-hover:text-white transition-colors"></i>
                                    Initialize Voyage
                                </span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Header with Clear Button */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6 relative z-20">
                                <ScrollReveal>
                                    <h2 className="text-3xl sm:text-4xl font-outfit font-bold text-white flex items-center gap-4 sm:gap-5">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-float" style={{ animationDuration: '4s' }}>
                                            <i className="fa-solid fa-layer-group text-xl sm:text-2xl text-white"></i>
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Your Roadmaps</span>
                                            <span className="text-xs sm:text-sm font-jakarta font-medium text-slate-500 tracking-wider uppercase mt-1">
                                                Collection ({history.length})
                                            </span>
                                        </div>
                                    </h2>
                                </ScrollReveal>

                                <ScrollReveal delay={100}>
                                    <button
                                        onClick={clearHistory}
                                        className="px-6 py-3 rounded-xl bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 text-red-400/80 hover:text-red-400 font-semibold text-sm transition-all flex items-center gap-3 backdrop-blur-sm group"
                                    >
                                        <i className="fa-solid fa-trash-can group-hover:rotate-12 transition-transform"></i>
                                        Clear History
                                    </button>
                                </ScrollReveal>
                            </div>

                            {/* History Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {history.map((item, index) => (
                                    <ScrollReveal key={item.id} delay={index * 100}>
                                        <div
                                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                            className={`group relative p-6 sm:p-8 rounded-[32px] glass-premium transition-all duration-700 cursor-pointer hover-lift ${selectedItem?.id === item.id
                                                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                                                : 'border-white/5 hover:border-indigo-500/30'
                                                }`}
                                        >
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => deleteItem(item.id, e)}
                                                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-800/0 hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-transparent hover:border-red-500/20"
                                            >
                                                <i className="fa-solid fa-xmark text-lg"></i>
                                            </button>

                                            {/* Progress Ring with Glow */}
                                            <div className="relative w-24 h-24 mb-6 mx-auto group/progress">
                                                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                                <svg className="w-full h-full -rotate-90 relative z-10">
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="42"
                                                        fill="none"
                                                        stroke="rgba(255,255,255,0.03)"
                                                        strokeWidth="8"
                                                    />
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="42"
                                                        fill="none"
                                                        stroke="url(#history-progress-gradient)"
                                                        strokeWidth="8"
                                                        strokeDasharray={2 * Math.PI * 42}
                                                        strokeDashoffset={2 * Math.PI * 42 * (1 - getProgress(item) / 100)}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-1000 ease-out"
                                                    />
                                                    <defs>
                                                        <linearGradient id="history-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#818cf8" />
                                                            <stop offset="100%" stopColor="#c084fc" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                                    <span className="text-xl font-outfit font-black text-white group-hover:text-indigo-300 transition-colors">{getProgress(item)}%</span>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-2xl font-outfit font-bold text-white text-center mb-3 line-clamp-2 group-hover:text-indigo-200 transition-colors leading-tight">
                                                {item.data?.title || 'Untitled Roadmap'}
                                            </h3>

                                            {/* Meta Info */}
                                            <div className="flex items-center justify-center gap-3 sm:gap-5 text-[12px] sm:text-sm font-medium text-slate-500 mb-6">
                                                <span className="flex items-center gap-1.5 sm:gap-2 group-hover:text-slate-400 transition-colors">
                                                    <i className="fa-solid fa-diagram-project text-[10px] sm:text-xs text-indigo-500/70"></i>
                                                    {item.data?.nodes?.length || 0} Levels
                                                </span>
                                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-700"></span>
                                                <span className="flex items-center gap-1.5 sm:gap-2 group-hover:text-slate-400 transition-colors">
                                                    <i className="fa-regular fa-calendar text-[10px] sm:text-xs text-purple-500/70"></i>
                                                    {formatDate(item.timestamp)}
                                                </span>
                                            </div>

                                            {/* Category Chips */}
                                            <div className="flex flex-wrap justify-center gap-2 mb-8 h-14 overflow-hidden">
                                                {item.data?.nodes?.slice(1, 4).map((node, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-4 py-1.5 rounded-full bg-slate-800/40 border border-white/5 text-[11px] text-slate-400 font-jakarta font-semibold uppercase tracking-wider group-hover:border-indigo-500/20 group-hover:bg-indigo-500/5 transition-all"
                                                    >
                                                        {node.label}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Load Button */}
                                            <div className="mt-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        loadRoadmap(item)
                                                    }}
                                                    className="w-full py-4 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 text-white font-outfit font-bold text-sm flex items-center justify-center gap-3 opacity-90 group-hover:opacity-100 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/25 group-hover:translate-y-0 translate-y-2 group-hover:scale-[1.02] active:scale-[0.98] btn-shine"
                                                >
                                                    <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                                                    Resume Journey
                                                </button>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Spacer */}
            <div className="h-[100px]"></div>

            <Footer onNavigate={onNavigate} />
        </div>
    )
}
