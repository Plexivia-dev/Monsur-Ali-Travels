import React, { useState } from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { usePortal } from '../context/PortalContext';
import {
  FileText,
  FileSignature,
  UserCheck,
  Stamp,
  BookOpen,
  Contact,
  Banknote,
  ReceiptText,
  Receipt,
  Wallet,
  Award,
  ShieldCheck,
  Heart,
  Search,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Printer,
} from 'lucide-react';
import { EmploymentAgreement } from '../components/docs/agreement/EmploymentAgreement';
import { IdCard } from '../components/docs/idcard/IdCard';
import { SalarySlip } from '../components/docs/payroll/SalarySlip';
import { Invoice } from '../components/docs/invoice/Invoice';
import { PassportSubmission } from '../components/docs/passport/PassportSubmission';
import { IndianVisa } from '../components/docs/indian-visa/IndianVisa';
import { CustomerGuardian } from '../components/docs/customer-form/CustomerGuardian';
import { MoneyReceipt } from '../components/docs/receipt/MoneyReceipt';
import { CashVoucher } from '../components/docs/cash-voucher/CashVoucher';
import { ExperienceCertificate } from '../components/docs/certificate-experience/ExperienceCertificate';
import { CharacterCertificate } from '../components/docs/certificate-character/CharacterCertificate';
import { MarriageCertificate } from '../components/docs/certificate-marriage/MarriageCertificate';

