import React, { useState, useEffect } from 'react';
import { AgreementForm } from './AgreementForm';
import { AgreementPreview } from './AgreementPreview';
import { PrintablePaper } from '../common/PrintablePaper';
import agencyInfo from '../../../lib/information.json';
import { apiClient } from '../../../lib/api-client';
import { toast } from 'sonner';
import {
  FileText,
  Printer,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Share2,
  FolderOpen,
  PlusCircle,
  Loader2,
  Save
} from 'lucide-react';

export function EmploymentAgreementStudio() {
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [savedAgreements, setSavedAgreements] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialData = {
    header: {
      companyName: agencyInfo.agencyName || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
      officeAddress: agencyInfo.address?.full || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'monsuralitravels@gmail.com'
    },
    parties: {
      agreementDate: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      nidPassport: '',
      employerName: 'মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)',
      employerPhone: agencyInfo.phone || '+8801345579534',
      employeeName: '',
      employeeEmail: '',
      fatherHusbandName: '',
      address: ''
    },
    guardian: {
      guardianName: '',
      guardianPhone: '',
      relationship: 'পিতা',
      emergencyPhone: '',
      guardianNid: '',
      guardianAddress: ''
    },
    position: {
      designation: 'অফিস এক্সিকিউটিভ / প্রসেসিং অফিসার',
      department: 'পাসপোর্ট ও ভিসা প্রসেসিং উইং',
      joiningDate: '০১ সেপ্টেম্বর ২০২৬',
      location: 'হেড অফিস, নাদampur',
      jobType: 'স্থায়ী / পূর্ণকালীন (Full-Time)',
      workSchedule: 'সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার'
    },
    salary: {
      basicSalary: '15000',
      houseRent: '5000',
      medical: '2000',
      conveyance: '1500',
      specialAllowance: '1500',
      grossSalary: '25,000',
      grossSalaryInWords: 'পঁচিশ হাজার টাকা মাত্র'
    },
    leave: {
      casualDays: '10',
      sickDays: '14',
      earnedDays: '18',
      lunchProvided: true,
      teaSnacks: true,
      lunchAllowance: ''
    },
    witnesses: {
      firstWitnessName: '',
      firstWitnessPhone: '',
      firstWitnessAddress: '',
      secondWitnessName: '',
      secondWitnessPhone: '',
      secondWitnessAddress: ''
    }
  };

  const [formData, setFormData] = useState(initialData);

  // Fetch saved agreements list from backend API
  const fetchAgreements = async () => {
    try {
      setLoadingList(true);
      const res = await apiClient.get('/api/v1/docs/employment-agreement');
      if (res.data?.data) {
        setSavedAgreements(res.data.data);
      }
    } catch (err) {
      console.warn('API fetch warning (operating in local state mode):', err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  // Map backend Bengali schema back to frontend form state
  const loadSavedAgreement = (item) => {
    if (!item) return;
    setCurrentId(item._id);

    setFormData({
      header: {
        companyName: item.প্রতিষ্ঠানের_তথ্য?.প্রতিষ্ঠানের_নাম || initialData.header.companyName,
        officeAddress: item.প্রতিষ্ঠানের_তথ্য?.অফিসের_ঠিকানা || initialData.header.officeAddress,
        phone: item.প্রতিষ্ঠানের_তথ্য?.মোবাইল_নম্বর || initialData.header.phone,
        email: item.প্রতিষ্ঠানের_তথ্য?.ইমেইল_অ্যাড্রেস || initialData.header.email,
      },
      parties: {
        agreementDate: item.সাধারণ_তথ্য?.চুক্তির_তারিখ || '',
        nidPassport: item.সাধারণ_তথ্য?.জাতীয়_পরিচয়পত্র_পাসপোর্ট || '',
        employerName: item.সাধারণ_তথ্য?.নিয়োগকর্তা_কর্তৃপক্ষ || initialData.parties.employerName,
        employerPhone: item.সাধারণ_তথ্য?.কর্তৃপক্ষের_মোবাইল_নম্বর || initialData.parties.employerPhone,
        employeeName: item.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || '',
        employeeEmail: item.সাধারণ_তথ্য?.কর্মচারীর_ইমেইল || '',
        fatherHusbandName: item.সাধারণ_তথ্য?.পিতা_স্বামীর_নাম || '',
        address: item.সাধারণ_তথ্য?.বর্তমান_স্থায়ী_ঠিকানা || '',
      },
      guardian: {
        guardianName: item.অভিভাবকের_তথ্য?.অভিভাবকের_নাম || '',
        guardianPhone: item.অভিভাবকের_তথ্য?.মোবাইল_নম্বর || '',
        relationship: item.অভিভাবকের_তথ্য?.সম্পর্ক || 'পিতা',
        emergencyPhone: item.অভিভাবকের_তথ্য?.বিকল্প_জরুরি_নম্বর || '',
        guardianNid: item.অভিভাবকের_তথ্য?.জাতীয়_পরিচয়পত্র_নং || '',
        guardianAddress: item.অভিভাবকের_তথ্য?.ঠিকানা || '',
      },
      position: {
        designation: item.পদের_বিবরণ?.পদের_নাম || '',
        department: item.পদের_বিবরণ?.বিভাগ || '',
        joiningDate: item.পদের_বিবরণ?.যোগদানের_তারিখ || '',
        location: item.পদের_বিবরণ?.কর্মস্থল || '',
        jobType: item.পদের_বিবরণ?.নিয়োগের_ধরন || 'স্থায়ী / পূর্ণকালীন (Full-Time)',
        workSchedule: item.পদের_বিবরণ?.কাজের_সময়_ও_ছুটি || '',
      },
      salary: {
        basicSalary: item.বেতন_কাঠামো?.মূল_বেতন || '',
        houseRent: item.বেতন_কাঠামো?.বাড়ি_ভাড়া_ভাতা || '',
        medical: item.বেতন_কাঠামো?.চিকিৎসা_ভাতা || '',
        conveyance: item.বেতন_কাঠামো?.যাতায়াত_ভাতা || '',
        specialAllowance: item.বেতন_কাঠামো?.বিশেষ_ভাতা || '',
        grossSalary: item.বেতন_কাঠামো?.সর্বমোট_মাসিক_বেতন || '',
        grossSalaryInWords: item.বেতন_কাঠামো?.বেতন_কথায় || '',
      },
      leave: {
        casualDays: item.ছুটি_ও_সুবিধা?.নৈমিত্তিক_ছুটি_দিন || '10',
        sickDays: item.ছুটি_ও_সুবিধা?.অসুস্থতাজনিত_ছুটি_দিন || '14',
        earnedDays: item.ছুটি_ও_সুবিধা?.অর্জিত_ছুটি_দিন || '18',
        lunchProvided: item.ছুটি_ও_সুবিধা?.ফ্রি_লাঞ্চ_সুবিধা ?? true,
        teaSnacks: item.ছুটি_ও_সুবিধা?.চা_নাস্তা_সুবিধা ?? true,
        lunchAllowance: item.ছুটি_ও_সুবিধা?.লাঞ্চ_ভাতা || '',
      },
      witnesses: {
        firstWitnessName: item.স্বাক্ষীগণের_তথ্য?.প্রথম_পক্ষের_সাক্ষী?.নাম || '',
        firstWitnessPhone: item.স্বাক্ষীগণের_তথ্য?.প্রথম_পক্ষের_সাক্ষী?.মোবাইল_নম্বর || '',
        firstWitnessAddress: item.স্বাক্ষীগণের_তথ্য?.প্রথম_পক্ষের_সাক্ষী?.ঠিকানা || '',
        secondWitnessName: item.স্বাক্ষীগণের_তথ্য?.দ্বিতীয়_পক্ষের_সাক্ষী?.নাম || '',
        secondWitnessPhone: item.স্বাক্ষীগণের_তথ্য?.দ্বিতীয়_পক্ষের_সাক্ষী?.মোবাইল_নম্বর || '',
        secondWitnessAddress: item.স্বাক্ষীগণের_তথ্য?.দ্বিতীয়_পক্ষের_সাক্ষী?.ঠিকানা || '',
      },
    });

    toast.success(`${item.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || 'চুক্তিপত্র'} লোড করা হয়েছে।`);
  };

  const handleCreateNew = () => {
    setCurrentId(null);
    setFormData(initialData);
    setViewMode('form');
    toast.info('নতুন চুক্তিপত্রের জন্য ফর্ম প্রস্তুত করা হয়েছে।');
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি ফর্মের সকল তথ্য রিসেট করতে চান?')) {
      setCurrentId(null);
      setFormData(initialData);
    }
  };

  const handleFormSubmit = async () => {
    // Switch to preview mode immediately for instant response
    setViewMode('preview');

    // Save/persist to backend API
    try {
      setSaving(true);
      if (currentId) {
        await apiClient.put(`/api/v1/docs/employment-agreement/${currentId}`, formData);
        toast.success('নিয়োগ চুক্তিপত্র সফলভাবে আপডেট করা হয়েছে।');
      } else {
        const res = await apiClient.post('/api/v1/docs/employment-agreement', formData);
        if (res.data?.data?._id) {
          setCurrentId(res.data.data._id);
        }
        toast.success('নিয়োগ চুক্তিপত্র ডাটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে।');
      }
      fetchAgreements();
    } catch (err) {
      console.warn('API save notice:', err.message);
      // Local state is still preserved completely
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const employee = formData.parties?.employeeName || 'কর্মচারী';
    const designation = formData.position?.designation || 'কর্মকর্তা';
    const joiningDate = formData.position?.joiningDate || 'অপেক্ষমান';
    const gross = formData.salary?.grossSalary || 'নির্ধারিত';

    const msg =
      `*📄 মুনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*নিয়োগ ও চাকরির পূর্ণাঙ্গ চুক্তিপত্র (Employment Agreement)*\n` +
      `-----------------------------------------\n` +
      `👤 *কর্মচারীর নাম:* ${employee}\n` +
      `💼 *পদবী:* ${designation}\n` +
      `🏢 *বিভাগ:* ${formData.position?.department || 'প্রসেসিং উইং'}\n` +
      `📅 *যোগদানের তারিখ:* ${joiningDate}\n` +
      `💰 *মাসিক সর্বমোট বেতন:* ${gross} ৳ (${formData.salary?.grossSalaryInWords || ''})\n` +
      `⏱️ *ন্যূনতম মেয়াদ:* ২ (দুই) বছর ও ৩ মাসের নোটিশ পলিসি\n\n` +
      `📌 *স্বাক্ষীগণের তথ্য ও চুক্তিপত্র:* চুক্তিপত্রের মূল প্রিন্ট কপি অফিসে প্রস্তুত রয়েছে।\n\n` +
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: ${formData.header?.officeAddress || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh'}\n` +
      `📞 যোগাযোগ: ${formData.header?.phone || '+8801345579534'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Saved Records / Quick Action Toolbar */}
      <div className="no-print bg-card border border-border p-3.5 sm:p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-foreground">সংরক্ষিত চুক্তিপত্র তালিকা:</span>
          {savedAgreements.length > 0 ? (
            <select
              value={currentId || ''}
              onChange={(e) => {
                const sel = savedAgreements.find((a) => a._id === e.target.value);
                if (sel) loadSavedAgreement(sel);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none max-w-[220px] sm:max-w-xs truncate"
            >
              <option value="">-- পূর্ববর্তী চুক্তিপত্র নির্বাচন করুন --</option>
              {savedAgreements.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || 'নামহীন'} - {a.পদের_বিবরণ?.পদের_নাম || 'পদবী'}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              {loadingList ? 'লোড হচ্ছে...' : 'কোনো সংরক্ষিত চুক্তিপত্র পাওয়া যায়নি'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>নতুন ফরম (New)</span>
          </button>
        </div>
      </div>

      {/* Form Mode */}
      {viewMode === 'form' && (
        <AgreementForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onReset={handleReset}
        />
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Action Header in Preview Mode */}
          <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                নিয়োগ ও চাকরির চুক্তিপত্র প্রস্তুত (Print Ready A4 Preview)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                নিচে চুক্তিপত্রটি সম্পূর্ণ প্রস্তুত অবস্থায় দেখতে পাচ্ছেন। সরাসরি প্রিন্ট/পিডিএফ ডাউনলোড করুন অথবা তথ্যে পরিবর্তন আনতে এডিট করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-primary" />
                <span>তথ্য পরিবর্তন (Edit Form)</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                title="Share Contract Summary on WhatsApp"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp-এ পাঠান</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>

          {/* Printable A4 Legal Paper Container */}
          <div className="w-full flex justify-center">
            <PrintablePaper id="printable-agreement-canvas">
              <AgreementPreview data={formData} />
            </PrintablePaper>
          </div>
        </div>
      )}
    </div>
  );
}
