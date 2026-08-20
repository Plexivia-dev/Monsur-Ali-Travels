export const SAMPLE_MARRIAGE_CERTIFICATE = {
  memoNo: "MC/2026/0319",
  issueDate: new Date().toISOString().split("T")[0],
  marriageDate: "2021-11-20",
  marriagePlace: "Mominpur, Jagannathpur, Sunamganj, Bangladesh",
  volumeNo: "Vol-IV/2021",
  pageNo: "Page #48, Serial #12",
  certificateTitle: "MARRIAGE CERTIFICATE",
  certificateSubtitle: "OFFICIAL MARITAL STATUS & NIKAHNAMA EXTRACT (বিবাহ প্রত্যয়নপত্র)",

  // Issuing Authority / Registrar / Kazi Office
  registrar: {
    officeName: "OFFICE OF THE MUSLIM MARRIAGE REGISTRAR & KAZI",
    officeSubtitle: "Government of the People's Republic of Bangladesh",
    jurisdiction: "Ward #04, Jagannathpur Municipality, Sunamganj",
    officeAddress: "Court Road, Jagannathpur, Sunamganj-3060",
    phone: "+880 1711-224466",
    email: "kazi.office.jnp@gmail.com",
    govLicenseNo: "KAZI-LIC-3891/2012",
    kaziName: "KAZI MAULANA MD. NURUL ISLAM",
  },

  // Groom Details (বর)
  groom: {
    name: "MD. TARIQUL ISLAM",
    fatherName: "MD. ABDUR RAHMAN",
    motherName: "MRS. SALEHA BEGUM",
    passportNo: "A07891234",
    nidNo: "19932691580000412",
    birthDate: "1993-05-14",
    maritalStatusPrior: "Unmarried",
    religion: "Islam (Sunni)",
    address: "Vill: Mominpur, P.O: Jagannathpur, Dist: Sunamganj, Bangladesh",
  },

  // Bride Details (কনে)
  bride: {
    name: "MST. NASRIN AKTER",
    fatherName: "MD. DELWAR HOSSAIN",
    motherName: "MRS. JAHANARA BEGUM",
    passportNo: "A09124567",
    nidNo: "19962691580000921",
    birthDate: "1996-08-22",
    maritalStatusPrior: "Unmarried",
    religion: "Islam (Sunni)",
    address: "Vill: Syedpur, P.O: Jagannathpur, Dist: Sunamganj, Bangladesh",
  },

  // Dower & Witnesses
  marriageTerms: {
    dowerAmount: "500,000",
    dowerAmountInWords: "Five Hundred Thousand Taka Only",
    dowerPaid: "200,000",
    dowerDeferred: "300,000",
    witness1: "MD. ANWARUL HOQUE, NID: 19802691580000111",
    witness2: "MD. SHAHJAHAN MIAH, NID: 19852691580000222",
    wakilName: "MD. DELWAR HOSSAIN (Father of Bride)",
  },

  // Official Statement
  declaration: {
    statement:
      "This is to solemnly certify that the marriage between the above-named Groom (MD. TARIQUL ISLAM) and Bride (MST. NASRIN AKTER) was duly solemnized according to Muslim Sharia Law and registered under the Muslim Marriages and Divorces (Registration) Act, 1974.",
    livingStatus:
      "According to our official register and local verification, they have been living together peacefully as legally wedded husband and wife since the date of their marriage without any legal separation or dispute.",
  },
};
