import React, { useEffect, useRef } from 'react';

const InteractiveHero = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        const mouse = {
            x: null,
            y: null,
            radius: 120, // Slightly smaller base radius for mobile
            pressed: false
        };

        let lastWidth = window.innerWidth;
        
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile && window.innerWidth === lastWidth && canvas.width > 0) {
                return;
            }
            lastWidth = window.innerWidth;
            
            // Get actual dimensions of the parent section
            if (canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            init();
        };

        const updateMousePosition = (x, y) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = x - rect.left;
            mouse.y = y - rect.top;
        };

        const handleMouseMove = (event) => {
            updateMousePosition(event.clientX, event.clientY);
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        const handleMouseDown = () => { mouse.pressed = true; };
        const handleMouseUp = () => { mouse.pressed = false; };

        const handleTouchStart = (e) => {
            mouse.pressed = true;
            if (e.touches && e.touches[0]) {
                updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleTouchEnd = () => {
            mouse.pressed = false;
            mouse.x = null;
            mouse.y = null;
        };

        // Add listeners to window to capture events everywhere
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        class Particle {
            constructor(x, y, dx, dy, size, layer) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.size = size;
                this.layer = layer; // 1 (closer) to 3 (background)

                // Physics constants
                this.density = (Math.random() * 20) + 15;
                this.friction = 0.98;
                this.velocity = { x: 0, y: 0 };

                // Colors components for robust calculation
                const opacities = [0.6, 0.4, 0.2];
                this.baseOpacity = opacities[layer - 1];
                this.baseColor = layer === 1 ? '165, 180, 252' : '226, 232, 240';
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                
                // Twinkle effect
                const flicker = Math.random() > 0.98 ? (Math.random() * 0.3) : 0;
                const alpha = Math.max(0.1, this.baseOpacity + flicker);
                ctx.fillStyle = `rgba(${this.baseColor}, ${alpha})`;

                // Bloom only on layer 1
                if (this.layer === 1) {
                    ctx.shadowBlur = window.innerWidth < 768 ? 4 : 8;
                    ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fill();
            }

            update() {
                const speedMult = (4 - this.layer) * 0.4;
                this.x += this.dx * speedMult + this.velocity.x;
                this.y += this.dy * speedMult + this.velocity.y;

                this.velocity.x *= this.friction;
                this.velocity.y *= this.friction;

                // Infinite Wrap
                const margin = 50;
                if (this.x > canvas.width + margin) this.x = -margin;
                else if (this.x < -margin) this.x = canvas.width + margin;
                if (this.y > canvas.height + margin) this.y = -margin;
                else if (this.y < -margin) this.y = canvas.height + margin;

                // Interaction
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    const baseRadius = window.innerWidth < 768 ? 120 : 200;
                    const interactionRadius = mouse.pressed ? baseRadius * 1.6 : baseRadius;

                    if (distance < interactionRadius) {
                        const force = (interactionRadius - distance) / interactionRadius;
                        const directionX = dx / distance;
                        const directionY = dy / distance;

                        const pushStrength = mouse.pressed ? 2.8 : 1.2;
                        this.velocity.x -= directionX * force * this.density * 0.04 * pushStrength;
                        this.velocity.y -= directionY * force * this.density * 0.04 * pushStrength;
                    }
                }

                this.draw();
            }
        }

        const init = () => {
            particles = [];
            const area = canvas.width * canvas.height;
            const isMobile = window.innerWidth < 768;
            
            // Adjust count based on area to ensure full coverage
            let count = Math.floor(area / 7000);
            const finalCount = Math.min(count, isMobile ? 120 : 350);

            for (let i = 0; i < finalCount; i++) {
                const layer = Math.floor(Math.random() * 3) + 1;
                const size = (4 - layer) * (Math.random() * 1.2 + (isMobile ? 0.8 : 0.6));
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const dx = (Math.random() * 0.5) - 0.25;
                const dy = (Math.random() * 0.5) - 0.25;

                particles.push(new Particle(x, y, dx, dy, size, layer));
            }
        };

        const drawConnectors = () => {
            const isMobile = window.innerWidth < 768;
            const threshold = (canvas.width / 8) * (canvas.height / 8);
            
            ctx.shadowBlur = 0;

            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    if (Math.abs(particles[a].layer - particles[b].layer) > 1) continue;

                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = dx * dx + dy * dy;

                    if (distance < threshold) {
                        let opacity = (1 - (distance / threshold)) * 0.12;
                        
                        if (isMobile) {
                            if (distance > threshold * 0.5) continue;
                            opacity *= 0.4;
                        }

                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = particles[a].x - mouse.x;
                    let dy = particles[a].y - mouse.y;
                    let distance = dx * dx + dy * dy;
                    const baseRadius = isMobile ? 120 : 200;
                    let mouseLimit = baseRadius * baseRadius;

                    if (distance < mouseLimit) {
                        let opacity = (1 - (distance / mouseLimit)) * 0.2;
                        ctx.strokeStyle = `rgba(165, 180, 252, ${opacity / particles[a].layer})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        };

        const drawScene = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Bloom
            if (mouse.x !== null && mouse.y !== null) {
                const isMobile = window.innerWidth < 768;
                const baseRadius = isMobile ? 120 : 200;
                const glowSize = mouse.pressed ? baseRadius * 3.5 : baseRadius * 2;
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowSize);
                
                const baseOpacity = isMobile ? 0.06 : 0.1;
                const pressOpacity = isMobile ? 0.1 : 0.15;
                
                gradient.addColorStop(0, mouse.pressed ? `rgba(79, 70, 229, ${pressOpacity})` : `rgba(99, 102, 241, ${baseOpacity})`);
                gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }

            drawConnectors();
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            drawScene();
        };

        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                mixBlendMode: 'screen',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                willChange: 'transform'
            }}
        />
    );
};

export default InteractiveHero;

