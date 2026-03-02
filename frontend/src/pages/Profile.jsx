import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'

export default function Profile({ onNavigate }) {
    const [stats, setStats] = useState({
        totalStepsCompleted: 0,
        totalRoadmaps: 0,
        completedRoadmaps: 0
    })

    useEffect(() => {
        const calculateStats = () => {
            const saved = localStorage.getItem('roadmap_history')
            if (!saved) return

            try {
                const history = JSON.parse(saved)
                let steps = 0
                let completedRoadmaps = 0

                history.forEach(item => {
                    const completedNodesCount = item.completedNodes?.length || 0
                    steps += completedNodesCount

                    if (item.data?.nodes?.length > 0) {
                        const progress = Math.round((completedNodesCount / item.data.nodes.length) * 100)
                        if (progress === 100) {
                            completedRoadmaps++
                        }
                    }
                })

                setStats({
                    totalStepsCompleted: steps,
                    totalRoadmaps: history.length,
                    completedRoadmaps: completedRoadmaps
                })
            } catch (e) {
                console.error('Failed to parse history:', e)
            }
        }

        calculateStats()

        window.addEventListener('storage', calculateStats)
        return () => window.removeEventListener('storage', calculateStats)
    }, [])

    // RPG Progression Logic
    let currentLevel = 1
    let xpForNextLevel = 5
    let currentXP = Math.max(0, stats.totalStepsCompleted + (stats.completedRoadmaps * 10))

    // Just for demonstration, if you want to test visual nodes, you can uncomment this to artificially boost level:
    // currentXP += 500; 

    while (currentXP >= xpForNextLevel) {
        currentXP -= xpForNextLevel
        currentLevel++
        xpForNextLevel = currentLevel * 5
    }

    const progressPercentage = Math.round((currentXP / xpForNextLevel) * 100)

    // Deep Cosmic Purple Theme
    const getRankInfo = (level) => {
        if (level < 5) return { title: 'Cosmic Dust', icon: 'fa-sparkles', color: 'from-purple-400 to-indigo-600', shadow: 'shadow-purple-500/50' }
        if (level < 10) return { title: 'Nebula Explorer', icon: 'fa-meteor', color: 'from-violet-400 to-fuchsia-600', shadow: 'shadow-violet-500/50' }
        if (level < 20) return { title: 'Star Weaver', icon: 'fa-star', color: 'from-fuchsia-400 to-purple-600', shadow: 'shadow-fuchsia-500/50' }
        if (level < 35) return { title: 'Galaxy Walker', icon: 'fa-planet-ringed', color: 'from-purple-400 to-pink-600', shadow: 'shadow-pink-500/50' }
        if (level < 50) return { title: 'Void Architect', icon: 'fa-user-astronaut', color: 'from-indigo-400 to-purple-600', shadow: 'shadow-indigo-500/50' }
        return { title: 'Astral Ascendant', icon: 'fa-sun', color: 'from-purple-300 to-fuchsia-500', shadow: 'shadow-purple-500/50' }
    }

    const rank = getRankInfo(currentLevel)

    // Calculate constellation nodes (one for every 5 levels)
    const fiveLevelsCount = Math.floor(currentLevel / 5)
    const milestones = Array.from({ length: fiveLevelsCount })

    // Decorative floating particles
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50 + 'vw',
        y: Math.random() * 100 - 50 + 'vh',
        scale: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10
    }))

    return (
        <div className="page-container min-h-screen relative overflow-x-hidden pt-24 bg-slate-950">
            {/* Immersive Cosmic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '25s' }}></div>
                <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-float" style={{ animationDuration: '20s', animationDelay: '5s' }}></div>
                <div className="absolute bottom-[10%] left-[40%] w-[700px] h-[700px] bg-fuchsia-600/10 rounded-full blur-[130px] animate-float" style={{ animationDuration: '30s', animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>

                {/* Floating Particles */}
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-purple-400 opacity-30 shadow-[0_0_10px_#c084fc]`}
                        animate={{
                            x: [0, parseFloat(p.x), parseFloat(p.x) * -0.5, 0],
                            y: [0, parseFloat(p.y), parseFloat(p.y) * -0.5, 0],
                            scale: [0, p.scale, p.scale * 1.5, 0],
                            opacity: [0, 0.6, 0.2, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <section className="py-12 px-4 sm:px-12 lg:px-20 relative min-h-[85vh] flex flex-col items-center">
                <div className="max-w-6xl w-full mx-auto relative z-10">

                    <ScrollReveal delay={0}>
                        <div className="text-center mb-20 relative">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-bold uppercase tracking-widest backdrop-blur-md mb-6"
                            >
                                <span className={`w-2 h-2 rounded-full bg-purple-400 animate-pulse`}></span>
                                <span className="text-purple-300 relative z-10">Astral Profile</span>
                            </motion.div>

                            <h1 className="text-6xl sm:text-8xl font-outfit font-black text-white mb-6 tracking-tighter">
                                Cosmic <span className={`text-transparent bg-clip-text bg-linear-to-r ${rank.color}`}>Status</span>
                            </h1>
                            <div className="flex justify-center w-full text-center">
                                <p className="text-purple-200/60 text-xl md:text-2xl font-light max-w-2xl leading-relaxed text-center">
                                    Forge your destiny across the universe. For every 5 levels, a new star is born in your constellation.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Avatar / Level Sphere & Constellation */}
                        <ScrollReveal delay={200} className="xl:col-span-6 flex justify-center">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-full max-w-lg relative p-12 rounded-[40px] glass-premium border border-purple-500/20 flex flex-col items-center justify-center text-center overflow-hidden group shadow-[0_0_50px_rgba(88,28,135,0.3)]"
                            >
                                {/* Core Glow */}
                                <div className={`absolute inset-0 bg-linear-to-br ${rank.color} opacity-0 group-hover:opacity-10 transition-all duration-700 ease-out`}></div>

                                {/* Orbital Avatar System & Constellation */}
                                <div className="relative w-80 h-80 mb-10 mt-4 flex items-center justify-center">

                                    {/* Rotating Rings */}
                                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-400/50 animate-spin" style={{ animationDuration: '20s' }}></div>
                                    <div className="absolute inset-4 rounded-full border-2 border-indigo-500/20 border-b-fuchsia-400/40 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
                                    <div className="absolute inset-12 rounded-full border border-purple-400/10 border-r-purple-300/30 animate-spin" style={{ animationDuration: '30s' }}></div>

                                    {/* Constellation Orbit (Appears if Lvl >= 10) */}
                                    {milestones.length > 0 && (
                                        <>
                                            {/* Path of orbit */}
                                            <div className="absolute inset-0 rounded-full border border-purple-500/30 border-dashed opacity-50"></div>

                                            {/* Orbiting Container */}
                                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '45s' }}>
                                                {/* Connecting Polygon for constellation effect */}
                                                {milestones.length > 1 && (
                                                    <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                                                        <polygon
                                                            points={milestones.map((_, i) => {
                                                                const r = 160; // radius is half of w-80 (320px)
                                                                const angle = (i * 360) / milestones.length;
                                                                const rad = (angle * Math.PI) / 180;
                                                                return `${160 + r * Math.cos(rad)},${160 + r * Math.sin(rad)}`;
                                                            }).join(' ')}
                                                            fill="rgba(168,85,247,0.05)"
                                                            stroke="rgba(192,132,252,0.4)"
                                                            strokeWidth="1"
                                                            strokeDasharray="4 4"
                                                        />
                                                    </svg>
                                                )}

                                                {/* Constellation Nodes */}
                                                {milestones.map((_, i) => {
                                                    const r = 160; // orbit radius
                                                    const angle = (i * 360) / milestones.length;
                                                    const rad = (angle * Math.PI) / 180;
                                                    const x = 160 + r * Math.cos(rad);
                                                    const y = 160 + r * Math.sin(rad);

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="absolute w-7 h-7 rounded-full border-[3px] border-slate-900 shadow-[0_0_20px_rgba(216,180,254,0.8)] z-20 transition-all hover:scale-125 flex items-center justify-center bg-linear-to-br from-fuchsia-400 to-purple-600"
                                                            style={{
                                                                left: `${x}px`,
                                                                top: `${y}px`,
                                                                transform: 'translate(-50%, -50%)'
                                                            }}
                                                        >
                                                            {/* Level indicator inside node */}
                                                            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-md">
                                                                {(i + 1) * 5}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {/* The Central Sphere */}
                                    <div className="relative z-10 w-48 h-48 rounded-full p-2 bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.3)] overflow-hidden group-hover:border-purple-400/60 transition-colors duration-500">
                                        <div className={`w-full h-full rounded-full bg-linear-to-br ${rank.color} flex items-center justify-center shadow-inner relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-overlay"></div>
                                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-900/50 to-slate-950/90"></div>

                                            <div className="flex flex-col items-center relative z-20 transform group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-xs font-jakarta font-black text-purple-200/80 uppercase tracking-[0.4em] mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">Lvl</span>
                                                <span className="text-7xl font-outfit font-black text-white drop-shadow-[0_0_25px_rgba(216,180,254,0.6)] leading-none">
                                                    {currentLevel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rank Title */}
                                <div className={`inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl relative z-10 overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-linear-to-r ${rank.color} opacity-20`}></div>
                                    <i className={`fa-solid ${rank.icon} text-transparent bg-clip-text bg-linear-to-r ${rank.color} text-xl drop-shadow-[0_0_10px_rgba(216,180,254,0.5)]`}></i>
                                    <span className="text-white font-outfit font-bold tracking-wide text-lg">{rank.title}</span>
                                </div>

                                <p className="text-purple-300/80 mt-6 font-medium text-sm flex flex-col items-center gap-1.5">
                                    <span>Gather <strong className="text-white font-bold">{xpForNextLevel - currentXP} Cosmic XP</strong> to evolve</span>
                                    {milestones.length === 0 ? (
                                        <span className="text-[11px] text-fuchsia-400/70 uppercase tracking-widest font-bold mt-1">reach lvl 5 for first node</span>
                                    ) : (
                                        <span className="text-[11px] text-fuchsia-400/70 uppercase tracking-widest font-bold mt-1">{milestones.length} Constellation Nodes Unlocked</span>
                                    )}
                                </p>
                            </motion.div>
                        </ScrollReveal>

                        {/* Right Panel: Stats & XP Bar */}
                        <ScrollReveal delay={400} className="xl:col-span-6 flex flex-col gap-8 justify-center">

                            {/* Main Progress Bar Container */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-8 sm:p-10 rounded-[40px] glass-premium border border-purple-500/20 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.2)] relative overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-8 h-8 rounded-lg bg-linear-to-r ${rank.color} flex items-center justify-center shadow-lg ${rank.shadow}`}>
                                                <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
                                            </div>
                                            <h3 className="text-3xl font-outfit font-black text-white">Dark Energy</h3>
                                        </div>
                                        <p className="text-purple-300/70 text-sm font-jakarta ml-11">Total accumulated cosmic power</p>
                                    </div>
                                    <div className="text-right ml-11 sm:ml-0">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-5xl font-black text-transparent bg-clip-text bg-linear-to-r ${rank.color}`}>
                                                {currentXP}
                                            </span>
                                            <span className="text-purple-500 font-bold text-xl">/ {xpForNextLevel}</span>
                                        </div>
                                        <span className="text-xs font-bold text-fuchsia-400/80 uppercase tracking-widest">{progressPercentage}% Progress</span>
                                    </div>
                                </div>

                                {/* Cosmic Progress Bar */}
                                <div className="h-8 w-full bg-slate-900/90 rounded-2xl overflow-hidden border border-purple-500/20 relative shadow-inner p-1">
                                    <div
                                        className={`h-full rounded-xl bg-linear-to-r ${rank.color} relative overflow-hidden transition-all duration-1000 ease-out flex items-center justify-end px-4 shadow-[0_0_15px_rgba(192,132,252,0.5)]`}
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-size-[24px_24px] animate-pulse-slow"></div>

                                        {/* Glow at the tip */}
                                        <div className="absolute top-0 right-0 w-8 h-full bg-linear-to-l from-white/50 to-transparent"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Detailed Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Stat Card 1 */}
                                <motion.div
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-8 rounded-[32px] bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-fuchsia-500/20 transition-colors"></div>
                                    <div className="flex flex-col gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.1)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.3)] duration-500">
                                            <i className="fa-solid fa-check-double"></i>
                                        </div>
                                        <div>
                                            <p className="text-4xl font-outfit font-black text-white mb-1 group-hover:text-fuchsia-300 transition-colors">{stats.totalStepsCompleted}</p>
                                            <h4 className="text-purple-300/70 text-sm font-medium font-jakarta tracking-wide">Missions Conquered</h4>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Stat Card 2 */}
                                <motion.div
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-8 rounded-[32px] bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors"></div>
                                    <div className="flex flex-col gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] duration-500">
                                            <i className="fa-solid fa-trophy"></i>
                                        </div>
                                        <div>
                                            <p className="text-4xl font-outfit font-black text-white mb-1 group-hover:text-indigo-300 transition-colors">{stats.completedRoadmaps}</p>
                                            <h4 className="text-purple-300/70 text-sm font-medium font-jakarta tracking-wide">Galaxies Mastered</h4>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Stat Card 3 (Full Width) */}
                                <motion.div
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    className="p-8 rounded-[32px] bg-linear-to-br from-purple-900/30 to-slate-900/60 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 transition-all group sm:col-span-2 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] duration-500">
                                            <i className="fa-solid fa-route"></i>
                                        </div>
                                        <div>
                                            <p className="text-4xl font-outfit font-black text-white mb-1 group-hover:text-purple-300 transition-colors">{stats.totalRoadmaps}</p>
                                            <h4 className="text-purple-300/70 text-sm font-medium font-jakarta tracking-wide">Universes Explored</h4>
                                        </div>
                                    </div>
                                    <div className="relative z-10 hidden sm:block opacity-20 group-hover:opacity-40 transition-opacity">
                                        <i className="fa-solid fa-meteor text-6xl text-purple-400/50"></i>
                                    </div>
                                </motion.div>
                            </div>

                        </ScrollReveal>
                    </div>

                </div>
            </section>

            <Footer onNavigate={onNavigate} />
        </div>
    )
}
