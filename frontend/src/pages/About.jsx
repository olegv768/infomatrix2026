import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'
import FeatureCard from '../components/FeatureCard'
import { useState, useEffect } from 'react'

const TeamMember = ({ member, delay }) => {
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
          className={`p-6 rounded-2xl transition-all duration-500 text-center group flex flex-col items-center h-full hover-lift cursor-pointer ${
            isHovered ? 'bg-violet-400/20 border-violet-400/30 shadow-xl shadow-violet-500/10' : 'bg-white/5 border-white/10'
          } border`}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          onClick={() => setIsHovered(!isHovered)}
        >
          <div className="relative inline-block mb-4">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-500 ${
                isHovered ? 'border-indigo-500 scale-105 shadow-xl shadow-indigo-500/20' : 'border-indigo-500/30'
            }`}>
              <img
                src={member.image}
                alt={member.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : ''}`}
                style={member.style || {}}
              />
            </div>
            {isHovered && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center animate-bounce-short">
                    <i className="fa-solid fa-check text-white text-xs"></i>
                </div>
            )}
          </div>
          <h3 className={`text-xl font-semibold transition-colors ${isHovered ? 'text-white' : 'text-slate-200'}`}>{member.name}</h3>
          <p className="text-indigo-400 mb-2">{member.role}</p>
          <p className={`text-sm mb-4 transition-colors ${isHovered ? 'text-slate-200' : 'text-slate-400'}`}>{member.bio}</p>
        </div>
      </ScrollReveal>
    );
};

export default function About({ onNavigate }) {
  const team = [
    {
      name: 'Aslan Abdulayev',
      role: 'Full-stack developer',
      image: 'Aslan.jpg',
      bio: 'He love for clean code. The website works because of its code.'
    },
    {
      name: 'Oleg Volosov',
      role: 'Frontend developer / D3.js',
      image: 'Oleg_v2.png',
      bio: 'Invented the roadmap and fully built the entire visual part of the website.'
    },
    {
      name: 'Danial Kabylkan',
      role: 'Frontend/Web3',
      image: 'Danial.jpg',
      bio: 'React, Node.js, Solana. 2nd place at Solana Day, sponsored by Decentrathon.'
    }
  ]

  const values = [
    {
      icon: 'fa-lightbulb',
      title: 'Innovation',
      description: 'We constantly push boundaries to deliver cutting-edge AI solutions that make learning accessible to everyone.'
    },
    {
      icon: 'fa-users',
      title: 'Community',
      description: 'We believe in the power of community and strive to create tools that bring people together on their learning journeys.'
    },
    {
      icon: 'fa-shield-halved',
      title: 'Trust',
      description: 'Privacy and security are at the core of everything we build. Your data is safe with us.'
    },
    {
      icon: 'fa-heart',
      title: 'Passion',
      description: 'We are passionate about education and believe everyone deserves access to personalized learning paths.'
    }
  ]

  return (
    <div className="page-container min-h-full">
      {/* Hero Section */}
      <section 
        className="flex items-center justify-center px-8 sm:px-12 lg:px-20 relative overflow-hidden"
        style={{ minHeight: 'calc(var(--vh, 1vh) * 60)' }}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              <i className="fa-solid fa-info-circle"></i>
              <span>About LevelUp Map</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-['Outfit'] tracking-tight title-reaction">
              Empowering Your Learning
              <span className="block mt-2 text-shimmer">
                Journey With AI
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We're on a mission to democratize education by providing intelligent, personalized roadmaps for any learning goal.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-32 sm:py-48 lg:py-64 px-8 sm:px-12 lg:px-20 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center flex flex-col items-center">
            <ScrollReveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight font-['Plus_Jakarta_Sans']">Our Story</h2>
            </ScrollReveal>
            <div className="space-y-6 text-slate-400 text-lg max-w-3xl text-center mx-auto">
              <ScrollReveal delay={200}>
                <p>
                  LevelUp Map was born from a simple observation: too many people give up on their goals because they don't know where to start or how to progress.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={300}>
                <p>
                  Founded in Taraz, Kazakhstan, we set out to create a tool that would make learning pathways clear and achievable for everyone, regardless of their background or experience level.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={400}>
                <p>
                  By combining the power of Google's Gemini AI with intuitive visualization, we've created a platform that turns ambitious goals into actionable, step-by-step plans.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-32 sm:py-48 lg:py-64 px-8 sm:px-12 lg:px-20 flex items-center justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="h-[70px]"></div> {/* Explicit 70px gap from top */}
          <div className="text-center">
            <ScrollReveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight font-['Plus_Jakarta_Sans']">Our Values</h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-slate-400 text-lg">The principles that guide everything we do</p>
            </ScrollReveal>
          </div>
          <div style={{ height: '35px' }}></div> {/* Forced spacing of 35px */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <FeatureCard 
                key={index}
                {...value}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 sm:py-48 lg:py-64 px-8 sm:px-12 lg:px-20 flex items-center justify-center">
        <div className="max-w-7xl mx-auto">
          <div style={{ height: '45px' }}></div> {/* Forced spacing of 45px from top */}
          <div className="text-center">
            <ScrollReveal>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight font-['Plus_Jakarta_Sans']">Meet Our Team</h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-slate-400 text-lg">The passionate people behind LevelUp Map</p>
            </ScrollReveal>
          </div>
          <div style={{ height: '35px' }}></div> {/* Forced spacing of 35px */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <TeamMember key={index} member={member} delay={index * 150} />
            ))}
          </div>
        </div>
      </section>



      {/* Spacer */}
      <div className="h-[170px]"></div>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
