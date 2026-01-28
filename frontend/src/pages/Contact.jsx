import { useState } from 'react'
import Footer from '../components/Footer'

export default function Contact({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate form submission
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const contactInfo = [
    {
      icon: 'fa-envelope',
      title: 'Email',
      value: 'hello@roadmapai.com',
      link: 'mailto:hello@roadmapai.com'
    },
    {
      icon: 'fa-phone',
      title: 'Phone',
      value: '+7 (700) 123-4567',
      link: 'tel:+77001234567'
    },
    {
      icon: 'fa-location-dot',
      title: 'Location',
      value: 'Astana, Kazakhstan',
      link: '#'
    }
  ]

  const faqs = [
    {
      question: 'Is RoadmapAI free to use?',
      answer: 'Yes! RoadmapAI is completely free to use. We believe everyone should have access to personalized learning paths.'
    },
    {
      question: 'What languages are supported?',
      answer: 'Our AI supports over 50 languages. Simply write your goal in your preferred language, and the AI will respond in the same language.'
    },
    {
      question: 'Can I save my roadmaps?',
      answer: 'Currently, roadmaps are generated in real-time. We\'re working on adding save and export features in future updates.'
    },
    {
      question: 'How accurate are the roadmaps?',
      answer: 'Our AI generates comprehensive roadmaps based on best practices and industry standards. However, we recommend using them as a guide and adapting to your specific situation.'
    }
  ]

  return (
    <div className="page-container min-h-screen">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-8 sm:px-12 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <i className="fa-solid fa-headset"></i>
            <span>Get In Touch</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6">
            We'd Love to
            <span className="block mt-2 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Hear From You
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Have a question, suggestion, or just want to say hello? We're here to help!
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-8 sm:py-10 lg:py-12 px-8 sm:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
                  <i className={`fa-solid ${info.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                <p className="text-slate-400">{info.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12 sm:py-16 lg:py-20 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <i className="fa-solid fa-paper-plane text-indigo-400"></i>
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-check text-green-400 text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400">Thank you for reaching out. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Your Name
                      </label>
                      <div className="relative">
                        <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-tag absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <div className="relative">
                      <i className="fa-solid fa-message absolute left-4 top-4 text-slate-500"></i>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <i className="fa-solid fa-circle-question text-indigo-400"></i>
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/20 transition-all"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-start gap-3">
                      <i className="fa-solid fa-q text-indigo-400 mt-1"></i>
                      {faq.question}
                    </h3>
                    <p className="text-slate-400 pl-7">{faq.answer}</p>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8 p-6 rounded-2xl bg-linear-to-r from-indigo-600/10 to-purple-600/10 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-indigo-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                    <i className="fa-brands fa-twitter text-xl"></i>
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-indigo-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                    <i className="fa-brands fa-github text-xl"></i>
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-indigo-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                    <i className="fa-brands fa-linkedin text-xl"></i>
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-indigo-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                    <i className="fa-brands fa-discord text-xl"></i>
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-indigo-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                    <i className="fa-brands fa-telegram text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
