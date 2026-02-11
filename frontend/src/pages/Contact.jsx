import { useState } from 'react'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'

export default function Contact({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Используем бесплатный сервис FormSubmit (не требует настройки бэкенда)
      const apiUrl = 'https://formsubmit.co/ajax/levelupmap121@gmail.com';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `New Message: ${formData.subject}`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message')
      }

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })

      // Keep success message for 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }





  return (
    <div className="page-container min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center justify-center px-8 sm:px-12 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] animate-float" style={{ animationDuration: '18s' }}></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              <i className="fa-solid fa-headset"></i>
              <span>Get In Touch</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">
              We'd Love to
              <span className="block mt-4 text-shimmer">
                Hear From You
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Have a question, suggestion, or just want to say hello? We're here to help!
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="pt-10 sm:pt-16 lg:pt-20 px-8 sm:px-12 lg:px-20 flex flex-col items-center relative overflow-hidden">
        {/* Decorative background elements for the form section */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-[140px] -z-10 animate-float" style={{ animationDuration: '22s', animationDelay: '-4s' }}></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-purple-600/5 rounded-full blur-[140px] -z-10 animate-float" style={{ animationDuration: '25s', animationDelay: '-8s' }}></div>

        <div className="max-w-4xl w-full mx-auto relative group">
          {/* Decorative Gradient Border Wrapper */}
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-4xl blur-sm opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          {/* Contact Form Container */}
          <div className="relative p-8 sm:p-12 lg:p-16 rounded-4xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl glow-border-subtle">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-white mb-10 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <i className="fa-solid fa-paper-plane text-white text-xl"></i>
                </div>
                Send Us a Message
              </h2>
            </ScrollReveal>

            {submitted ? (
              <div className="text-center py-10 sm:py-24 animate-scale-in relative w-full flex items-center justify-center overflow-visible">
                {/* Advanced Cosmic Success Scene */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full">

                  {/* Central Glow Node Assembly */}
                  <div className="relative w-40 h-40 sm:w-56 sm:h-56 mb-16 group flex items-center justify-center">

                    {/* Multi-layered Spherical Glows */}
                    <div className="absolute inset-0 rounded-full bg-green-500/10 blur-3xl animate-pulse"></div>
                    <div className="absolute -inset-10 rounded-full bg-indigo-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                    {/* Orbital Satellites - Node-like elements floating around */}
                    <div className="absolute inset-[-40%] animate-[spin_12s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] border border-white/20"></div>
                    </div>
                    <div className="absolute inset-[-60%] animate-[spin_18s_linear_infinite_reverse]">
                      <div className="absolute top-1/4 right-0 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)] border border-white/20"></div>
                    </div>
                    <div className="absolute inset-[-30%] animate-[spin_25s_linear_infinite]">
                      <div className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] border border-white/20"></div>
                    </div>

                    {/* SVG Orbital Complex */}
                    <svg className="absolute inset-x-[-80%] inset-y-[-80%] w-[260%] h-[260%] pointer-events-none overflow-visible opacity-40" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="url(#cosmicGrad1)" strokeWidth="0.5" strokeDasharray="1,6" className="animate-[spin_40s_linear_infinite]" />
                      <circle cx="100" cy="100" r="75" fill="none" stroke="url(#cosmicGrad2)" strokeWidth="1" strokeDasharray="10,20" className="animate-[spin_30s_linear_infinite_reverse]" />
                      <circle cx="100" cy="100" r="60" fill="none" stroke="#10b981" strokeWidth="0.2" strokeOpacity="0.3" />
                      <defs>
                        <linearGradient id="cosmicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <linearGradient id="cosmicGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* The Core Node */}
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-green-400 via-emerald-500 to-indigo-600 p-1.5 shadow-[0_0_60px_rgba(16,185,129,0.5)] transform group-hover:scale-105 transition-all duration-700 hover:rotate-6">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden ring-1 ring-white/10">
                        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/20 via-transparent to-transparent"></div>

                        {/* 3D Reflection Surface */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-white/10 to-transparent"></div>

                        <i className="fa-solid fa-check text-green-400 text-6xl sm:text-7xl relative z-10 animate-bounce-in drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"></i>

                        {/* Internal Sparkles */}
                        <div className="absolute inset-0">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute bg-white rounded-full animate-pulse"
                              style={{
                                width: Math.random() * 2 + 1 + 'px',
                                height: Math.random() * 2 + 1 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                animationDelay: Math.random() * 2 + 's',
                                opacity: Math.random() * 0.5 + 0.2
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Typography */}
                  <div className="space-y-8 flex flex-col items-center text-center w-full relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-10 bg-linear-to-b from-transparent via-green-500/50 to-transparent"></div>

                    <div className="space-y-2">
                      <span className="text-green-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Connection Established</span>
                      <h3 className="text-5xl sm:text-7xl font-black text-white tracking-tighter text-center leading-[1.1]">
                        Data Transmission
                        <span className="block text-shimmer bg-linear-to-r from-green-400 via-emerald-400 to-indigo-400">Complete</span>
                      </h3>
                    </div>

                    <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed text-center font-medium">
                      Your message has been successfully beamed through the digital ether.
                      Our team will decipher the signal and respond within one solar cycle.
                    </p>
                  </div>

                  {/* Advanced Navigation Button */}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="group mt-16 relative p-px rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-green-500 animate-gradient-shift opacity-50 group-hover:opacity-100"></div>
                    <div className="relative px-10 py-4 bg-slate-900 rounded-[15px] flex items-center gap-3 text-white font-bold tracking-wide transition-colors group-hover:bg-slate-900/80">
                      <i className="fa-solid fa-redo-alt text-green-400 group-hover:rotate-180 transition-transform duration-700"></i>
                      <span>Send New Signal</span>
                    </div>
                  </button>
                </div>

                {/* Vast Background Nebula Gloom */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-green-500/5 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12 text-center">
                {error && (
                  <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-medium">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ScrollReveal delay={100} className="w-full">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">
                        Your Full Name
                      </label>
                      <div className="relative group/input">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-6 py-4 bg-slate-800/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-center focus:outline-none focus:border-indigo-500/50 transition-all duration-300 hover:bg-slate-800/60 input-glow disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                  <ScrollReveal delay={150} className="w-full">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">
                        Email Address
                      </label>
                      <div className="relative group/input">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-6 py-4 bg-slate-800/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-center focus:outline-none focus:border-indigo-500/50 transition-all duration-300 hover:bg-slate-800/60 input-glow disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                <ScrollReveal delay={200}>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">
                      Subject
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-6 py-4 bg-slate-800/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-center focus:outline-none focus:border-indigo-500/50 transition-all duration-300 hover:bg-slate-800/60 input-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="How can we help you?"
                      />
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={250}>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">
                      Your Message
                    </label>
                    <div className="relative group/input">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        rows={12}
                        className="w-full px-6 py-4 bg-slate-800/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-center focus:outline-none focus:border-indigo-500/50 transition-all duration-300 hover:bg-slate-800/60 resize-none input-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Type your message here..."
                      />
                    </div>
                  </div>
                </ScrollReveal>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-[200%_auto] hover:bg-right text-white font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all duration-500 flex items-center justify-center gap-3 mx-auto btn-shine disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Connected Nodes Section */}
      <section className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-48 lg:gap-24">

          {/* Node Pair 1: Community */}
          <div className="relative flex items-center justify-center h-[400px]">
            <svg className="absolute w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 400">
              {/* Path to Deep Paths */}
              <path
                d="M 200 200 Q 250 220 280 280"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-[dash_20s_linear_infinite]"
              />
              {/* Path to Accurate Answers */}
              <path
                d="M 200 200 Q 150 120 100 80"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                className="animate-[dash_15s_linear_infinite_reverse]"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            <div className="group relative z-20">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-40 h-40 rounded-full bg-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-500 shadow-2xl relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                  <i className="fa-solid fa-microchip text-2xl text-indigo-400"></i>
                </div>
                <span className="text-white font-bold text-sm tracking-widest uppercase">Precision</span>
              </div>
            </div>

            <div className="absolute top-[260px] left-[230px] group animate-float" style={{ animationDelay: '-2s' }}>
              <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center transform hover:rotate-6 transition-all animate-pulse-slow">
                <span className="text-purple-400 font-black text-lg mb-1 leading-tight">Deep Paths</span>
                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Unique Detailed Nodes</span>
              </div>
            </div>

            {/* NEW: Accurate Answers Circle */}
            <div className="absolute top-[30px] left-[30px] group animate-float" style={{ animationDelay: '-3s' }}>
              <div className="w-28 h-28 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center p-3 text-center transform hover:-rotate-12 transition-all animate-pulse-slow">
                <span className="text-indigo-400 font-black text-sm mb-1 leading-tight">Exact Answers</span>
                <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Tailored Per Request</span>
              </div>
            </div>
          </div>

          {/* Node Pair 2: Roadmaps */}
          <div className="relative flex items-center justify-center h-[400px]">
            <svg className="absolute w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 400">
              <path
                d="M 200 200 Q 150 180 120 120"
                fill="none"
                stroke="url(#gradient3)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-[dash_20s_linear_infinite]"
              />
              <defs>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            <div className="group relative z-20">
              <div className="absolute inset-0 bg-pink-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="w-40 h-40 rounded-full bg-slate-900 border border-pink-500/30 flex flex-col items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-500 shadow-2xl relative z-10">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-3 group-hover:bg-pink-500/20 transition-colors">
                  <i className="fa-solid fa-map text-2xl text-pink-400"></i>
                </div>
                <span className="text-white font-bold text-sm tracking-widest uppercase">Roadmaps</span>
              </div>
            </div>

            <div className="absolute top-[50px] left-[80px] group animate-float" style={{ animationDelay: '-1s' }}>
              <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center transform hover:rotate-12 transition-all animate-pulse-slow">
                <span className="text-pink-400 font-black text-lg mb-1 leading-tight">Any Topic</span>
                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Unlimited Subjects</span>
              </div>
            </div>
          </div>

          {/* Node Pair 3: Support */}
          <div className="relative flex items-center justify-center h-[400px]">
            <svg className="absolute w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 400">
              <path
                d="M 200 200 Q 230 190 240 180"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-[dash_20s_linear_infinite]"
              />
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            <div className="group relative z-20">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-40 h-40 rounded-full bg-slate-900 border border-purple-500/30 flex flex-col items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-500 shadow-2xl relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                  <i className="fa-solid fa-headset text-2xl text-purple-400"></i>
                </div>
                <span className="text-white font-bold text-sm tracking-widest uppercase">Support</span>
              </div>
            </div>

            <div className="absolute top-[120px] left-[180px] group animate-float" style={{ animationDelay: '-4s' }}>
              <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center transform hover:-rotate-6 transition-all animate-pulse-slow">
                <span className="text-cyan-400 font-black text-xl mb-1">&lt; 2h</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Response Time</span>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes dash {
            to {
              stroke-dashoffset: -100;
            }
          }
        `}} />
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
