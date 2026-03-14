import Logo from './Logo'

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-950 border-t border-white/5 relative overflow-hidden">
      {/* Decorative background element for a premium feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <Logo />
            </div>
            <p className="text-slate-400/90 text-lg leading-relaxed mb-6 max-w-md font-medium tracking-tight hover:text-slate-300 transition-colors duration-500">
              Create personalized learning roadmaps with <span className="text-white font-semibold">AI</span>. 
              Transform your goals into actionable <span className="text-indigo-400">step-by-step</span> guides powered by LevelUp Map.
            </p>
            <div className="flex gap-4">
              <a href="mailto:levelupmap121@gmail.com" className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all duration-300 icon-bounce shadow-lg" title="Email Us">
                <i className="fa-solid fa-envelope text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold font-outfit tracking-[0.15em] uppercase text-[12px] opacity-60 mb-8">
              Quick Navigation
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Home', id: 'home' },
                { label: 'Generator', id: 'generator' },
                { label: 'About Us', id: 'about' },
                { label: 'Contact', id: 'contact' }
              ].map((item) => (
                <li key={item.id}>
                  <button 
                    onClick={() => onNavigate(item.id)} 
                    className="group text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 text-[17px] font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                    <span className="underline-slide">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold font-outfit tracking-[0.14em] uppercase text-[12px] opacity-50 mb-8">
              Get in Touch
            </h4>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-slate-400 group cursor-default">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shadow-sm">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </div>
                <span className="text-[17px] font-semibold group-hover:text-slate-200 transition-colors">levelupmap121@gmail.com</span>
              </li>
              <li className="flex items-center gap-4 text-slate-400 group cursor-default">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shadow-sm">
                  <i className="fa-solid fa-location-dot text-sm"></i>
                </div>
                <span className="text-[17px] font-semibold group-hover:text-slate-200 transition-colors">Taraz, Kazakhstan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © 2026 <span className="text-slate-400">LevelUp Map</span>. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm">
            <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors duration-300 underline-slide font-medium">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors duration-300 underline-slide font-medium">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


