export const SAMPLE_INVOICE = {
  invoiceNo: "INV-2026-0842",
  issueDate: "2026-08-15",
  dueDate: "2026-08-30",
  paymentStatus: "Paid", // 'Paid' | 'Pending' | 'Overdue'
  currency: "BDT",
  taxRate: 5, // Tax percentage

  biller: {
    name: "MONSUR ALI TRAVELS & ENTERPRISE",
    subtitle: "Air Ticketing, Overseas Placement & Logistics Services",
    address: "House #12, Road #05, Block-C, Rampura",
    city: "Dhaka-1219, Bangladesh",
    phone: "+880 1712-345678",
    email: "billing@monsuralitravelsbd.com",
    binNo: "000492810-0201"
  },

  client: {
    name: "Apex Engineering & Construction Ltd.",
    contactPerson: "Engr. Mahmudul Hassan",
    address: "Plot #45, Industrial Zone, Gazipur",
    phone: "+880 1819-998877",
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

  paymentTerms: "Payment due within 15 days of invoice date. Bank Wire Transfer to Islami Bank Bangladesh, Rampura Branch. Account A/C: 2050-1849-019283."
};
