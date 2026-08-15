import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { CandidateCaseFileModel } from "../src/models/candidateCaseFile.model.js";

const sampleCandidates = [
  {
    fileNumber: "MP-2026-8812",
    candidateName: "Md. Rafiqul Islam",
    candidateAge: 29,
    candidateGender: "Male",
    candidatePhone: "+8801712345678",
    candidateEmail: "rafiqul.islam@gmail.com",
    passportNumber: "A09823411",
    passportExpiry: "2029-08-15",
    tradeSkill: "Heavy Equipment Operator",
    experienceYears: 6,
    destinationCountry: "Saudi Arabia",
    destinationCountryCode: "SA",
    destinationCity: "Riyadh",
    workflowType: "destination_partner",
    client: {
      name: "Al-Bawardi Contracting",
      company: "Al-Bawardi Group",
      country: "Saudi Arabia",
      city: "Riyadh",
      email: "hr@albawardi.sa",
      phone: "+966114567890",
      contractRef: "CONT-SA-8812",
    },
    destinationAgency: {
      agencyName: "Gulf Horizon Recruitment Co.",
      country: "Saudi Arabia",
      licenseNo: "SA-LIC-4491",
      contactPerson: "Tariq Al-Mansoor",
      email: "tariq@gulfhorizon.sa",
      phone: "+966501234567",
      airportReceptionCity: "Riyadh (RUH)",
    },
    currentStepId: 3,
    steps: [
      { id: 1, title: "Candidate Profiling", status: "completed", targetDays: 7, description: "Skill verification & passport intake" },
      { id: 2, title: "Client Selection", status: "completed", targetDays: 10, description: "CV submission & job offer signed" },
      { id: 3, title: "Medical & Police Clearance", status: "in_progress", targetDays: 14, description: "GAMCA medical & PCC attestation" },
      { id: 4, title: "Visa Stamping", status: "pending", targetDays: 18, description: "Embassy attestation & work permit" },
      { id: 5, title: "Flight & Deployment", status: "pending", targetDays: 5, description: "Ticket issue & airport reception" },
    ],
    documents: [
      { id: "doc-1", name: "Original Passport", type: "passport", fileName: "passport_rafiqul.pdf", fileSize: "2.4 MB", uploadedAt: "2026-08-01", status: "verified" },
      { id: "doc-2", name: "GAMCA Medical Fit Report", type: "medical_fit", fileName: "medical_report_fit.pdf", fileSize: "1.8 MB", uploadedAt: "2026-08-10", status: "verified" },
      { id: "doc-3", name: "Police Clearance Certificate", type: "police_clearance", fileName: "pcc_mofa_attested.pdf", fileSize: "1.2 MB", uploadedAt: "2026-08-12", status: "pending_review" },
    ],
    casePriority: "high",
    expectedDeploymentDate: "2026-09-15",
    internalNotes: "Candidate passed Level-3 technical trade assessment in Dhaka.",
    isActive: true,
  },
  {
    fileNumber: "MP-2026-9104",
    candidateName: "Kamrul Hasan",
    candidateAge: 32,
    candidateGender: "Male",
    candidatePhone: "+8801819876543",
    candidateEmail: "kamrul.hasan@gmail.com",
    passportNumber: "B04419283",
    passportExpiry: "2030-03-22",
    tradeSkill: "Industrial Electrician",
    experienceYears: 8,
    destinationCountry: "UAE (Dubai)",
    destinationCountryCode: "AE",
    destinationCity: "Dubai",
    workflowType: "direct_client",
    client: {
      name: "Arabtec Engineering LLC",
      company: "Arabtec Group",
      country: "UAE",
      city: "Dubai",
      email: "recruitment@arabtec.ae",
      phone: "+97143219876",
      contractRef: "CONT-UAE-9104",
    },
    currentStepId: 4,
    steps: [
      { id: 1, title: "Candidate Profiling", status: "completed", targetDays: 7, description: "Skill verification & passport intake" },
      { id: 2, title: "Client Selection", status: "completed", targetDays: 10, description: "CV submission & job offer signed" },
      { id: 3, title: "Medical & Police Clearance", status: "completed", targetDays: 14, description: "GAMCA medical & PCC attestation" },
      { id: 4, title: "Visa Stamping", status: "in_progress", targetDays: 18, description: "Embassy attestation & work permit" },
      { id: 5, title: "Flight & Deployment", status: "pending", targetDays: 5, description: "Ticket issue & airport reception" },
    ],
    documents: [
      { id: "doc-10", name: "Original Passport", type: "passport", fileName: "passport_kamrul.pdf", fileSize: "3.1 MB", uploadedAt: "2026-07-20", status: "verified" },
      { id: "doc-11", name: "Dubai Employment Visa", type: "work_permit_visa", fileName: "work_permit_dubai.pdf", fileSize: "1.5 MB", uploadedAt: "2026-08-14", status: "verified" },
    ],
    casePriority: "urgent",
    expectedDeploymentDate: "2026-09-01",
    internalNotes: "Direct corporate allocation for Dubai Metro expansion project.",
    isActive: true,
  },
  {
    fileNumber: "MP-2026-7731",
    candidateName: "Sharmin Sultana",
    candidateAge: 27,
    candidateGender: "Female",
    candidatePhone: "+8801612345678",
    candidateEmail: "sharmin.sultana@gmail.com",
    passportNumber: "EF9921043",
    passportExpiry: "2028-11-05",
    tradeSkill: "Registered Nurse / Caregiver",
    experienceYears: 4,
    destinationCountry: "Qatar",
    destinationCountryCode: "QA",
    destinationCity: "Doha",
    workflowType: "outsourced_local",
    localAgency: {
      isOutsourced: true,
      subAgencyName: "Sylhet Overseas Recruitment Agency",
      licenseNo: "RL-1294",
      contactPerson: "Mahbubur Rahman",
      email: "info@sylhetoverseas.bd",
      phone: "+8801711998877",
      commissionAgreement: "15,000 BDT per candidate",
    },
    currentStepId: 2,
    steps: [
      { id: 1, title: "Candidate Profiling", status: "completed", targetDays: 7, description: "Skill verification & passport intake" },
      { id: 2, title: "Client Selection", status: "in_progress", targetDays: 10, description: "CV submission & job offer signed" },
      { id: 3, title: "Medical & Police Clearance", status: "pending", targetDays: 14, description: "GAMCA medical & PCC attestation" },
      { id: 4, title: "Visa Stamping", status: "pending", targetDays: 18, description: "Embassy attestation & work permit" },
      { id: 5, title: "Flight & Deployment", status: "pending", targetDays: 5, description: "Ticket issue & airport reception" },
    ],
    documents: [
      { id: "doc-20", name: "Original Passport", type: "passport", fileName: "passport_sharmin.pdf", fileSize: "2.9 MB", uploadedAt: "2026-08-05", status: "verified" },
      { id: "doc-21", name: "Nursing License & Degree", type: "trade_certificate", fileName: "nursing_degree_attested.pdf", fileSize: "4.2 MB", uploadedAt: "2026-08-06", status: "verified" },
    ],
    casePriority: "normal",
    expectedDeploymentDate: "2026-10-10",
    internalNotes: "Outsourced through Sylhet sub-agency partner.",
    isActive: true,
  },
  {
    fileNumber: "MP-2026-6419",
    candidateName: "Jahangir Alam",
    candidateAge: 35,
    candidateGender: "Male",
    candidatePhone: "+8801512345678",
    candidateEmail: "jahangir.alam@gmail.com",
    passportNumber: "C08129841",
    passportExpiry: "2031-01-14",
    tradeSkill: "Pipe Welder (6G)",
    experienceYears: 10,
    destinationCountry: "Oman",
    destinationCountryCode: "OM",
    destinationCity: "Muscat",
    workflowType: "destination_partner",
    destinationAgency: {
      agencyName: "Al-Maha Placement Services",
      country: "Oman",
      licenseNo: "OM-LIC-209",
      contactPerson: "Said Al-Harthy",
      email: "said@almaha.om",
      phone: "+96891234567",
      airportReceptionCity: "Muscat (MCT)",
    },
    currentStepId: 5,
    steps: [
      { id: 1, title: "Candidate Profiling", status: "completed", targetDays: 7, description: "Skill verification & passport intake" },
      { id: 2, title: "Client Selection", status: "completed", targetDays: 10, description: "CV submission & job offer signed" },
      { id: 3, title: "Medical & Police Clearance", status: "completed", targetDays: 14, description: "GAMCA medical & PCC attestation" },
      { id: 4, title: "Visa Stamping", status: "completed", targetDays: 18, description: "Embassy attestation & work permit" },
      { id: 5, title: "Flight & Deployment", status: "in_progress", targetDays: 5, description: "Ticket issue & airport reception" },
    ],
    documents: [
      { id: "doc-30", name: "Original Passport", type: "passport", fileName: "passport_jahangir.pdf", fileSize: "2.7 MB", uploadedAt: "2026-06-10", status: "verified" },
      { id: "doc-31", name: "Flight Ticket Muscat", type: "flight_ticket", fileName: "ticket_oman_air.pdf", fileSize: "0.8 MB", uploadedAt: "2026-08-14", status: "verified" },
    ],
    casePriority: "urgent",
    expectedDeploymentDate: "2026-08-22",
    internalNotes: "6G Welder for Petroleum Development Oman (PDO) project.",
    isActive: true,
  },
  {
    fileNumber: "MP-2026-5290",
    candidateName: "Abul Kalam",
    candidateAge: 31,
    candidateGender: "Male",
    candidatePhone: "+8801912345678",
    candidateEmail: "abul.kalam@gmail.com",
    passportNumber: "D09123847",
    passportExpiry: "2029-05-30",
    tradeSkill: "Duct Fabricator & HVAC Tech",
    experienceYears: 7,
    destinationCountry: "Malaysia",
    destinationCountryCode: "MY",
    destinationCity: "Kuala Lumpur",
    workflowType: "direct_client",
    client: {
      name: "Top Glove Engineering Sdn Bhd",
      company: "Top Glove Corp",
      country: "Malaysia",
      city: "Kuala Lumpur",
      email: "hr@topglove.com.my",
      phone: "+60351911188",
      contractRef: "CONT-MY-5290",
    },
    currentStepId: 1,
    steps: [
      { id: 1, title: "Candidate Profiling", status: "in_progress", targetDays: 7, description: "Skill verification & passport intake" },
      { id: 2, title: "Client Selection", status: "pending", targetDays: 10, description: "CV submission & job offer signed" },
      { id: 3, title: "Medical & Police Clearance", status: "pending", targetDays: 14, description: "GAMCA medical & PCC attestation" },
      { id: 4, title: "Visa Stamping", status: "pending", targetDays: 18, description: "Embassy attestation & work permit" },
      { id: 5, title: "Flight & Deployment", status: "pending", targetDays: 5, description: "Ticket issue & airport reception" },
    ],
    documents: [
      { id: "doc-40", name: "Original Passport", type: "passport", fileName: "passport_kalam.pdf", fileSize: "3.0 MB", uploadedAt: "2026-08-14", status: "verified" },
    ],
    casePriority: "normal",
    expectedDeploymentDate: "2026-11-15",
    internalNotes: "HVAC Specialist for manufacturing plant.",
    isActive: true,
  },
];

async function seedCandidates() {
  await connectDatabase();
  try {
    for (const c of sampleCandidates) {
      const existing = await CandidateCaseFileModel.findOne({ fileNumber: c.fileNumber });
      if (existing) {
        Object.assign(existing, c);
        await existing.save();
        console.log(`✅ Updated existing candidate case file: ${c.fileNumber} (${c.candidateName})`);
      } else {
        await CandidateCaseFileModel.create(c);
        console.log(`✅ Created candidate case file: ${c.fileNumber} (${c.candidateName})`);
      }
    }
    console.log("🎉 All sample candidate case files seeded successfully!");
  } catch (err) {
    console.error("❌ Candidate seeding error:", err);
  } finally {
    await closeDatabase();
  }
}

seedCandidates();
