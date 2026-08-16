import agencyInfo from '../../../lib/information.json';

export function generateUniqueIndianVisaTrackingNo() {
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

  return `IVISA-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

export function getDefaultIndianVisaData() {
  return {
    _id: null,
    trackingNo: '',
    submissionDate: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),

    agencyInfo: {
      name: agencyInfo.agencyName || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
      address: agencyInfo.address?.full || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'monsuralitravels@gmail.com',
      licenseNo: agencyInfo.licenseNo || 'RL-1842'
    },

    applicantName: '',
    passportNo: '',
    nidBirthCertNo: '',
    applicantPhone: '',
    applicantEmail: '',
    address: '',

    visaType: 'ট্যুরিস্ট ভিসা (Tourist Visa)',
    entryPort: 'হরিদাসপুর / গেদে (Haridaspur / Gede)',
    durationMonths: '১ বছর (1 Year Multiple)',
    entryType: 'মাল্টিপল এন্ট্রি (Multiple Entry)',

    documentsProvided: {
      passportOriginal: true,
      nidCopy: true,
      photoLabPrint: true,
      bankSolvency: false,
      utilityBillCopy: true,
      previousVisaCopy: false,
      nocTradeLicense: false
    },

    remarks: '',
    status: 'pending'
  };
}

export const SAMPLE_INDIAN_VISA = getDefaultIndianVisaData();
