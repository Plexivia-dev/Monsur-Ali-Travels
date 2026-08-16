export const SAMPLE_INVOICE = {
  invoiceNo: "INV-2026-0842",
  issueDate: "2026-08-16",
  dueDate: "2026-08-30",
  paymentStatus: "Paid", // 'Paid' | 'Pending' | 'Overdue'
  currency: "BDT",
  taxRate: 5, // Tax percentage

  biller: {
    name: "MANSUR ALI TOURS & TRAVELS",
    subtitle: "Air Ticketing, Overseas Placement & Logistics Services",
    address: "Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh",
    city: "Sunamganj, Sylhet, Bangladesh",
    phone: "+8801345579534",
    email: "monsuralitravels@gmail.com",
    binNo: "RL-1842"
  },

  client: {
    name: "Apex Engineering & Construction Ltd.",
    contactPerson: "Engr. Mahmudul Hassan",
    address: "Plot #45, Industrial Zone, Gazipur",
    phone: "+8801819998877",
    email: "accounts@apexengineering.bd"
  },

  items: [
    {
      id: "item-1",
      description: "Overseas Manpower Processing & Placement Fee (Batch #42)",
      quantity: 5,
      unitPrice: 45000
    },
    {
      id: "item-2",
      description: "Air Ticket Reservation & Flight Coordination (Dhaka - Jeddah)",
      quantity: 5,
      unitPrice: 65000
    },
    {
      id: "item-3",
      description: "Medical Clearance & Biometric Documentation Service",
      quantity: 5,
      unitPrice: 8500
    }
  ],

  paymentTerms: "Payment due within 15 days of invoice date. Bank Wire Transfer to Islami Bank Bangladesh. Account A/C: 2050-1849-019283."
};
