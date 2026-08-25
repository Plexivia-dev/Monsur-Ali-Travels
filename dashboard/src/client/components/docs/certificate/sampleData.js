export function getDefaultCertificateData() {
  return {
    memoNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    language: "bn", // 'bn' | 'en'
    candidate: {
      fullName: "",
      fullNameEn: "",
      fatherName: "",
      motherName: "",
      passportNo: "",
      nidNo: "",
      village: "",
      postOffice: "",
      upazila: "",
      district: ""
    },
    conduct: {
      durationYears: "",
      statementBn: "এই মর্মে প্রত্যয়ন করা যাইতেছে যে, তিনি আমাদের জানা মতে একজন সৎ, চরিত্রবান ও সুনাগরিক। তাঁহার বিরুদ্ধে সমাজ বা রাষ্ট্রবিরোধী কোনো কর্মকাণ্ডের তথ্য বা অভিযোগ পাওয়া যায় নাই। আমরা তাঁহার সর্বাঙ্গীন সাফল্য ও উজ্জ্বল ভবিষ্যৎ কামনা করি।",
      statementEn: "This is to certify that to the best of our knowledge and belief, he/she bears good moral character and is a law-abiding citizen. He/she has not been involved in any activity subverting state or public discipline."
    },
    authority: {
      organizationName: "মেসার্স মনসুর আলী ট্রাভেলস",
      organizationSubtitle: "গভঃ অনুমোদিত রিক্রুটিং এজেন্সী ও এয়ার টিকেটিং সার্ভিস",
      issuingPersonName: "",
      designation: "ব্যবস্থাপনা পরিচালক / প্রোপ্রাইটর",
      officeAddress: ""
    }
  };
}

export const SAMPLE_CERTIFICATE = getDefaultCertificateData();
