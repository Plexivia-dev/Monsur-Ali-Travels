import React, { useState, useEffect } from 'react';
import { Plane, Menu, X } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-lg shadow-sm">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-[#0A2540]' : 'text-white'}`}>
            Monsur Ali Travels
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#services" className={`text-sm font-semibold hover:text-emerald-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Services</a>
          <a href="#about" className={`text-sm font-semibold hover:text-emerald-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}>About Us</a>
          <button 
            onClick={scrollToContact}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Contact Us
          </button>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className={`w-6 h-6 ${isScrolled ? 'text-[#0A2540]' : 'text-white'}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isScrolled ? 'text-[#0A2540]' : 'text-white'}`} />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl py-4 px-4 flex flex-col gap-2 border-t border-gray-100">
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 font-semibold py-3 px-2 border-b border-gray-50 hover:bg-gray-50 rounded-md transition-colors">Services</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 font-semibold py-3 px-2 border-b border-gray-50 hover:bg-gray-50 rounded-md transition-colors">About Us</a>
          <button 
            onClick={scrollToContact}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-lg font-semibold w-full mt-4 transition-colors"
          >
            Contact Us
          </button>
        </div>
      )}
    </header>
  );
}
