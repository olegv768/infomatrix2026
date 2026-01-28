import Footer from '../components/Footer'

export default function About({ onNavigate }) {
  const team = [
    {
      name: 'Aslan Abdulayev',
      role: 'Full-stack developer',
      image: 'Aslan.jpg',
      bio: 'He love for clean code. The website works because of its code.',
      social: { twitter: '#', linkedin: '#', github: '#' }
    },
    {
      name: 'Oleg Volosov',
      role: 'Frontend developer',
      image: 'Oleg.jpg',
      bio: 'He made a roadmap and the entire website looks great.',
      social: { twitter: '#', linkedin: '#', github: '#' }
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
    <div className="page-container min-h-screen">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-8 sm:px-12 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <i className="fa-solid fa-info-circle"></i>
            <span>About RoadmapAI</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6">
            Empowering Your Learning
            <span className="block mt-2 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Journey With AI
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            We're on a mission to democratize education by providing intelligent, personalized roadmaps for any learning goal.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 lg:py-24 px-8 sm:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-400 text-lg max-w-3xl">
              <p>
                RoadmapAI was born from a simple observation: too many people give up on their goals because they don't know where to start or how to progress.
              </p>
              <p>
                Founded in Astana, Kazakhstan, we set out to create a tool that would make learning pathways clear and achievable for everyone, regardless of their background or experience level.
              </p>
              <p>
                By combining the power of Google's Gemini AI with intuitive visualization, we've created a platform that turns ambitious goals into actionable, step-by-step plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-20 lg:py-24 px-8 sm:px-12 lg:px-20 bg-linear-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-slate-400 text-lg">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all text-center group flex flex-col items-center h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
                  <i className={`fa-solid ${value.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-slate-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-slate-400 text-lg">The passionate people behind RoadmapAI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/20 transition-all text-center group flex flex-col items-center h-full"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/30 group-hover:border-indigo-500 transition-all"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center">
                    <i className="fa-solid fa-check text-white text-xs"></i>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                <p className="text-indigo-400 mb-2">{member.role}</p>
                <p className="text-slate-400 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a href={member.social.twitter} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all">
                    <i className="fa-brands fa-twitter text-sm"></i>
                  </a>
                  <a href={member.social.linkedin} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all">
                    <i className="fa-brands fa-linkedin text-sm"></i>
                  </a>
                  <a href={member.social.github} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all">
                    <i className="fa-brands fa-github text-sm"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-8 sm:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Journey</h2>
          <p className="text-slate-400 text-lg mb-8">
            Be part of the revolution in personalized learning. Start creating your roadmap today.
          </p>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
