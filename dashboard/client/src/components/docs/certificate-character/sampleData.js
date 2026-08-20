export function getDefaultCharacterCertificateData() {
  return {
    memoNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    language: "en", // 'en' | 'bn'
    certificateTitle: "CHARACTER CERTIFICATE",
    certificateSubtitle: "TO WHOM IT MAY CONCERN / চারিত্রিক সনদপত্র",

    // Issuing Authority / Organization
    authority: {
      organizationName: "",
      organizationSubtitle: "",
      officeAddress: "",
      phone: "",
      email: "",
      logoUrl: "",
    },

    // Candidate Details
    candidate: {
      fullName: "",
      fatherName: "",
      motherName: "",
      passportNo: "",
      nidNo: "",
      birthDate: "",
      gender: "Male",
      maritalStatus: "Unmarried",
      presentAddress: "",
      permanentAddress: "",
    },

    // Certification Statement
    conduct: {
      knownYears: "",
      statement: "",
      characterPraise: "",
      recommendation: "",
    },

    // Signatory
    signatory: {
      name: "",
      designation: "",
      phone: "",
      sealText: "",
    },
  };
}

export const SAMPLE_CHARACTER_CERTIFICATE = getDefaultCharacterCertificateData();
