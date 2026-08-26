import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[95vh] flex items-center pt-24 bg-[#0A2540] overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-900/30 blur-[120px]" />
        <div className="absolute top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-sm mb-8 border border-emerald-500/20 tracking-wide">
              TRUSTED CORPORATE & PERSONAL TRAVEL
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8">
              Your Journey,<br />
              <span className="text-emerald-400">Perfectly Managed.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
              Specializing in premium Air Tickets, comprehensive Hajj & Umrah packages, seamless Visa Processing, and Custom Corporate Tours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-900/20"
              >
                Plan Your Trip
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={scrollToServices}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-semibold transition-all"
              >
                Explore Services
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
        <span className="text-sm font-medium tracking-widest">SCROLL</span>
        <div className="w-[1px] h-8 bg-white/30" />
      </div>
    </section>
  );
}
