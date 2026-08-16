import agencyInfo from '../../../lib/information.json';

export function generateUniquePassportTrackingNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const getDigits = (len) => {
    let res = '';
    for (let i = 0; i < len; i++) res += Math.floor(Math.random() * 10);
    return res;
  };

  const prefixLetters = getChar() + getChar();
  const firstDigits = getDigits(4);
  const midLetter = getChar();
  const lastDigits = getDigits(3);

  return `PASS-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

export function getDefaultPassportData() {
  return {
    _id: null,
    trackingNo: generateUniquePassportTrackingNo(),
    submissionDate: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),

    agencyInfo: {
      name: agencyInfo.agencyName || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
      address: agencyInfo.address?.full || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'monsuralitravels@gmail.com',
      licenseNo: agencyInfo.licenseNo || 'RL-1842'
    },

    applicantName: '',
    nidBirthCertNo: '',
    previousPassportNo: '',
    applicantPhone: '',
    applicantEmail: '',
    address: '',

    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    relationship: 'পিতা',

    passportType: 'ই-পাসপোর্ট (E-Passport)',
    applicationCategory: 'নতুন আবেদন (New Passport)',
    pageCount: '৪৮ পৃষ্ঠা (48 Pages)',
    validityYears: '১০ বছর (10 Years)',
    deliverySpeed: 'সাধারণ (Regular)',

    documentsProvided: {
      nidCopy: true,
      birthCertOnline: false,
      oldPassportOriginal: false,
      photoLabPrint: true,
      guardianNidCopy: false,
      utilityBillCopy: false
    },

    remarks: '',
    status: 'pending'
  };
}
