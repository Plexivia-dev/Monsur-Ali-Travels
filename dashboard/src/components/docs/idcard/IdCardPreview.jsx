import React from 'react';
import { User, MapPin, Phone, Mail, Globe, Plane, Award, Building2, Droplets } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

export function IdCardPreview({ cardData, frontRef, backRef }) {
  // Generate SVG QR code for verification URL
  const qrUrl = `https://www.monsuralitravels.com/verify?id=${cardData.idNumber || '123'}`;
  const qrSvg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-8 py-4">
      
      {/* FRONT SIDE CARD */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          📇 Front Side (সামনের অংশ)
        </span>
        <div
          ref={frontRef}
          id="id-card-front-canvas"
          className="w-[330px] h-[530px] bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between relative font-sans shrink-0 select-none"
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          {/* Lanyard Hole Punch */}
          <div className="w-12 h-2.5 rounded-full bg-slate-300 border border-slate-400 mx-auto mt-2.5 shrink-0" />

          {/* Card Top Brand Header */}
          <div className="px-5 pt-1 text-center shrink-0">
            {/* Logo Badge */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center p-1 shadow-md mb-1 relative border-2 border-amber-400 overflow-hidden">
                <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain p-0.5" />
              </div>

              <div className="text-[10px] font-bold text-slate-700 tracking-tighter uppercase leading-none">
                MONSUR ALI TRAVELS
              </div>
              <div className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                Recruitment & Travel Agency
              </div>
            </div>

            {/* Main Title */}
            <div className="mt-1.5 border-t border-b border-slate-200 py-1">
              <h2 className="text-base font-black tracking-tight text-slate-900 uppercase leading-none">
                MANSUR ALI
              </h2>
              <div className="text-[10px] font-extrabold tracking-widest text-sky-600 uppercase flex items-center justify-center gap-1 mt-0.5">
                <span className="w-3 h-0.5 bg-amber-500 rounded-full" />
                TOURS & TRAVELS
                <span className="w-3 h-0.5 bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Photo & Holder Name */}
          <div className="px-5 text-center flex flex-col items-center">
            {/* Photo Box */}
            <div className="w-32 h-36 rounded-2xl border-4 border-slate-900 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 my-1 relative">
              {cardData.photo ? (
                <img src={cardData.photo} alt={cardData.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-400" />
              )}
            </div>

            {/* Name Badge */}
            <div className="w-full bg-slate-900 text-white py-1.5 px-3 rounded-xl shadow-xs mt-1">
              <h3 className="text-xs font-black tracking-wide uppercase truncate">
                {cardData.fullName || 'MD HAKIMUL ISLAM'}
              </h3>
            </div>

            <div className="text-[10px] font-bold tracking-widest text-sky-600 uppercase mt-0.5">
              {cardData.role || 'EMPLOYEE'}
            </div>
          </div>

          {/* Key Details Table */}
          <div className="px-6 py-1 text-[11px] font-semibold text-slate-800 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 flex items-center gap-1.5 text-[10px]">
                <Award className="w-3 h-3 text-slate-700" /> Employee ID
              </span>
              <span className="font-bold text-slate-900 font-mono">: {cardData.idNumber || '123'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 flex items-center gap-1.5 text-[10px]">
                <User className="w-3 h-3 text-slate-700" /> Joining Date
              </span>
              <span className="font-bold text-slate-900 font-mono">: {cardData.joiningDate || '01-10-2025'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 flex items-center gap-1.5 text-[10px]">
                <Droplets className="w-3 h-3 text-rose-600" /> Blood Group
              </span>
              <span className="font-bold text-rose-600 font-bold">: {cardData.bloodGroup || 'B+'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 text-[10px]">
                <Phone className="w-3 h-3 text-slate-700" /> Contact Number
              </span>
              <span className="font-bold text-slate-900 font-mono">: {cardData.contactPhone || '0134557934'}</span>
            </div>
          </div>

          {/* Bottom Wave Footer */}
          <div className="bg-slate-900 text-white text-center py-2 px-3 text-[10px] italic font-medium flex items-center justify-center gap-1.5 shrink-0">
            <span>Your Trusted Travel Partner</span>
            <Plane className="w-3.5 h-3.5 text-sky-400 rotate-45" />
          </div>
        </div>
      </div>

      {/* BACK SIDE CARD */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          💳 Back Side (পেছনের অংশ)
        </span>
        <div
          ref={backRef}
          id="id-card-back-canvas"
          className="w-[330px] h-[530px] bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between relative font-sans shrink-0 select-none"
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          {/* Lanyard Hole Punch */}
          <div className="w-12 h-2.5 rounded-full bg-slate-300 border border-slate-400 mx-auto mt-2.5 shrink-0" />

          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-3.5 text-center shrink-0 relative overflow-hidden">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 border border-amber-400 overflow-hidden">
                <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black tracking-wider uppercase leading-none text-white">
                  MANSUR ALI
                </h3>
                <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                  TOURS & TRAVELS
                </div>
              </div>
            </div>
            <p className="text-[9px] text-sky-200 italic mt-1 font-medium">Your Trusted Travel Partner</p>
          </div>

          {/* Contact Details List */}
          <div className="px-5 py-2 space-y-2.5 text-[10px]">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[10px]">Address</span>
                <span className="text-slate-600 leading-tight block">
                  {cardData.address || 'Mominpur Jagannathpur Road, Sunamganj'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[10px]">Contact Number</span>
                <span className="text-slate-600 font-mono">{cardData.contactPhone || '0134557934'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[10px]">Email</span>
                <span className="text-slate-600 font-mono">{cardData.email || 'monsuralitravels@gmail.com'}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="px-5 py-1 text-[9px] text-slate-700 space-y-1">
            <h4 className="font-bold text-sky-700 uppercase tracking-wider text-[10px]">
              TERMS & CONDITIONS
            </h4>
            <ul className="space-y-0.5 list-disc pl-3 leading-tight">
              <li>This ID card is the property of Mansur Ali Tours & Travels.</li>
              <li>This card is non-transferable.</li>
              <li>This card must be worn at all times during working hours.</li>
              <li>If found, please return to the address or contact number above.</li>
            </ul>
          </div>

          {/* Signature & QR Code Block */}
          <div className="px-5 py-2 flex items-end justify-between border-t border-slate-100">
            <div className="text-center space-y-1">
              <div className="font-serif italic text-base font-bold text-slate-900 leading-none">
                M. Ali
              </div>
              <div className="border-b border-slate-900 w-28 mx-auto" />
              <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">
                Authorized Signature<br />Managing Director
              </div>
            </div>

            {/* QR Code Container */}
            <div className="w-16 h-16 border-2 border-slate-800 p-0.5 rounded-lg bg-white shrink-0 shadow-xs flex items-center justify-center">
              <img src={qrSvg} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Bottom Website Footer Bar */}
          <div className="bg-slate-900 text-white text-center py-1.5 px-3 text-[9px] font-mono tracking-wider flex items-center justify-center gap-1 shrink-0">
            <Globe className="w-3 h-3 text-sky-400" />
            <span>www.monsuralitravels.com</span>
          </div>

        </div>
      </div>

    </div>
  );
}
