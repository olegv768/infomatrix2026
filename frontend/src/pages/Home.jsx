import Footer from '../components/Footer'

export default function Home({ onNavigate }) {
  const features = [
    {
      icon: 'fa-brain',
      title: 'AI-Powered',
      description: 'Advanced AI analyzes your goals and creates personalized, actionable roadmaps tailored to your needs.'
    },
    {
      icon: 'fa-route',
      title: 'Visual Roadmaps',
      description: 'Interactive graph visualization helps you see the complete journey from start to finish.'
    },
    {
      icon: 'fa-language',
      title: 'Multi-Language',
      description: 'Write your goals in any language - our AI responds in your preferred language automatically.'
    },
    {
      icon: 'fa-clock',
      title: 'Time Estimates',
      description: 'Get realistic time estimates for each step to plan your learning journey effectively.'
    },
    {
      icon: 'fa-check-double',
      title: 'Progress Tracking',
      description: 'Mark steps as complete and track your progress visually as you advance.'
    },
    {
      icon: 'fa-infinity',
      title: 'Unlimited Goals',
      description: 'Create roadmaps for any goal - from learning programming to starting a business.'
    }
  ]

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="page-container min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ paddingTop: '0px', paddingBottom: '10px', paddingLeft: 'clamp(32px, 8vw, 96px)', paddingRight: 'clamp(32px, 8vw, 96px)' }}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-indigo-500/30"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-8 animate-fade-in-up">
            <i className="fa-solid fa-sparkles"></i>
            <span>Powered by Google Gemini AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Transform Your Goals Into
            <span className="block mt-2 bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Actionable Roadmaps
            </span>
          </h1>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="relative"
        style={{ padding: 'clamp(80px, 10vw, 112px) clamp(32px, 8vw, 80px)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 mt-16">
            <h2 className="text-4xl font-bold text-white mb-4"
              style={{ paddingBottom: '40px' }}>Why Choose RoadmapAI?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-500 group flex flex-col items-center text-center h-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-500 group-hover:-translate-y-1">
                  <i className={`fa-solid ${feature.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="bg-linear-to-b from-transparent via-indigo-950/20 to-transparent"
        style={{ padding: 'clamp(80px, 10vw, 112px) clamp(32px, 8vw, 80px)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to your personalized roadmap</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: 1, icon: 'fa-pen', title: 'Enter Your Goal', desc: 'Type your goal in any language - career change, new skill, or project idea.' },
              { step: 2, icon: 'fa-wand-magic-sparkles', title: 'AI Generates', desc: 'Our AI analyzes your goal and creates a detailed, step-by-step roadmap.' },
              { step: 3, icon: 'fa-chart-line', title: 'Track Progress', desc: 'Follow the interactive roadmap and mark steps complete as you go.' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20 transition-transform duration-500 group-hover:scale-105">
                  <i className={`fa-solid ${item.icon} text-white text-3xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