const DOCUMENT_GENERATORS = [
  {
    id: 'agreement',
    title: 'Employment Agreement',
    bnTitle: 'নিয়োগ চুক্তিপত্র',
    category: 'contracts',
    categoryLabel: 'Contracts & Legal',
    description: 'Bilingual (Bangla & English) standard overseas and agency employment legal contract.',
    bnDescription: 'বাংলা ও ইংরেজিতে দ্বিভাষিক বৈদেশিক নিয়োগ ও এজেন্সি চুক্তিপত্র প্রস্তুতকরণ।',
    icon: FileSignature,
    color: 'from-blue-600 to-indigo-600',
    badge: 'Legal Contract',
    badgeStyle: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'customer-form',
    title: 'Customer & Guardian Form',
    bnTitle: 'কাস্টমার ও অভিভাবক ফরম',
    category: 'contracts',
    categoryLabel: 'Contracts & Forms',
    description: 'Applicant profile, guardian guarantee, emergency contacts and legal declaration.',
    bnDescription: 'আবেদনকারীর পূর্ণাঙ্গ তথ্য, অভিভাবকের জামিনদারী বিবরণী ও ঘোষণাপত্র।',
    icon: UserCheck,
    color: 'from-sky-600 to-cyan-600',
    badge: 'Application Form',
    badgeStyle: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'indian-visa',
    title: 'Indian Visa Submission File',
    bnTitle: 'ইন্ডিয়ান ভিসা ফাইল',
    category: 'contracts',
    categoryLabel: 'Visa & Passport',
    description: 'Applicant profile, port details, appointment tracking and submission slip.',
    bnDescription: 'ভারতীয় ভিসা আবেদনকারী প্রোফাইল, পোর্ট নির্বাচন ও ট্র্যাকিং রিসিট।',
    icon: Stamp,
    color: 'from-amber-600 to-orange-600',
    badge: 'Visa File',
    badgeStyle: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'passport-sub',
    title: 'Passport Submission Slip',
    bnTitle: 'পাসপোর্ট জমা রশিদ',
    category: 'contracts',
    categoryLabel: 'Visa & Passport',
    description: 'Passport custody handover voucher with barcode and tracking identifier.',
    bnDescription: 'পাসপোর্ট গ্রহণ ও ডেলিভারি ট্র্যাকিং স্লিপ এবং বারকোড ভাউচার।',
    icon: BookOpen,
    color: 'from-emerald-600 to-teal-600',
    badge: 'Custody Slip',
    badgeStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'idcard',
    title: 'Employee ID Card',
    bnTitle: 'কর্মচারী আইডি কার্ড',
    category: 'hr',
    categoryLabel: 'HR & Identity',
    description: 'Front and back official corporate employee identity card with QR and blood group.',
    bnDescription: 'কিউআর কোড, ব্লাড গ্রুপ ও ছবি সম্বলিত দ্বিপাক্ষিক প্রফেশনাল আইডি কার্ড।',
    icon: Contact,
    color: 'from-indigo-600 to-purple-600',
    badge: 'Identity Card',
    badgeStyle: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'payroll',
    title: 'Monthly Salary Slip',
    bnTitle: 'মাসিক বেতন স্লিপ',
    category: 'hr',
    categoryLabel: 'HR & Payroll',
    description: 'Complete breakdown of earnings, allowances, deductions, attendance and net salary.',
    bnDescription: 'মূল বেতন, ভাতা, কর্তন ও হাজিরা সমন্বয়সহ পূর্ণাঙ্গ স্যালারি স্লিপ।',
    icon: Banknote,
    color: 'from-teal-600 to-emerald-600',
    badge: 'Payroll Slip',
    badgeStyle: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
  {
    id: 'invoice',
    title: 'Invoice Billing',
    bnTitle: 'ইনভয়েস ও বিলিং',
    category: 'accounts',
    categoryLabel: 'Accounts & Billing',
    description: 'Professional client invoice with itemized charges, VAT, tax and payment status.',
    bnDescription: 'আইটেমাইজড চার্জ, ভ্যাট, ডিসকাউন্ট ও বকেয়াসহ ক্লায়েন্ট ইনভয়েস বিল।',
    icon: ReceiptText,
    color: 'from-violet-600 to-purple-600',
    badge: 'Tax Invoice',
    badgeStyle: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  },
  {
    id: 'money-receipt',
    title: 'Money Receipt Voucher',
    bnTitle: 'মানি রিসিট ভাউচার',
    category: 'accounts',
    categoryLabel: 'Accounts & Receipts',
    description: 'Official payment receipt voucher with amount in words, method and signatures.',
    bnDescription: 'টাকা প্রাপ্তি স্বীকার স্লিপ, কথায় টাকা, মেথড ও অথরাইজড সিগনেচার।',
    icon: Receipt,
    color: 'from-blue-600 to-cyan-600',
    badge: 'Official Receipt',
    badgeStyle: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'cash-voucher',
    title: 'Cash Money Voucher',
    bnTitle: 'ক্যাশ মানি ভাউচার',
    category: 'accounts',
    categoryLabel: 'Accounts & Vouchers',
    description: 'Office cash disbursement and petty cash debit/credit expense voucher.',
    bnDescription: 'অফিস ক্যাশ খরচ, গ্রহণ ও পেটি ক্যাশ ডেবিট/ক্রেডিট ভাউচার প্রিন্ট।',
    icon: Wallet,
    color: 'from-cyan-600 to-blue-600',
    badge: 'Cash Voucher',
    badgeStyle: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'experience-certificate',
    title: 'Experience Certificate',
    bnTitle: 'অভিজ্ঞতা সনদপত্র',
    category: 'certificates',
    categoryLabel: 'Certificates',
    description: 'Official corporate work experience and service release certificate letter.',
    bnDescription: 'অফিসিয়াল কর্মদক্ষতা ও অভিজ্ঞতা প্রত্যয়নপত্র / প্রশংসাপত্র।',
    icon: Award,
    color: 'from-rose-600 to-pink-600',
    badge: 'Certificate',
    badgeStyle: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'character-certificate',
    title: 'Character Certificate',
    bnTitle: 'চারিত্রিক সনদপত্র',
    category: 'certificates',
    categoryLabel: 'Certificates',
    description: 'Formal character, conduct and moral standing testimonial certificate.',
    bnDescription: 'সুনাম ও চারিত্রিক দৃঢ়তা প্রত্যয়নকারী সনদপত্র / চারিত্রিক প্রশংসাপত্র।',
    icon: ShieldCheck,
    color: 'from-emerald-600 to-green-600',
    badge: 'Certificate',
    badgeStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'marriage-certificate',
    title: 'Marriage Certificate',
    bnTitle: 'বিবাহ সনদপত্র',
    category: 'certificates',
    categoryLabel: 'Certificates',
    description: 'Official marital status verification certificate letter for embassy and visa.',
    bnDescription: 'ভিসা ও অফিশিয়াল প্রয়োজনে বিবাহ বন্ধন সংক্রান্ত প্রত্যয়নপত্র।',
    icon: Heart,
    color: 'from-pink-600 to-rose-600',
    badge: 'Certificate',
    badgeStyle: 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Documents', bnLabel: 'সকল ডকুমেন্ট', count: 12 },
  { id: 'contracts', label: 'Contracts & Forms', bnLabel: 'চুক্তি ও আবেদন', count: 4 },
  { id: 'accounts', label: 'Accounts & Billing', bnLabel: 'হিসাব ও ভাউচার', count: 3 },
  { id: 'hr', label: 'HR & Payroll', bnLabel: 'এইচআর ও পে-রোল', count: 2 },
  { id: 'certificates', label: 'Certificates', bnLabel: 'সনদপত্রসমূহ', count: 3 },
];

export default function DocumentStudio() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const { switchPortal } = usePortal();
  const language = usePortalStore((state) => state.language);
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isOverview = !activeSubmodule || activeSubmodule === 'overview' || activeSubmodule === 'studio';

  const filteredGenerators = DOCUMENT_GENERATORS.filter((gen) => {
    const matchesCategory = selectedCategory === 'all' || gen.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      gen.title.toLowerCase().includes(q) ||
      gen.bnTitle.toLowerCase().includes(q) ||
      gen.description.toLowerCase().includes(q) ||
      gen.bnDescription.toLowerCase().includes(q) ||
      gen.badge.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const activeGenerator = DOCUMENT_GENERATORS.find(
    (g) =>
      g.id === activeSubmodule ||
      (activeSubmodule === 'receipt' && g.id === 'money-receipt') ||
      (activeSubmodule === 'certificate-exp' && g.id === 'experience-certificate') ||
      (activeSubmodule === 'certificate-char' && g.id === 'character-certificate') ||
      (activeSubmodule === 'certificate-marr' && g.id === 'marriage-certificate')
  );

  return (
    <div className="space-y-6">
      {!isOverview && (
        <div className="bg-card border border-border px-4 py-3 rounded-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => switchPortal('docs', 'overview')}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-md border border-border transition-all cursor-pointer w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isBn ? '← সকল ডকুমেন্ট জেনারেটর' : '← Back to Document Studio Hub'}</span>
          </button>

          {activeGenerator && (
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${activeGenerator.badgeStyle}`}>
                {activeGenerator.badge}
              </span>
              <span className="text-xs font-bold text-foreground">
                {isBn ? activeGenerator.bnTitle : activeGenerator.title}
              </span>
            </div>
          )}
        </div>
      )}

      {isOverview && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="relative overflow-hidden bg-card border border-border p-6 sm:p-8 rounded-lg shadow-xs border-b-2 border-b-primary/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? '১২টি অফিসিয়াল ডকুমেন্ট জেনারেটর' : '12 Document Generators Available'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                  <FileText className="w-7 h-7 text-primary shrink-0" />
                  {isBn ? 'ডকুমেন্ট স্টুডিও' : 'Document Studio'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isBn
                    ? 'ভ্রমণ চুক্তিপত্র, কাস্টমার আবেদন, ভিসা ফাইল, পাসপোর্ট জমা রশিদ, আইডি কার্ড, পে-রোল স্যালারি স্লিপ, ইনভয়েস ও সার্টিফিকেটসহ সকল অফিসিয়াল ডকুমেন্ট সহজে তৈরি ও প্রিন্ট করুন।'
                    : 'Generate, preview, customize, and print official travel documents, vouchers, agreements, certificates, identity cards, and payroll records.'}
                </p>
              </div>

              <div className="w-full md:w-80 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isBn ? 'ডকুমেন্ট খুঁজুন...' : 'Search generator (e.g. Agreement, Slip)...'}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-md text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30 outline-none shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span>{isBn ? cat.bnLabel : cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGenerators.map((gen) => {
              const IconComponent = gen.icon;
              return (
                <div
                  key={gen.id}
                  onClick={() => switchPortal('docs', gen.id)}
                  className="group bg-card border border-border hover:border-primary/50 p-5 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${gen.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gen.badgeStyle}`}>
                        {gen.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{gen.title}</span>
                      </h3>
                      <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                        {gen.bnTitle}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                      {isBn ? gen.bnDescription : gen.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1.5 text-foreground/80 group-hover:text-primary">
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isBn ? 'জেনারেট করুন' : 'Generate & Print'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGenerators.length === 0 && (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center space-y-3">
              <Search className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-foreground">
                {isBn ? 'কোন ডকুমেন্ট জেনারেটর পাওয়া যায়নি' : 'No document generators found'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {isBn
                  ? `"${searchQuery}" এর সাথে মিলে এমন কোন ডকুমেন্ট পাওয়া যায়নি। অনুগ্রহ করে অন্য কি-ওয়ার্ড দিয়ে চেষ্টা করুন।`
                  : `No generators matching "${searchQuery}". Try searching with a different keyword.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
              >
                {isBn ? 'সকল ডকুমেন্ট দেখুন' : 'Show All Generators'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubmodule === 'agreement' && <EmploymentAgreement />}
      {activeSubmodule === 'customer-form' && <CustomerGuardian />}
      {activeSubmodule === 'indian-visa' && <IndianVisa />}
      {activeSubmodule === 'passport-sub' && <PassportSubmission />}
      {activeSubmodule === 'idcard' && <IdCard />}
      {activeSubmodule === 'payroll' && <SalarySlip />}
      {activeSubmodule === 'invoice' && <Invoice />}
      {(activeSubmodule === 'money-receipt' || activeSubmodule === 'receipt') && <MoneyReceipt />}
      {activeSubmodule === 'cash-voucher' && <CashVoucher />}
      {(activeSubmodule === 'experience-certificate' || activeSubmodule === 'certificate-exp') && (
        <ExperienceCertificate />
      )}
      {(activeSubmodule === 'character-certificate' || activeSubmodule === 'certificate-char') && (
        <CharacterCertificate />
      )}
      {(activeSubmodule === 'marriage-certificate' || activeSubmodule === 'certificate-marr') && (
        <MarriageCertificate />
      )}
    </div>
  );
}
