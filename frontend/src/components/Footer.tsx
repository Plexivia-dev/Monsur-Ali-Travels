import React from 'react';
import { Plane, MapPin, Phone } from 'lucide-react';
import { EmailObfuscator } from './EmailObfuscator';

export function Footer() {
  return (
    <footer className="bg-[#0A2540] text-gray-300 py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-5 space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Monsur Ali Travels
            </span>
          </div>
          <p className="text-gray-400 max-w-sm leading-relaxed text-lg">
            Delivering excellence in corporate travel, Hajj & Umrah, and custom global journeys since our inception.
          </p>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-white font-bold text-lg mb-8 tracking-wide">Contact Information</h4>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">Mominpur Jagannathpur Road,<br/>Sunamganj, Post Code 3060, Bangladesh</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="w-6 h-6 text-emerald-500 shrink-0" />
              <span className="font-medium">+880 1345-579534</span>
            </li>
            <li>
              <EmailObfuscator />
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-white font-bold text-lg mb-8 tracking-wide">Quick Links</h4>
          <ul className="space-y-4 font-medium">
            <li><a href="#services" className="hover:text-emerald-400 transition-colors">Our Services</a></li>
            <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Monsur Ali Travels. All rights reserved.</p>
        <p>Built securely for production.</p>
      </div>
    </footer>
  );
}
