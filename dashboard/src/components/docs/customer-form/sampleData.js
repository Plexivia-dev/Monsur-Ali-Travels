export function generateApplicationNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CGA-${getChar()}${getChar()}-${num}`;
}

export const SERVICE_TYPES = [
  'ইন্ডিয়ান ভিসা (Indian Visa Application)',
  'ওয়ার্ক পারমিট / জব ভিসা (Work Permit & Job Placement)',
  'ট্যুরিস্ট / ভিজিট ভিসা (Tourist / Visit Visa)',
  'পাসপোর্ট রিনিউ / সংশোধন (Passport Services)',
  'উমরাহ প্যাকেজ (Umrah Processing)',
  'এয়ার টিকিট বুকিং (Air Ticket)',
  'অন্যান্য কনস্যুলার সেবা (Other Consular Services)'
];

export const STATUS_OPTIONS = [
  { id: 'received', label: 'File Received (ফাইল গ্রহণ করা হয়েছে)', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  { id: 'under_review', label: 'Under Verification (কাগজপত্র যাচাই হচ্ছে)', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  { id: 'processing', label: 'Processing (প্রসেসিং চলছে)', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
  { id: 'embassy_submitted', label: 'Submitted to Embassy/VFS (জমা দেওয়া হয়েছে)', color: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30' },
  { id: 'approved', label: 'Visa/File Approved (অনুমোদিত / প্রস্তুত)', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  { id: 'delivered', label: 'Delivered to Customer (ডেলিভারি সম্পন্ন)', color: 'bg-teal-500/15 text-teal-600 border-teal-500/30' },
  { id: 'rejected', label: 'Rejected / Cancelled (বাতিল / রিজেক্টেড)', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' }
];

export function getDefaultCustomerGuardianData() {
  return {
    _id: null,
    applicationNo: generateApplicationNo(),
    dateReceived: new Date().toISOString().split('T')[0],
    verifiedBy: '',
    serviceType: 'ইন্ডিয়ান ভিসা (Indian Visa Application)',
    status: 'received',
    customer: {
      fullName: '',
      nidNumber: '',
      passportNumber: '',
      countryRejected: '',
      fatherName: '',
      motherName: '',
      mobileNumber: '',
      email: ''
    },
    guardian: {
      fullName: '',
      nidNumber: '',
      fatherName: '',
      motherName: '',
      mobileNumber: '',
      email: '',
      address: '',
      relationship: ''
    },
    requirementDocuments: [
      { id: 1, name: 'Indian Size 2 × 2 Photograph', submitted: 'Yes', remarks: '' },
      { id: 2, name: 'House Registration Certificate', submitted: 'Yes', remarks: '' },
      { id: 3, name: 'Trade License', submitted: 'No', remarks: '' },
      { id: 4, name: 'House Current Bill Paper', submitted: 'Yes', remarks: '' },
      { id: 5, name: 'Bank Statement', submitted: 'Yes', remarks: '' },
      { id: 6, name: "Father's NID Card", submitted: 'Yes', remarks: '' },
      { id: 7, name: "Mother's NID Card", submitted: 'Yes', remarks: '' },
      { id: 8, name: "Customer's Own NID Card", submitted: 'Yes', remarks: '' }
    ],
    payment: {
      totalAmount: '',
      advancePaid: '',
      dueAmount: '',
      paymentMethod: 'Cash',
      paymentStatus: 'Unpaid',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNo: ''
    },
    attachments: {
      passportPhoto: '',
      passportScan: '',
      nidScan: '',
      otherFiles: []
    },
    officeNotes: '',
    activityLogs: [],
    declarationDate: new Date().toISOString().split('T')[0]
  };
}
