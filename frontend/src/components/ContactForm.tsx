import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [mountTime, setMountTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    setMountTime(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const honeypotUrl = formData.get('website_url_hp');
    const honeypotPhone = formData.get('phone_hp');
    
    // 1. Honeypot check: If bots fill out hidden fields
    if (honeypotUrl || honeypotPhone) {
      // Silently fake success for bots to prevent retries
      setTimeout(() => setStatus('success'), 1000);
      return;
    }

    // 2. Timing check (prevent instantaneous automated bot script submissions)
    const submitTime = Date.now();
    if (submitTime - mountTime < 500 && !honeypotUrl && !honeypotPhone) {
      setTimeout(() => setStatus('success'), 600); // Fake success for sub-500ms bot scripts
      return;
    }

    // 3. Rate limiting (simple localStorage cooldown)
    const lastSubmit = localStorage.getItem('lastFormSubmit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 60000) {
      setStatus('error');
      setErrorMessage('Please wait a minute before submitting again.');
      return;
    }

    // Real API Call to Backend
    const apiBase = import.meta.env.VITE_API_URL || 'https://api.monsuralitravels.com';
    try {
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        service: formData.get('service'),
        message: formData.get('message'),
        website_url_hp: honeypotUrl,
        phone_hp: honeypotPhone,
      };

      const res = await fetch(`${apiBase}/api/v1/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }

      localStorage.setItem('lastFormSubmit', Date.now().toString());
      setStatus('success');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full mx-auto border border-gray-100">
      <h3 className="text-2xl font-bold text-[#0A2540] mb-6">Send us an Inquiry</h3>
      
      {status === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-800 p-8 rounded-xl flex flex-col items-center text-center gap-4"
        >
          <CheckCircle className="w-14 h-14 text-emerald-500" />
          <div>
            <h4 className="font-semibold text-xl">Inquiry Sent Successfully!</h4>
            <p className="text-emerald-700 mt-2">Our travel experts will get back to you shortly at contact@monsuralitravels.com.</p>
          </div>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-6 text-emerald-700 font-medium hover:text-emerald-800 underline underline-offset-4"
          >
            Send another inquiry
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot Fields - CRITICAL Anti-Spam (Not visible, out of tab order) */}
          <div className="opacity-0 absolute pointer-events-none -z-50 h-0 w-0 overflow-hidden" aria-hidden="true">
            <input type="text" name="website_url_hp" tabIndex={-1} autoComplete="off" />
            <input type="text" name="phone_hp" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
              <input 
                required
                type="text" 
                id="name" 
                name="name" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                required
                type="email" 
                id="email" 
                name="email" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="service" className="text-sm font-medium text-gray-700">Service Requested</label>
            <select 
              id="service" 
              name="service" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow bg-white"
            >
              <option value="air-tickets">Air Tickets</option>
              <option value="hajj-umrah">Hajj & Umrah</option>
              <option value="visa-processing">Visa Processing</option>
              <option value="custom-tours">Custom Tours</option>
              <option value="other">Other Inquiry</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
            <textarea 
              required
              id="message" 
              name="message" 
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"
              placeholder="How can we help you plan your journey?"
            ></textarea>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 p-4 rounded-lg text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Simulated Captcha container */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <input type="checkbox" required id="captcha-mock" className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <label htmlFor="captcha-mock" className="text-sm font-medium text-gray-700">I am human (Protected by reCAPTCHA)</label>
            </div>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA logo" className="w-8 opacity-50 drop-shadow-sm" />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-[#0A2540] hover:bg-[#113a63] text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Inquiry...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Inquiry
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
