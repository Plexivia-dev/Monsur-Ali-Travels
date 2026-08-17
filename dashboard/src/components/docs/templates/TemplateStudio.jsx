import React, { useState } from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { PassportRequirementTemplate } from './PassportRequirementTemplate';
import { IndianVisaRequirementTemplate } from './IndianVisaRequirementTemplate';
import { ManpowerChecklistTemplate } from './ManpowerChecklistTemplate';
import { Printer, FileCheck, Landmark, Plane, Download, Check } from 'lucide-react';

export function TemplateStudio() {
  const [activeTemplate, setActiveTemplate] = useState('passport'); // 'passport' | 'indian-visa' | 'manpower'

  const templates = [
    {
      id: 'passport',
      title: 'Required Files for Passport Submission',
      subtitle: 'পাসপোর্ট জমা ও নতুন আবেদনের প্রয়োজনীয় ফাইল',
      icon: FileCheck,
      badge: 'Passport Cell'
    },
    {
      id: 'indian-visa',
      title: 'Indian Visa Application Requirement',
      subtitle: 'ইন্ডিয়ান ভিসা আবেদনের প্রয়োজনীয় কাগজপত্র',
      icon: Landmark,
      badge: 'Visa Desk'
    },
    {
      id: 'manpower',
      title: 'Manpower & Flight Processing Checklist',
      subtitle: 'ম্যানপাওয়ার ও ফ্লাইট প্রসেসিং চেকলিস্ট',
      icon: Plane,
      badge: 'Manpower Desk'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let msg = '';
    if (activeTemplate === 'passport') {
      msg = `*📄 মুনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
        `*পাসপোর্ট জমা ও নতুন আবেদনের জন্য প্রয়োজনীয় কাগজপত্র*\n` +
        `-----------------------------------------\n` +
        `১. *জাতীয় পরিচয়পত্র (NID / জন্ম সনদ):* NID Card এর স্পষ্ট কপি বা ১৬ ডিজিটের অনলাইন জন্ম সনদ।\n` +
        `২. *পাসপোর্ট:* পূর্ববর্তী পাসপোর্ট থাকলে মূল কপি ও নম্বর।\n` +
        `৩. *ফোন নম্বর:* আবেদনকারীর সচল ব্যক্তিগত মোবাইল নম্বর (OTP এর জন্য)।\n` +
        `৪. *ইমেইল:* আবেদনকারীর সচল ইমেইল অ্যাড্রেস।\n` +
        `৫. *অভিভাবক তথ্য:* গার্জিয়ানের নাম, মোবাইল নম্বর ও ইমেইল।\n\n` +
        `📌 *হোয়াটসঅ্যাপে প্রেরণের নিয়ম:*\n` +
        `সকল কাগজপত্র সুস্পষ্ট ছবি বা স্ক্যান কপি এই হোয়াটসঅ্যাপ নম্বরে সরাসরি পাঠান।\n\n` +
        `🏢 *মুনসুর আলী ট্রাভেলস*\n` +
        `গভর্নমেন্ট অনুমোদিত ওভারসিজ ম্যানপাওয়ার ও পাসপোর্ট প্রসেসিং এজেন্সি (RL-1842)\n` +
        `📍 ঠিকানা: Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh\n` +
        `📞 যোগাযোগ: +8801345579534`;
    } else if (activeTemplate === 'indian-visa') {
      msg = `*🇮🇳 মুনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
        `*ইন্ডিয়ান ভিসা আবেদনের জন্য প্রয়োজনীয় কাগজপত্র*\n` +
        `-----------------------------------------\n` +
        `১. *বিদ্যুৎ বিলের কপি:* বর্তমান ঠিকানার প্রমাণস্বরূপ হালনাগাদ বিদ্যুৎ বিলের ফটোকপি।\n` +
        `২. *ছবি:* ২" x ২" (2x2 Inch) সাইজ মেট পেপার ল্যাব প্রিন্ট ছবি (সাদা ব্যাকগ্রাউন্ড)। ১ কপি হোয়াটসঅ্যাপে এবং ৪ কপি অফিসে আনতে হবে।\n` +
        `৩. *জমি/ব্যবসা:* জমির খতিয়ান কপি অথবা হালনাগাদ ট্রেড লাইসেন্স কপি।\n` +
        `৪. *ব্যাংক স্টেটমেন্ট:* বিগত ৬ মাসের ব্যাংক স্টেটমেন্ট (সিল ও স্বাক্ষরসহ)।\n\n` +
        `📌 *অফিসে উপস্থিতির নির্দেশ:*\n` +
        `সকল মূল কাগজপত্র ও ৪ কপি ছবি নিয়ে সরাসরি অফিসে আসার অনুরোধ করা হলো।\n\n` +
        `🏢 *মুনসুর আলী ট্রাভেলস*\n` +
        `ইন্ডিয়ান ভিসা প্রসেসিং ও অ্যাপয়েন্টমেন্ট ডেক্স\n` +
        `📍 ঠিকানা: Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh\n` +
        `📞 যোগাযোগ: +8801345579534`;
    } else {
      msg = `*✈️ মুনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
        `*ম্যানপাওয়ার ও ফ্লাইট প্রসেসিং চেকলিস্ট*\n` +
        `-----------------------------------------\n` +
        `১. *মেডিকেল ও বায়োমেট্রিক:* গামকা (GAMCA) ফিট মেডিকেল রিপোর্ট ও BMET বায়োমেট্রিক ফিঙ্গারপ্রিন্ট স্লিপ।\n` +
        `২. *ট্রেনিং ও স্মার্ট কার্ড:* ৩ দিনের TTC ট্রেনিং সনদ ও BMET ম্যানপাওয়ার স্মার্ট কার্ড।\n` +
        `৩. *ভিসা ও টিকিট:* অরিজিনাল পাসপোর্ট সহ ভিসা কপি ও কনফার্ম ফ্লাইট টিকিট।\n\n` +
        `📌 *ফ্লাইট নির্দেশনা:*\n` +
        `ফ্লাইটের নির্ধারিত সময়ের অন্তত ৪ ঘণ্টা পূর্বে মূল পাসপোর্ট ও ম্যানপাওয়ার কার্ড সহ এয়ারপোর্টে উপস্থিত থাকুন।\n\n` +
        `🏢 *মুনসুর আলী ট্রাভেলস*\n` +
        `BMET ক্লিয়ারেন্স ও ফ্লাইট অপারেশন্স সেল (RL-1842)\n` +
        `📍 ঠিকানা: Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh\n` +
        `📞 যোগাযোগ: +8801345579534`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Template Selector & Download Bar */}
      <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              📑 Document Print Templates
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Print Ready A4 Sheet
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a template to preview and click print/download or send directly via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              title="Share Template via WhatsApp"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp-এ পাঠান</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print PDF</span>
            </button>
          </div>
        </div>

        {/* 3 Template Selection Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = activeTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setActiveTemplate(tpl.id)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted">
                    {tpl.badge}
                  </span>
                </div>

                <h3 className={`text-xs font-bold leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                  {tpl.subtitle}
                </p>
              </button>
            );
          })}
        </div>

      </div>

      {/* Printable A4 Paper Preview */}
      <div className="w-full flex justify-center">
        <PrintablePaper id="printable-template-canvas">
          {activeTemplate === 'passport' && <PassportRequirementTemplate />}
          {activeTemplate === 'indian-visa' && <IndianVisaRequirementTemplate />}
          {activeTemplate === 'manpower' && <ManpowerChecklistTemplate />}
        </PrintablePaper>
      </div>

    </div>
  );
}
