export const SAMPLE_CHARACTER_CERTIFICATE = {
  memoNo: "CC/2026/0192",
  issueDate: new Date().toISOString().split("T")[0],
  language: "en", // 'en' | 'bn'
  certificateTitle: "CHARACTER CERTIFICATE",
  certificateSubtitle: "TO WHOM IT MAY CONCERN / চারিত্রিক সনদপত্র",

  // Issuing Authority / Organization (Fully Customizable)
  authority: {
    organizationName: "OFFICE OF THE WARD COUNCILLOR & LOCAL ADMINISTRATION",
    organizationSubtitle: "Ward No. 19, Municipal Corporation / Union Parishad",
    officeAddress: "Main Administrative Complex, Sunamganj-3060, Bangladesh",
    phone: "+880 1345-579534",
    email: "authority@sunamganj.gov.bd",
    logoUrl: "",
  },

  // Candidate Details
  candidate: {
    fullName: "MD. KAMRUL HASAN",
    fatherName: "MD. MOZAMMEL HOQUE",
    motherName: "MRS. ROKEYA BEGUM",
    passportNo: "A09182736",
    nidNo: "19952691580000881",
    birthDate: "1995-04-12",
    gender: "Male",
    maritalStatus: "Unmarried",
    presentAddress: "Vill: Mominpur, P.O: Jagannathpur, Dist: Sunamganj",
    permanentAddress: "Vill: Mominpur, P.O: Jagannathpur, Dist: Sunamganj",
  },

  // Certification Statement
  conduct: {
    knownYears: "10 (Ten)",
    statement:
      "This is to certify that MD. KAMRUL HASAN, Son of MD. MOZAMMEL HOQUE and MRS. ROKEYA BEGUM, a permanent resident of Vill: Mominpur, P.O: Jagannathpur, Dist: Sunamganj, bearing Passport No: A09182736 and NID: 19952691580000881, is personally known to me for the last 10 (Ten) years.",
    characterPraise:
      "To the best of my knowledge, belief, and local verification, he bears an excellent moral character, upright citizenship, and peaceful disposition. He has never been involved in any anti-social, criminal, subversive, or unlawful activities against the State or public order.",
    recommendation:
      "He is a law-abiding citizen of Bangladesh. I have no hesitation in recommending him for foreign employment, visa processing, higher studies, or any official placement. I wish him every peace, prosperity, and success in life.",
  },

  // Signatory
  signatory: {
    name: "AL-HAJ MD. ABDUR RAHIM",
    designation: "Elected Ward Councillor & Justice of the Peace",
    phone: "+880 1711-889900",
    sealText: "OFFICIAL WARD COUNCILLOR SEAL",
  },
};
