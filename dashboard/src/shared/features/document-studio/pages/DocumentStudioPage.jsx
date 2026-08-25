import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { DOCUMENT_GENERATORS, CATEGORIES } from '../configs/documentGenerators';
import { EmploymentAgreement } from '../components/agreement/EmploymentAgreement';
import { IdCard } from '../components/idcard/IdCard';
import { SalarySlip } from '../components/payroll/SalarySlip';
import { Invoice } from '../components/invoice/Invoice';
import { PassportSubmission } from '../components/passport/PassportSubmission';
import { IndianVisa } from '../components/indian-visa/IndianVisa';
import { CustomerGuardian } from '../components/customer-form/CustomerGuardian';
import { MoneyReceipt } from '../components/receipt/MoneyReceipt';
import { CashVoucher } from '../components/cash-voucher/CashVoucher';
import { ExperienceCertificate } from '../components/certificate-experience/ExperienceCertificate';
import { CharacterCertificate } from '../components/certificate-character/CharacterCertificate';
import { MarriageCertificate } from '../components/certificate-marriage/MarriageCertificate';

export function DocumentStudioPage({
  activeSubmodule: propSubmodule,
  onSelectGenerator: propOnSelectGenerator,
  portalMode = 'auto', // 'client' | 'admin' | 'standalone' | 'auto'
}) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const isBn = i18n.language?.startsWith('bn');

  // Determine current active generator
  const [localSubmodule, setLocalSubmodule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const routeGenerator = params.generator || params.submodule || null;

  // Resolve current active submodule
  let resolvedSubmodule = propSubmodule;
  if (resolvedSubmodule === undefined) {
    if (routeGenerator) {
      resolvedSubmodule = routeGenerator;
    } else if (localSubmodule !== null) {
      resolvedSubmodule = localSubmodule;
    } else if (location.pathname.includes('/docs/')) {
      const parts = location.pathname.split('/docs/').filter(Boolean);
      if (parts[1]) resolvedSubmodule = parts[1].split('/')[0];
    } else if (location.pathname.includes('/document-studio/')) {
      const parts = location.pathname.split('/document-studio/').filter(Boolean);
      if (parts[1]) resolvedSubmodule = parts[1].split('/')[0];
    }
  }

  const isOverview =
    !resolvedSubmodule ||
    resolvedSubmodule === 'overview' ||
    resolvedSubmodule === 'studio' ||
    resolvedSubmodule === 'all';

  // Handle switching generators
  const handleSelectGenerator = (genId) => {
    if (propOnSelectGenerator) {
      propOnSelectGenerator(genId);
      return;
    }

    const isAdmin = location.pathname.startsWith('/admin');
    if (isAdmin) {
      navigate(`/admin/docs/${genId}`);
      setLocalSubmodule(genId);
    } else if (location.pathname.startsWith('/dashboard')) {
      navigate(`/dashboard/docs/${genId}`);
      setLocalSubmodule(genId);
    } else {
      setLocalSubmodule(genId);
    }
  };

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

  return (
    <div className="space-y-6">
      {isOverview && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="relative overflow-hidden bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs border-b-2 border-b-primary/40">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30 outline-none shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
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
                  onClick={() => handleSelectGenerator(gen.id)}
                  className="group bg-card border border-border hover:border-primary/50 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gen.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0`}
                      >
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
                      <div className="text-xs font-semibold text-muted-foreground mt-0.5">{gen.bnTitle}</div>
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
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
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
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
              >
                {isBn ? 'সকল ডকুমেন্ট দেখুন' : 'Show All Generators'}
              </button>
            </div>
          )}
        </div>
      )}

      {resolvedSubmodule === 'agreement' && <EmploymentAgreement />}
      {resolvedSubmodule === 'customer-form' && <CustomerGuardian />}
      {resolvedSubmodule === 'indian-visa' && <IndianVisa />}
      {resolvedSubmodule === 'passport-sub' && <PassportSubmission />}
      {resolvedSubmodule === 'idcard' && <IdCard />}
      {resolvedSubmodule === 'payroll' && <SalarySlip />}
      {resolvedSubmodule === 'invoice' && <Invoice />}
      {(resolvedSubmodule === 'money-receipt' || resolvedSubmodule === 'receipt') && <MoneyReceipt />}
      {resolvedSubmodule === 'cash-voucher' && <CashVoucher />}
      {(resolvedSubmodule === 'experience-certificate' || resolvedSubmodule === 'certificate-exp') && (
        <ExperienceCertificate />
      )}
      {(resolvedSubmodule === 'character-certificate' || resolvedSubmodule === 'certificate-char') && (
        <CharacterCertificate />
      )}
      {(resolvedSubmodule === 'marriage-certificate' || resolvedSubmodule === 'certificate-marr') && (
        <MarriageCertificate />
      )}
    </div>
  );
}

export default DocumentStudioPage;
