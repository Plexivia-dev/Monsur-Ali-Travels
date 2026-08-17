import React from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { Services } from './Services';
import { ContactForm } from './ContactForm';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      
      <main>
        <Hero />
        <Services />
        
        {/* Contact Section */}
        <section id="contact" className="py-24 bg-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0A2540 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-8 leading-tight">Ready to start your journey?</h2>
                <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
                  Get in touch with our travel experts to plan your next corporate trip, process your visa securely, or arrange your customized Hajj & Umrah package.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6 text-[#0A2540] font-semibold p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 text-xl font-bold shrink-0">
                      1
                    </div>
                    <span className="text-lg">Submit your requirements securely</span>
                  </div>
                  <div className="flex items-center gap-6 text-[#0A2540] font-semibold p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 text-xl font-bold shrink-0">
                      2
                    </div>
                    <span className="text-lg">Receive a custom itinerary within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-6 text-[#0A2540] font-semibold p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 text-xl font-bold shrink-0">
                      3
                    </div>
                    <span className="text-lg">Enjoy a seamless travel experience</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:pl-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
