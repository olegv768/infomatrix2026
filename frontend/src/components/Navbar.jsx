import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function Navbar({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home', icon: 'fa-house' },
    { id: 'generator', label: 'Generator', icon: 'fa-route' },
    { id: 'history', label: 'History', icon: 'fa-clock-rotate-left' },
    { id: 'about', label: 'About Us', icon: 'fa-users' },
    { id: 'contact', label: 'Contact', icon: 'fa-envelope' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center group"
          >
            <Logo className="scale-90 origin-left" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 icon-bounce underline-slide ${currentPage === item.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <i className={`fa-solid ${item.icon} text-sm transition-transform`}></i>
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative group p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl transition-all active:scale-90"
          >
            {/* Ambient Glow */}
            <div className={`absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></div>

            <div className="relative w-7 h-5 flex flex-col justify-between items-center overflow-hidden">
              <span className={`w-full h-1 bg-white rounded-full transform transition-all duration-500 ease-spring ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-full h-1 bg-white rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 -translate-x-full' : ''}`}></span>
              <span className={`w-full h-1 bg-white rounded-full transform transition-all duration-500 ease-spring ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-white/10 bg-slate-900/98 backdrop-blur-3xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-3">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-4 text-lg ${currentPage === item.id
                    ? 'bg-linear-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                    : 'text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentPage === item.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-slate-400'}`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
