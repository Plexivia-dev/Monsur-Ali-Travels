export const SAMPLE_RESUME = {
  personalInfo: {
    fullName: "MD. IKRAMUL HOSSEN",
    title: "Senior Operations & Engineering Lead",
    email: "ikramul.hossen@monsuralitravelsbd.com",
    phone: "+880 1712-345678",
    location: "Dhaka, Bangladesh",
    summary: "Results-driven Engineering & Operations Specialist with over 8 years of experience leading cross-functional teams in industrial logistics, manufacturing systems, and overseas placement operations. Skilled in process optimization, resource allocation, and quality management.",
    avatarUrl: ""
  },
  experience: [
    {
      id: "exp-1",
      company: "Monsur Ali Travels & Logistics",
      role: "Operations Manager",
      location: "Dhaka",
      startDate: "2022-01",
      endDate: "Present",
      isCurrent: true,
      bullets: [
        "Directed daily workforce deployments for overseas technical manpower placements, achieving a 98% client satisfaction rate.",
        "Implemented streamlined client verification workflows, reducing onboarding lead times by 35%.",
        "Managed operational budgets and compliance standards across regional recruitment centers."
      ]
    },
    {
      id: "exp-2",
      company: "Apex Industrial Engineering",
      role: "Project Coordinator",
      location: "Gazipur",
      startDate: "2018-05",
      endDate: "2021-12",
      isCurrent: false,
      bullets: [
        "Supervised heavy machinery installation and maintenance protocols for automated production units.",
        "Optimized raw material supply chains, cutting operational downtime by 20% over 18 months."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Dhaka University of Engineering & Technology (DUET)",
      degree: "B.Sc. in Mechanical Engineering",
      fieldOfStudy: "Engineering",
      endDate: "2018"
    }
  ],
  skills: [
    { id: "sk-1", category: "Management & Strategy", items: ["Operations Leadership", "Supply Chain", "Resource Allocation", "Quality Assurance"] },
    { id: "sk-2", category: "Technical Skills", items: ["AutoCAD", "ERP Systems", "Data Analysis", "Safety Compliance"] }
  ],
  settings: {
    template: "modern-executive", // 'modern-executive' | 'classic-professional' | 'technical-minimal'
    accentColor: "#d87943"
  }
};
