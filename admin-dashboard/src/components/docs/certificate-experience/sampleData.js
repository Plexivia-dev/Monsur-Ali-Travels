export const SAMPLE_EXPERIENCE_CERTIFICATE = {
  memoNo: "EXP/2026/0482",
  issueDate: new Date().toISOString().split("T")[0],
  language: "en", // 'en' | 'bn'
  certificateTitle: "TO WHOM IT MAY CONCERN",
  certificateSubtitle: "EXPERIENCE & SERVICE CERTIFICATE",

  // Issuing Organization (Fully Customizable for any company)
  company: {
    name: "AL-MADINA CONSTRUCTION & ENGINEERING LTD.",
    subtitle: "Civil Construction, Structural Works & Heavy Engineering",
    address: "Plot #42, Industrial Area, Tejgaon, Dhaka-1208, Bangladesh",
    phone: "+880 2-9887766, +880 1711-223344",
    email: "info@almadinaconstruction.com",
    website: "www.almadinaconstruction.com",
    registrationNo: "REG-C-89241/2018",
    logoUrl: "", // optional custom logo
  },

  // Employee Information
  employee: {
    fullName: "MD. JAHIDUL ISLAM",
    fatherName: "MD. ABDUL MALEK",
    passportNo: "A08924182",
    nidNo: "19922691580000492",
    designation: "Senior Construction Carpenter & Shuttering Specialist",
    department: "Civil & Structural Engineering Dept.",
    employmentType: "Full-Time Permanent",
    startDate: "2019-01-15",
    endDate: "2024-06-30",
    totalDuration: "5 Years 5 Months",
    salaryGrade: "Grade-A Technical Staff",
  },

  // Certificate Statement & Conduct Text
  content: {
    statement:
      "This is to certify that MD. JAHIDUL ISLAM, Son of MD. ABDUL MALEK, bearing Passport No: A08924182, was a bona fide employee of AL-MADINA CONSTRUCTION & ENGINEERING LTD. from January 15, 2019 to June 30, 2024. During his tenure with us, he served as a Senior Construction Carpenter & Shuttering Specialist with high dedication, technical competency, and professional diligence.",
    dutiesResponsibilities:
      "His primary responsibilities included reading structural drawings, formwork installation, shuttering fabrication, concrete framework alignment, scaffolding safety compliance, and mentoring junior craftsmen.",
    conductReview:
      "During his service period, we found him hardworking, honest, punctual, and disciplined. He bears good moral conduct and has no adverse record in our company. We have no objection to his pursuing employment abroad, and we wish him all success in his future endeavors.",
  },

  // Signatory & Authority
  signatory: {
    name: "ENGR. TARIQUL ISLAM",
    designation: "Head of Human Resources & Operations",
    phone: "+880 1712-334455",
    sealText: "AUTHORIZED COMPANY SEAL",
  },
};
