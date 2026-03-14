import React, { useEffect, useRef, useState } from 'react';
import ScrollReveal from './ScrollReveal';

const ParticleCard = ({ title, description, stepNumber }) => {
    const canvasRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        // Increase particle density when hovered/active for a richer "wow" effect
        const particleCount = isMobile ? (isHovered ? 85 : 40) : (isHovered ? 85 : 60);

        // Target points for the "morphed" state (a rectangle/frame)
        const targets = [];
        for (let i = 0; i < particleCount; i++) {
            targets.push({ x: 0, y: 0 });
        }

        const updateTargets = () => {
            const w = canvas.width - 40;
            const h = canvas.height - 40;
            const p = 20;
            const perimeter = 2 * w + 2 * h;

            for (let i = 0; i < particleCount; i++) {
                const distance = (i / particleCount) * perimeter;

                if (distance <= w) { // top edge
                    targets[i].x = p + distance;
                    targets[i].y = p;
                } else if (distance <= w + h) { // right edge
                    targets[i].x = p + w;
                    targets[i].y = p + (distance - w);
                } else if (distance <= 2 * w + h) { // bottom edge
                    targets[i].x = p + w - (distance - w - h);
                    targets[i].y = p + h;
                } else { // left edge
                    targets[i].x = p;
                    targets[i].y = p + h - (distance - 2 * w - h);
                }
            }
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.acc = 0.05;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update(isHovered, target) {
                if (isHovered) {
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    this.x += dx * 0.15;
                    this.y += dy * 0.15;
                    this.opacity = Math.min(0.8, this.opacity + 0.05);
                    this.size = Math.min(2, this.size + 0.1);
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.opacity = Math.max(0.15, this.opacity - 0.002);
                    this.size = Math.max(0.7, this.size - 0.005);

                    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                        this.reset();
                    }
                }
            }

            draw() {
                // Luxury cosmic stardust color
                ctx.fillStyle = `rgba(224, 231, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
            updateTargets();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.update(isHovered, targets[i]);
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            updateTargets();
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        init();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [isHovered]);

    return (
        <div
            className="relative group h-full w-full cursor-pointer active:scale-95 transition-transform"
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            onClick={() => isMobile && setIsHovered(!isHovered)}
        >
            <div className={`absolute inset-0 rounded-3xl transition-all duration-700 overflow-hidden ${isHovered ? 'bg-indigo-500/10 backdrop-blur-sm scale-[1.02] shadow-[0_0_50px_rgba(79,70,229,0.2)] border-indigo-500/30' : 'bg-white/5 border-white/10'
                } border`}>
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ willChange: 'transform' }}
                />

                <div className="relative z-10 p-6 md:p-8 lg:p-10 h-full flex flex-col items-center justify-center text-center">
                    <ScrollReveal delay={100}>
                        <div className={`mb-4 md:mb-6 transition-all duration-500 ${isHovered ? 'scale-110 -translate-y-2' : ''}`}>
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center border transition-all duration-700 ${isHovered ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/10'}`}>
                                <span className="text-xl md:text-2xl font-black text-indigo-400 font-['Outfit']">{stepNumber}</span>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={200}>
                        <h3 className={`text-xl md:text-2xl font-bold mb-2 md:mb-4 transition-all duration-500 font-['Outfit'] ${isHovered ? 'text-white translate-y-[-4px]' : 'text-slate-200'
                            }`}>
                            {title}
                        </h3>
                    </ScrollReveal>

                    <ScrollReveal delay={300}>
                        <p className={`text-sm md:text-lg leading-relaxed transition-all duration-500 ${isHovered ? 'text-slate-200' : 'text-slate-400'
                            }`}>
                            {description}
                        </p>
                    </ScrollReveal>


                </div>
            </div>
        </div>
    );
};

const AntigravityCards = () => {
    const steps = [
        {
            title: 'Enter Your Goal',
            description: 'Type your goal in any language - career change, new skill, or project idea.',
            stepNumber: '01'
        },
        {
            title: 'AI Generates',
            description: 'Our AI analyzes your goal and creates a detailed, step-by-step roadmap.',
            stepNumber: '02'
        },
        {
            title: 'Track Progress',
            description: 'Follow the interactive roadmap and mark steps complete as you go.',
            stepNumber: '03'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-12 w-full max-w-7xl mx-auto px-4 md:px-0">
            {steps.map((step, idx) => (
                <div key={idx} className="h-[320px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full relative">
                    <ParticleCard {...step} />
                </div>
            ))}
        </div>
    );
};

export default AntigravityCards;
