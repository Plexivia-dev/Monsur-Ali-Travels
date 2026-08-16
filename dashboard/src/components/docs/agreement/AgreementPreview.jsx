import React from 'react';
import logoImg from '../../../assets/logo.png';

export function AgreementPreview({ data }) {
  const currentDate = data.parties?.agreementDate || new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const salary = data.salary || {};
  const leave = data.leave || {};
  const witnesses = data.witnesses || {};

  return (
    <div className="bg-white text-slate-900 font-sans p-4 sm:p-6 text-[11px] leading-relaxed space-y-4 print:text-[10px] print:p-2 print:space-y-3">
      {/* 0. Top Header */}
      <div className="border-b-2 border-slate-900 pb-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-xs shrink-0">
              <img src={logoImg} alt="Agency Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                {data.header?.companyName || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)'}
              </h1>
              <p className="text-[11px] text-slate-700 font-medium">
                অফিসের ঠিকানা : {data.header?.officeAddress || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-700 font-medium border-t border-slate-200 pt-1.5 gap-2">
          <div>মোবাইল নম্বর : <span className="font-bold text-slate-900">{data.header?.phone || '+8801345579534'}</span></div>
          <div>ইমেইল অ্যাড্রেস : <span className="font-bold text-slate-900">{data.header?.email || 'monsuralitravels@gmail.com'}</span></div>
          <div>লাইসেন্স নং : <span className="font-bold text-slate-900">RL-1842</span></div>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="text-center py-2 px-3 bg-slate-900 text-white rounded-md shadow-xs space-y-0.5">
        <h2 className="text-sm sm:text-base font-black tracking-wide">
          নিয়োগ ও চাকরির পূর্ণাঙ্গ চুক্তিপত্র (Employment Agreement)
        </h2>
        <p className="text-[10px] text-amber-300 font-medium">
          বাংলাদেশ শ্রম আইন এবং প্রচলিত বিধিমালা অনুযায়ী উভয় পক্ষের সম্মতিক্রমে সম্পাদিত আইনি চুক্তি
        </p>
      </div>

      {/* ১. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details) */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          ১. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-1">
          <div><span className="text-slate-600 font-medium">চুক্তির তারিখ :</span> <span className="font-bold">{data.parties?.agreementDate || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">জাতীয় পরিচয়পত্র/পাসপোর্ট :</span> <span className="font-bold font-mono">{data.parties?.nidPassport || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">নিয়োগকর্তা/কর্তৃপক্ষ :</span> <span className="font-bold">{data.parties?.employerName || 'মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)'}</span></div>
          <div><span className="text-slate-600 font-medium">মোবাইল নম্বর :</span> <span className="font-bold font-mono">{data.parties?.employerPhone || '+8801345579534'}</span></div>
          <div><span className="text-slate-600 font-medium">কর্মচারীর পূর্ণ নাম :</span> <span className="font-bold text-slate-900">{data.parties?.employeeName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">ইমেইল অ্যাড্রেস :</span> <span className="font-bold">{data.parties?.employeeEmail || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">পিতা/স্বামীর নাম :</span> <span className="font-bold">{data.parties?.fatherHusbandName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">বর্তমান ও স্থায়ী ঠিকানা :</span> <span className="font-bold">{data.parties?.address || '____________________'}</span></div>
        </div>
      </div>

      {/* ২. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Parent / Guardian Details) */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          ২. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Parent / Guardian Details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-1">
          <div><span className="text-slate-600 font-medium">অভিভাবক/পিতার নাম :</span> <span className="font-bold">{data.guardian?.guardianName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">মোবাইল নম্বর (প্রধান) :</span> <span className="font-bold font-mono">{data.guardian?.guardianPhone || '____________________'}</span></div>
          <div>
            <span className="text-slate-600 font-medium">কর্মচারীর সাথে সম্পর্ক :</span>{' '}
            <span className="font-bold">
              {data.guardian?.relationship ? `[ ✓ ] ${data.guardian.relationship}` : '[ ] পিতা  [ ] মাতা  [ ] অভিভাবক'}
            </span>
          </div>
          <div><span className="text-slate-600 font-medium">বিকল্প জরুরি নম্বর :</span> <span className="font-bold font-mono">{data.guardian?.emergencyPhone || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">জাতীয় পরিচয়পত্র নং :</span> <span className="font-bold font-mono">{data.guardian?.guardianNid || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">স্থায়ী / বর্তমান ঠিকানা :</span> <span className="font-bold">{data.guardian?.guardianAddress || '____________________'}</span></div>
        </div>
      </div>

      {/* ৩. পদের বিবরণ ও কাজের সময়সূচি (Position & Schedule) */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          ৩. পদের বিবরণ ও কাজের সময়সূচি (Position & Schedule)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-1">
          <div><span className="text-slate-600 font-medium">পদের নাম (Designation) :</span> <span className="font-bold">{data.position?.designation || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">বিভাগ (Department) :</span> <span className="font-bold">{data.position?.department || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">যোগদানের তারিখ :</span> <span className="font-bold">{data.position?.joiningDate || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">কর্মস্থল (Location) :</span> <span className="font-bold">{data.position?.location || 'হেড অফিস, নাদampur'}</span></div>
          <div className="sm:col-span-2">
            <span className="text-slate-600 font-medium">নিয়োগের ধরন :</span>{' '}
            <span className="font-bold">
              {data.position?.jobType ? `[ ✓ ] ${data.position.jobType}` : '[ ] স্থায়ী / পূর্ণকালীন (Full-Time)   [ ] খণ্ডকালীন (Part-Time)   [ ] চুক্তিভিত্তিক (Contractual)'}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-600 font-medium">কাজের সময় ও ছুটি :</span>{' '}
            <span className="font-bold">
              {data.position?.workSchedule || '[ ✓ ] সকাল ৯:০০ - সন্ধ্যা ৬:০০    [ ✓ ] রবিবার হতে বৃহস্পতিবার    অন্যান্য: সাপ্তাহিক ছুটি শুক্রবার/শনিবার'}
            </span>
          </div>
        </div>
      </div>

      {/* ৪. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure & Review) */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          ৪. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure & Review)
        </h3>
        <table className="w-full border-collapse border border-slate-300 text-[11px] my-1">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold">
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/2">বেতন ও ভাতার খাত (Particulars)</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-center w-1/4">পরিমাণ / মাসিক হার (টাকা)</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/4">মন্তব্য / শর্তাবলী</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">১. মূল বেতন (Basic Salary)</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.basicSalary || '________________'} ৳</td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">স্থায়ী বেতনের মূল অংশ</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">২. বাড়ি ভাড়া ভাতা (House Rent)</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.houseRent || '________________'} ৳</td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">নিয়ম অনুযায়ী প্রযোজ্য</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">৩. চিকিৎসা ভাতা (Medical Allowance)</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.medical || '________________'} ৳</td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">মাসিক চিকিৎসা ব্যয়</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">৪. যাতায়াত / কনভেয়েন্স ভাতা</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.conveyance || '________________'} ৳</td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">কর্মস্থলে যাতায়াত বাবদ</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">৫. অন্যান্য বিশেষ ভাতা / ইনসেন্টিভ</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.specialAllowance || '________________'} ৳</td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">দায়িত্ব/দক্ষতা অনুযায়ী</td>
            </tr>
            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-300 px-2.5 py-1.5">সর্বমোট মোট মাসিক বেতন (Gross Salary)</td>
              <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold font-mono text-slate-900">= {salary.grossSalary || '________________'} ৳</td>
              <td className="border border-slate-300 px-2.5 py-1.5 text-slate-800">(কথায়: {salary.grossSalaryInWords || '______________________'})</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ৫. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy, Holidays & Refreshment) */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          ৫. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy, Holidays & Refreshment)
        </h3>
        <table className="w-full border-collapse border border-slate-300 text-[11px] my-1">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold">
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/4">সুবিধার ধরন</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/2">সুবিধার বিবরণ ও নীতিমালা</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/4">মন্তব্য / অনুমোদন</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">বাৎসরিক ছুটি (Leave Policy)</td>
              <td className="border border-slate-300 px-2.5 py-1">
                [ ✓ ] নৈমিত্তিক (Casual): {leave.casualDays || '১০'} দিন<br />
                [ ✓ ] অসুস্থতা (Sick): {leave.sickDays || '১৪'} দিন<br />
                [ ✓ ] অর্জিত (Earned): {leave.earnedDays || '১৮'} দিন
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                ছুটি গ্রহণের পূর্বে উপযুক্ত কর্তৃপক্ষের পূর্বানুমোদন বাধ্যতামূলক।
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">সরকারি ও ঈদের ছুটি (Holidays)</td>
              <td className="border border-slate-300 px-2.5 py-1">
                [ ✓ ] সরকারি ছুটির তালিকা অনুযায়ী<br />
                [ ✓ ] ঈদুল ফিতর ও ঈদুল আযহার নির্ধারিত ছুটি
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                কোম্পানির বাৎসরিক হলিডে ক্যালেন্ডার কার্যকর হবে।
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">লাঞ্চ ও নাস্তা (Meals & Snacks)</td>
              <td className="border border-slate-300 px-2.5 py-1">
                {leave.lunchProvided ? '[ ✓ ]' : '[ ]'} কোম্পানি কর্তৃক ফ্রি লাঞ্চ প্রদান<br />
                {leave.teaSnacks ? '[ ✓ ]' : '[ ]'} দৈনিক চা/কফি ও বিকালের নাস্তা<br />
                {leave.lunchAllowance ? `[ ✓ ] লাঞ্চ ভাতা (মাসিক): ${leave.lunchAllowance} টাকা` : '[ ] লাঞ্চ ভাতা'}
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                অফিসের অভ্যন্তরীণ পলিসি অনুযায়ী কার্যকর হবে।
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">বোনাস ও উৎসব সুবিধা</td>
              <td className="border border-slate-300 px-2.5 py-1">
                [ ✓ ] বাৎসরিক ২টি উৎসব বোনাস (Eid Bonus)<br />
                [ ✓ ] বার্ষিক পারফরম্যান্স বোনাস (প্রযোজ্য ক্ষেত্রে)
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                নির্দিষ্ট মেয়াদ সন্তোষজনকভাবে সম্পন্ন করার পর প্রযোজ্য।
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ৬. চাকরির ন্যূনতম মেয়াদ (২ বছর) ও ৩ মাসের নোটিশ পিরিয়ড (2-Year Commitment & Notice Policy) */}
      <div className="space-y-1 bg-amber-50/60 border border-amber-200 p-2.5 rounded-md">
        <h3 className="font-bold text-xs text-amber-900 border-b border-amber-300 pb-0.5">
          ৬. চাকরির ন্যূনতম মেয়াদ (২ বছর) ও ৩ মাসের নোটিশ পিরিয়ড (2-Year Commitment & Notice Policy)
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-slate-800 text-justify">
          <li>
            <strong>ন্যূনতম ২ (দুই) বছরের চাকরির বাধ্যবাধকতা:</strong> যোগদানের তারিখ হতে কর্মচারী কমপক্ষে টানা ২ (দুই) বছর এই কোম্পানিতে নিয়মিত দায়িত্ব পালন করতে চুক্তিবদ্ধ ও অঙ্গীকারাবদ্ধ থাকবেন।
          </li>
          <li>
            <strong>জরুরি প্রয়োজন ও ৩ মাসের নোটিশ:</strong> কোনো অনাকাঙ্ক্ষিত জরুরি পরিস্থিতি বা অনিবার্য ব্যক্তিগত কারণে ২ বছর মেয়াদের মধ্যে চাকরি ছাড়তে বাধ্য হলে, কর্মচারীকে অবশ্যই কমপক্ষে ৩ (তিন) মাস পূর্বে কোম্পানি কর্তৃপক্ষ বরাবর লিখিত পদত্যাগপত্র জমা দিতে হবে। উক্ত লিখিত আবেদনে পদত্যাগের স্পষ্ট ও যথাযথ কারণ বিশদভাবে উল্লেখ করতে হবে।
          </li>
          <li>
            <strong>নোটিশের বিকল্প ক্ষতিপূরণ:</strong> কর্তৃপক্ষের লিখিত পূর্বানুমতি ছাড়া ৩ মাসের নির্ধারিত নোটিশ না দিয়ে চাকরি পরিত্যাগ করলে কর্মচারীকে ৩ (তিন) মাসের সমপরিমাণ মূল বেতন কোম্পানিকে ক্ষতিপূরণ হিসেবে প্রদান করতে হবে অথবা তা কর্মচারীর চূড়ান্ত পাওনা/বেতন হতে কেটে সমন্বয় করা হবে।
          </li>
          <li>
            <strong>কোম্পানি কর্তৃক অবসান ও তাৎক্ষণিক বরখাস্ত:</strong> শৃঙ্খলাভঙ্গ, অর্থ তছরুপ, চুরি, জালিয়াতি, তথ্য ফাঁস বা অসদাচরণের ক্ষেত্রে কোম্পানি যেকোনো সময় কোনো প্রকার নোটিশ বা ক্ষতিপূরণ ছাড়াই তাত্ক্ষণিকভাবে চাকরিচ্যুত করতে পারবে।
          </li>
        </ol>
      </div>

      {/* ৭. ব্যবসায়িক গোপনীয়তা, বুদ্ধিবৃত্তিক স্বত্ব ও আইনি ব্যবস্থা (NDA & Legal Action) */}
      <div className="space-y-1 bg-rose-50/60 border border-rose-200 p-2.5 rounded-md">
        <h3 className="font-bold text-xs text-rose-900 border-b border-rose-300 pb-0.5">
          ৭. ব্যবসায়িক গোপনীয়তা, বুদ্ধিবৃত্তিক স্বত্ব ও আইনি ব্যবস্থা (NDA & Legal Action)
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-slate-800 text-justify">
          <li>
            <strong>গোপনীয়তা রক্ষা (NDA):</strong> চাকরির মেয়াদকালীন অথবা চাকরি সমাপ্তির পরেও কর্মচারী কোম্পানির যেকোনো অভ্যন্তরীণ নথি, ক্লায়েন্ট তালিকা, ব্যবসায়িক কৌশল, পলিসি, সফটওয়্যার সোর্স কোড, ট্রেড সিক্রেট বা আর্থিক তথ্য কোনো তৃতীয় পক্ষের কাছে হস্তান্তর, প্রকাশ বা অপব্যবহার করতে পারবেন না।
          </li>
          <li>
            <strong>বাংলাদেশ সরকারের আইনে মামলা ও আইনি ব্যবস্থা:</strong> চাকরি চলাকালীন অথবা পরবর্তী সময়ে কোম্পানির কোনো বাণিজ্যিক তথ্য, মালিকানাধীন ডেটা বা গোপনীয়তা লঙ্ঘন/ফাঁস করলে তা বাংলাদেশ সরকারের প্রচলিত বাংলাদেশ শ্রম আইন, কপিরাইট আইন, ট্রেডমার্ক আইন এবং সাইবার নিরাপত্তা আইন/দণ্ডবিধির (Cyber Security & Penal Code of Bangladesh) আওতায় সরাসরি দণ্ডনীয় অপরাধ হিসেবে গণ্য হবে। কোম্পানি উক্ত কর্মচারীর বিরুদ্ধে দেশের উপযুক্ত আদালতে দেওয়ানি ক্ষতিপূরণ মামলা (Civil Lawsuit for Damages) ও ফৌজদারি মামলা (Criminal Case) দায়েরসহ সর্বোচ্চ আইনি পদক্ষেপ গ্রহণ করবে এবং আর্থিক ক্ষতি শতভাগ আদায় করবে।
          </li>
          <li>
            <strong>সম্পত্তি ও দায়িত্ব হস্তান্তর (Handover Policy):</strong> চাকরি সমাপ্তির পূর্বে কোম্পানির সকল সরঞ্জাম, ল্যাপটপ/ডিভাইস, কোড, ফাইল, পাসওয়ার্ড ও হিসাব-নিকাশ যথাযথভাবে বুঝিয়ে দিতে হবে। কোনো সম্পদ নষ্ট বা অসম্পূর্ণ থাকলে কর্মচারী ব্যক্তিগতভাবে দায়ী থাকবেন।
          </li>
          <li>
            <strong>স্বার্থের সংঘাত (Conflict of Interest):</strong> চাকরি চলাকালীন কর্তৃপক্ষের পূর্বানুমতি ছাড়া কর্মচারী একই ধরনের অন্য কোনো লাভজনক ব্যবসা বা প্রতিষ্ঠানে প্রত্যক্ষ কিংবা পরোক্ষভাবে যুক্ত হতে পারবেন না।
          </li>
        </ol>
      </div>

      {/* ৮. স্বাক্ষীগণের বিবরণ ও স্বাক্ষর (Witnesses Details) */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          ৮. স্বাক্ষীগণের বিবরণ ও স্বাক্ষর (Witnesses Details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] my-1">
          {/* ১ম পক্ষের সাক্ষী */}
          <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
              প্রথম পক্ষের সাক্ষী (নিয়োগকারী পক্ষ) :
            </span>
            <div><span className="text-slate-600 font-medium">নাম :</span> <span className="font-bold">{witnesses.firstWitnessName || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">ফোন নম্বর :</span> <span className="font-bold font-mono">{witnesses.firstWitnessPhone || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">ঠিকানা :</span> <span className="font-bold">{witnesses.firstWitnessAddress || '_________________________________'}</span></div>
            <div className="pt-3 mt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-slate-700">স্বাক্ষর : ___________________</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(১ম পক্ষের সাক্ষীর স্বাক্ষর)</span>
            </div>
          </div>

          {/* ২য় পক্ষের সাক্ষী */}
          <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
              দ্বিতীয় পক্ষের সাক্ষী (কর্মচারী পক্ষ) :
            </span>
            <div><span className="text-slate-600 font-medium">নাম :</span> <span className="font-bold">{witnesses.secondWitnessName || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">ফোন নম্বর :</span> <span className="font-bold font-mono">{witnesses.secondWitnessPhone || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">ঠিকানা :</span> <span className="font-bold">{witnesses.secondWitnessAddress || '_________________________________'}</span></div>
            <div className="pt-3 mt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-slate-700">স্বাক্ষর : ___________________</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(২য় পক্ষের সাক্ষীর স্বাক্ষর)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ৯. যৌথ ঘোষণা ও সম্মতি (Declaration & Signatures) */}
      <div className="space-y-3 pt-2">
        <div className="p-2.5 border border-slate-300 rounded-md bg-slate-100/70 text-slate-900 font-medium text-[10.5px] text-justify">
          <strong>যৌথ ঘোষণা ও সম্মতি:</strong> আমরা উভয় পক্ষ (নিয়োগকারী কর্তৃপক্ষ এবং কর্মচারী) এই চুক্তিপত্রের সকল শর্তাবলী সুস্থ মস্তিষ্কে মনোযোগ সহকারে পড়ে, বুঝে ও একমত হয়ে স্বেচ্ছায় নিচে স্বাক্ষর সম্পাদন করছি।
        </div>

        <div className="grid grid-cols-2 gap-8 pt-8 pb-2 text-[11px] items-end">
          {/* First Party Signature */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 pb-1 mb-1 flex items-center justify-between">
              <span className="font-bold text-slate-700">স্বাক্ষর :</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(১ম পক্ষ / নিয়োগকারীর স্বাক্ষর)</span>
            </div>
            <div className="font-bold text-xs text-slate-900">নিয়োগকারী / কর্তৃপক্ষের স্বাক্ষর ও সিল</div>
            <div><span className="text-slate-600">নাম:</span> <span className="font-bold">{data.parties?.employerName || 'মো: ইকরামুল হোসেন'}</span></div>
            <div><span className="text-slate-600">পদবী:</span> <span className="font-bold">ব্যবস্থাপনা পরিচালক / স্বত্বাধিকারী</span></div>
            <div><span className="text-slate-600">তারিখ:</span> <span className="font-bold">{currentDate}</span></div>
          </div>

          {/* Second Party Signature */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 pb-1 mb-1 flex items-center justify-between">
              <span className="font-bold text-slate-700">স্বাক্ষর :</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(২য় পক্ষ / কর্মচারীর স্বাক্ষর)</span>
            </div>
            <div className="font-bold text-xs text-slate-900">কর্মচারীর স্বাক্ষর ও টিপসই</div>
            <div><span className="text-slate-600">নাম:</span> <span className="font-bold">{data.parties?.employeeName || '________________________'}</span></div>
            <div><span className="text-slate-600">তারিখ:</span> <span className="font-bold">{currentDate}</span></div>
            <div><span className="text-slate-600">জাতীয় পরিচয়পত্র নং:</span> <span className="font-bold font-mono">{data.parties?.nidPassport || '________________________'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
