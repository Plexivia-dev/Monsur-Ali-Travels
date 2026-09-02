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

        {/* About Section */}
        <section id="about" className="py-24 bg-white border-b border-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  About Monsur Ali Travels
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mt-4 mb-6 leading-tight">
                  Your Trusted Partner in Global Travel, Visa & Pilgrimage Logistics
                </h2>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                  Founded with a mission to deliver transparent, reliable, and premium travel consultancy, Monsur Ali Travels provides full-spectrum services ranging from corporate ticketing and manpower mobility to sacred Hajj & Umrah pilgrimages.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h3 className="text-2xl font-bold text-[#0A2540]">100%</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Digital Transparency & QR Verification</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h3 className="text-2xl font-bold text-emerald-600">24/7</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Dedicated Passenger Support</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0A2540] to-[#12385e] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <h3 className="text-xl font-bold mb-4 text-emerald-300">Why Choose Us?</h3>
                <ul className="space-y-4 text-sm text-gray-200">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                    <span><strong>Government Authorized & Certified:</strong> Full compliance with international travel regulations and embassy attestations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                    <span><strong>End-to-End Visa Security:</strong> Direct embassy liaison with automated tracking and instant digital money receipts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                    <span><strong>Customized Itineraries:</strong> Tailored flight routes, VIP hotel arrangements, and smooth airport assistance.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
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
