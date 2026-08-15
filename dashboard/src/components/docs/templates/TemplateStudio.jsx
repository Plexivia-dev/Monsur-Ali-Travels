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
              Select a template to preview and click print/download for client distribution.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Download / Print PDF</span>
          </button>
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
