// Comprehensive Seed Data for Smart ERP

export const initialFactoryData = {
  metrics: {
    dailyMoldedBricks: 42500,
    dailyTarget: 45000,
    coalStockTons: 18.4,
    coalThresholdTons: 20.0,
    truckloadDeliveries: 14,
    claySoilInventoryTons: 145.0,
    activeKilns: 3,
    kilnTemperatureAvg: '1,050°C',
    dailyWagesPaid: '$3,850',
    monthlyProductionTotal: 1250000,
    defectiveRate: '1.2%'
  },
  productionBatches: [
    { id: 'BATCH-892', type: 'Red Clay Solid Brick', quantity: 15000, kilnId: 'Kiln A', status: 'Firing', progress: 85, supervisor: 'Ramesh Kumar' },
    { id: 'BATCH-893', type: 'Fly Ash Brick', quantity: 12000, kilnId: 'Kiln B', status: 'Molding', progress: 45, supervisor: 'Suresh Patel' },
    { id: 'BATCH-894', type: 'Perforated Hollow Brick', quantity: 8000, kilnId: 'Kiln C', status: 'Cooling', progress: 95, supervisor: 'Mohan Lal' },
    { id: 'BATCH-895', type: 'Fire Clay Brick', quantity: 7500, kilnId: 'Kiln A', status: 'Queued', progress: 0, supervisor: 'Ramesh Kumar' }
  ],
  employees: [
    { id: 'EMP-F01', name: 'Ramesh Kumar', role: 'Kiln Supervisor', type: 'Full-Time', dailyWage: 120, attendanceDays: 26, status: 'Active', shift: 'Day', phone: '+1 555-0192', assignedSection: 'Kiln A & C' },
    { id: 'EMP-F02', name: 'Suresh Patel', role: 'Molding Master', type: 'Full-Time', dailyWage: 110, attendanceDays: 25, status: 'Active', shift: 'Day', phone: '+1 555-0184', assignedSection: 'Molding Bay 1' },
    { id: 'EMP-F03', name: 'Mohan Lal', role: 'Kiln Fireman', type: 'Daily Wage', dailyWage: 85, attendanceDays: 22, status: 'Active', shift: 'Night', phone: '+1 555-0173', assignedSection: 'Kiln B' },
    { id: 'EMP-F04', name: 'Vikram Singh', role: 'Clay Loader Operator', type: 'Contract', dailyWage: 95, attendanceDays: 24, status: 'Active', shift: 'Day', phone: '+1 555-0161', assignedSection: 'Raw Material Yard' },
    { id: 'EMP-F05', name: 'Anil Verma', role: 'Haulage Driver', type: 'Daily Wage', dailyWage: 90, attendanceDays: 20, status: 'On Leave', shift: 'Day', phone: '+1 555-0158', assignedSection: 'Logistics Fleet' },
    { id: 'EMP-F06', name: 'Sunil Sharma', role: 'Quality Inspector', type: 'Full-Time', dailyWage: 130, attendanceDays: 26, status: 'Active', shift: 'Day', phone: '+1 555-0142', assignedSection: 'Sorting & QA' }
  ],
  bills: [
    { id: 'BILL-FB01', vendor: 'Coal India Supplies Ltd.', category: 'Raw Coal', amount: 14200, date: '2026-08-01', dueDate: '2026-08-15', status: 'Paid', items: '25 Tons Anthracite Coal' },
    { id: 'BILL-FB02', vendor: 'EarthMovers Clay Quarry', category: 'Soil/Clay Material', amount: 8400, date: '2026-08-05', dueDate: '2026-08-20', status: 'Pending', items: '120 Truckloads Red Soil' },
    { id: 'BILL-FB03', vendor: 'National Haulage Corp', category: 'Freight & Transport', amount: 3100, date: '2026-08-08', dueDate: '2026-08-18', status: 'Paid', items: '14 Truckload Bricks Dispatched' },
    { id: 'BILL-FB04', vendor: 'Apex Power Grid', category: 'Electricity & Utilities', amount: 5600, date: '2026-08-10', dueDate: '2026-08-25', status: 'Pending', items: 'Industrial High Voltage Bill' },
    { id: 'BILL-FB05', vendor: 'Universal Spares & Lubricants', category: 'Maintenance', amount: 1850, date: '2026-08-11', dueDate: '2026-08-28', status: 'Overdue', items: 'Hydraulic Press Seals & Oil' }
  ],
  payments: [
    { id: 'PAY-FP01', recipient: 'Daily Kiln Workers (32 staff)', category: 'Weekly Wage Payout', amount: 6400, date: '2026-08-07', method: 'Cash / Direct Ledger', status: 'Completed', ref: 'WAGE-WK31' },
    { id: 'PAY-FP02', recipient: 'Coal India Supplies Ltd.', category: 'Vendor Settlement', amount: 14200, date: '2026-08-02', method: 'Bank Transfer', status: 'Completed', ref: 'FT-994201' },
    { id: 'PAY-FP03', recipient: 'National Haulage Corp', category: 'Transport Payment', amount: 3100, date: '2026-08-09', method: 'UPI / Online', status: 'Completed', ref: 'TXN-882104' },
    { id: 'PAY-FP04', recipient: 'EarthMovers Clay Quarry', category: 'Raw Material Payout', amount: 8400, date: '2026-08-18', method: 'Bank Wire', status: 'Scheduled', ref: 'SCH-10029' },
    { id: 'PAY-FP05', recipient: 'Equipment Servicing Vendor', category: 'Maintenance Advance', amount: 950, date: '2026-08-12', method: 'Check', status: 'Processing', ref: 'CHK-00412' }
  ],
  reports: {
    monthlyProduction: [
      { month: 'Jan', produced: 980000, target: 1000000, coalCost: 32000, wages: 48000 },
      { month: 'Feb', produced: 1050000, target: 1000000, coalCost: 34000, wages: 51000 },
      { month: 'Mar', produced: 1120000, target: 1100000, coalCost: 36000, wages: 53000 },
      { month: 'Apr', produced: 1200000, target: 1100000, coalCost: 39000, wages: 56000 },
      { month: 'May', produced: 1180000, target: 1200000, coalCost: 38000, wages: 55000 },
      { month: 'Jun', produced: 1220000, target: 1200000, coalCost: 40000, wages: 58000 },
      { month: 'Jul', produced: 1250000, target: 1250000, coalCost: 41000, wages: 60000 }
    ],
    costDistribution: [
      { name: 'Kiln Workers Wage', value: 42, color: '#3b82f6' },
      { name: 'Coal & Fuel', value: 28, color: '#f59e0b' },
      { name: 'Clay & Red Soil', value: 16, color: '#10b981' },
      { name: 'Freight & Logistics', value: 9, color: '#8b5cf6' },
      { name: 'Kiln Maintenance', value: 5, color: '#ec4899' }
    ]
  }
};

export const initialAgencyData = {
  metrics: {
    activePlacedWorkers: 184,
    totalContracts: 28,
    unbilledHours: 1420,
    agencyMarginPercent: 18.5,
    weeklyBillingTotal: '$68,400',
    placedWorkerGrowth: '+12%',
    fulfilledPositions: 94,
    pendingRequisitions: 12
  },
  clientContracts: [
    { id: 'CONT-101', clientName: 'Metro Builders & Infra', industry: 'Construction', workersDeployed: 45, hourlyRate: 28, margin: '20%', status: 'Active' },
    { id: 'CONT-102', clientName: 'Apex Logistics Hub', industry: 'Warehousing', workersDeployed: 38, hourlyRate: 24, margin: '18%', status: 'Active' },
    { id: 'CONT-103', clientName: 'Global Tech Park Facility', industry: 'Facility Mgt', workersDeployed: 26, hourlyRate: 22, margin: '17.5%', status: 'Active' },
    { id: 'CONT-104', clientName: 'Summit Manufacturing Ltd', industry: 'Industrial Assembly', workersDeployed: 52, hourlyRate: 30, margin: '19%', status: 'Active' },
    { id: 'CONT-105', clientName: 'Harbor Freight Terminals', industry: 'Dock Operations', workersDeployed: 23, hourlyRate: 32, margin: '19.5%', status: 'Review' }
  ],
  employees: [
    { id: 'EMP-A01', name: 'David Miller', role: 'Forklift Operator', client: 'Apex Logistics Hub', hourlyPay: 18, billRate: 24, hoursThisWeek: 42, status: 'Deployed', phone: '+1 555-0211' },
    { id: 'EMP-A02', name: 'Sarah Jenkins', role: 'Site Safety Inspector', client: 'Metro Builders', hourlyPay: 22, billRate: 28, hoursThisWeek: 40, status: 'Deployed', phone: '+1 555-0222' },
    { id: 'EMP-A03', name: 'Carlos Mendez', role: 'Assembly Line Tech', client: 'Summit Manufacturing', hourlyPay: 20, billRate: 30, hoursThisWeek: 45, status: 'Deployed', phone: '+1 555-0233' },
    { id: 'EMP-A04', name: 'Emily Zhang', role: 'Warehouse Specialist', client: 'Apex Logistics Hub', hourlyPay: 17, billRate: 23, hoursThisWeek: 38, status: 'Deployed', phone: '+1 555-0244' },
    { id: 'EMP-A05', name: 'Michael Brown', role: 'Electrical Installer', client: 'Global Tech Park', hourlyPay: 25, billRate: 35, hoursThisWeek: 0, status: 'Bench', phone: '+1 555-0255' },
    { id: 'EMP-A06', name: 'James Wilson', role: 'Heavy Rigging Crew', client: 'Harbor Freight', hourlyPay: 24, billRate: 32, hoursThisWeek: 40, status: 'Deployed', phone: '+1 555-0266' }
  ],
  bills: [
    { id: 'INV-AG01', client: 'Metro Builders & Infra', amount: 24600, date: '2026-08-01', dueDate: '2026-08-15', status: 'Paid', hoursBilled: 880, period: 'July W3-W4' },
    { id: 'INV-AG02', client: 'Apex Logistics Hub', amount: 18200, date: '2026-08-03', dueDate: '2026-08-17', status: 'Pending', hoursBilled: 758, period: 'July W3-W4' },
    { id: 'INV-AG03', client: 'Summit Manufacturing Ltd', amount: 31200, date: '2026-08-05', dueDate: '2026-08-20', status: 'Paid', hoursBilled: 1040, period: 'July W3-W4' },
    { id: 'INV-AG04', client: 'Global Tech Park Facility', amount: 11400, date: '2026-08-08', dueDate: '2026-08-22', status: 'Pending', hoursBilled: 518, period: 'July W3-W4' },
    { id: 'INV-AG05', client: 'Harbor Freight Terminals', amount: 14700, date: '2026-07-20', dueDate: '2026-08-04', status: 'Overdue', hoursBilled: 460, period: 'July W1-W2' }
  ],
  payments: [
    { id: 'PAY-AP01', recipient: 'Contractor Weekly Payroll (184 workers)', category: 'Worker Payout', amount: 48200, date: '2026-08-08', method: 'Direct Deposit', status: 'Completed', ref: 'PAYROLL-WK31' },
    { id: 'PAY-AP02', recipient: 'Metro Builders & Infra', category: 'Client Remittance', amount: 24600, date: '2026-08-04', method: 'ACH Wire', status: 'Completed', ref: 'ACH-789012' },
    { id: 'PAY-AP03', recipient: 'Summit Manufacturing Ltd', category: 'Client Remittance', amount: 31200, date: '2026-08-06', method: 'ACH Wire', status: 'Completed', ref: 'ACH-789044' },
    { id: 'PAY-AP04', recipient: 'Worker Insurance & Benefits Trust', category: 'Compliance Insurance', amount: 4200, date: '2026-08-10', method: 'Bank Transfer', status: 'Processing', ref: 'INS-09921' },
    { id: 'PAY-AP05', recipient: 'Recruitment Affiliate Partners', category: 'Commission Payout', amount: 2800, date: '2026-08-15', method: 'Direct Deposit', status: 'Scheduled', ref: 'SCH-AG09' }
  ],
  reports: {
    placementTrends: [
      { month: 'Jan', workers: 140, billings: 185000, marginAmount: 34000 },
      { month: 'Feb', workers: 152, billings: 198000, marginAmount: 36500 },
      { month: 'Mar', workers: 160, billings: 210000, marginAmount: 38800 },
      { month: 'Apr', workers: 168, billings: 222000, marginAmount: 41000 },
      { month: 'May', workers: 175, billings: 235000, marginAmount: 43500 },
      { month: 'Jun', workers: 180, billings: 248000, marginAmount: 45800 },
      { month: 'Jul', workers: 184, billings: 256000, marginAmount: 47360 }
    ],
    industryBreakdown: [
      { name: 'Construction', value: 35, color: '#0284c7' },
      { name: 'Industrial & Mfg', value: 28, color: '#f59e0b' },
      { name: 'Logistics & Warehouse', value: 22, color: '#10b981' },
      { name: 'Facility & Maintenance', value: 15, color: '#8b5cf6' }
    ]
  }
};

export const initialAdminData = {
  ownerOverview: {
    timeframe: 'Today',
    timeframes: {
      'Today': {
        totalExpense: 185000,
        totalExpenseFormatted: 'BDT 1,85,000',
        expenseBreakdown: { factory: 125000, agency: 60000 },
        totalCashIn: 340000,
        totalCashInFormatted: 'BDT 3,40,000',
        cashInBreakdown: { factory: 210000, agency: 130000 },
        attendanceRate: 94.5,
        attendanceDetails: '212 / 224 Workers Present',
        attendanceBreakdown: { factory: '92% (115/125)', agency: '97% (97/99)' },
        pendingPaymentsDues: 875000,
        pendingPaymentsFormatted: 'BDT 8,75,000',
        pendingBreakdown: { factory: 'BDT 3,50,000 (Supplier & Fuel Dues)', agency: 'BDT 5,25,000 (Uncollected Invoices)' },
        cashFlowTrends: [
          { time: '08:00 AM', cashIn: 45000, expense: 20000, factoryCash: 30000, agencyCash: 15000 },
          { time: '10:00 AM', cashIn: 85000, expense: 35000, factoryCash: 55000, agencyCash: 30000 },
          { time: '12:00 PM', cashIn: 140000, expense: 75000, factoryCash: 90000, agencyCash: 50000 },
          { time: '02:00 PM', cashIn: 220000, expense: 110000, factoryCash: 140000, agencyCash: 80000 },
          { time: '04:00 PM', cashIn: 290000, expense: 150000, factoryCash: 180000, agencyCash: 110000 },
          { time: '06:00 PM', cashIn: 340000, expense: 185000, factoryCash: 210000, agencyCash: 130000 }
        ],
        businessComparison: [
          { category: 'Cash In (Revenue)', factory: 210000, agency: 130000 },
          { category: 'Operating Expense', factory: 125000, agency: 60000 },
          { category: 'Net Operating Surplus', factory: 85000, agency: 70000 }
        ]
      },
      'Last 7 Days': {
        totalExpense: 1280000,
        totalExpenseFormatted: 'BDT 12,80,000',
        expenseBreakdown: { factory: 850000, agency: 430000 },
        totalCashIn: 2450000,
        totalCashInFormatted: 'BDT 24,50,000',
        cashInBreakdown: { factory: 1500000, agency: 950000 },
        attendanceRate: 93.8,
        attendanceDetails: '1,480 / 1,578 Daily Shifts',
        attendanceBreakdown: { factory: '91.5%', agency: '96.2%' },
        pendingPaymentsDues: 875000,
        pendingPaymentsFormatted: 'BDT 8,75,000',
        pendingBreakdown: { factory: 'BDT 3,50,000', agency: 'BDT 5,25,000' },
        cashFlowTrends: [
          { time: 'Mon', cashIn: 320000, expense: 170000, factoryCash: 200000, agencyCash: 120000 },
          { time: 'Tue', cashIn: 380000, expense: 190000, factoryCash: 230000, agencyCash: 150000 },
          { time: 'Wed', cashIn: 310000, expense: 165000, factoryCash: 190000, agencyCash: 120000 },
          { time: 'Thu', cashIn: 350000, expense: 180000, factoryCash: 210000, agencyCash: 140000 },
          { time: 'Fri', cashIn: 410000, expense: 210000, factoryCash: 260000, agencyCash: 150000 },
          { time: 'Sat', cashIn: 390000, expense: 200000, factoryCash: 240000, agencyCash: 150000 },
          { time: 'Sun', cashIn: 290000, expense: 165000, factoryCash: 170000, agencyCash: 120000 }
        ],
        businessComparison: [
          { category: 'Cash In (Revenue)', factory: 1500000, agency: 950000 },
          { category: 'Operating Expense', factory: 850000, agency: 430000 },
          { category: 'Net Operating Surplus', factory: 650000, agency: 520000 }
        ]
      },
      'Last 30 Days': {
        totalExpense: 5420000,
        totalExpenseFormatted: 'BDT 54,20,000',
        expenseBreakdown: { factory: 3600000, agency: 1820000 },
        totalCashIn: 9850000,
        totalCashInFormatted: 'BDT 98,50,000',
        cashInBreakdown: { factory: 6100000, agency: 3750000 },
        attendanceRate: 92.4,
        attendanceDetails: '6,210 / 6,720 Shifts Completed',
        attendanceBreakdown: { factory: '90.8%', agency: '95.1%' },
        pendingPaymentsDues: 875000,
        pendingPaymentsFormatted: 'BDT 8,75,000',
        pendingBreakdown: { factory: 'BDT 3,50,000', agency: 'BDT 5,25,000' },
        cashFlowTrends: [
          { time: 'Week 1', cashIn: 2200000, expense: 1250000, factoryCash: 1350000, agencyCash: 850000 },
          { time: 'Week 2', cashIn: 2450000, expense: 1380000, factoryCash: 1520000, agencyCash: 930000 },
          { time: 'Week 3', cashIn: 2600000, expense: 1410000, factoryCash: 1610000, agencyCash: 990000 },
          { time: 'Week 4', cashIn: 2600000, expense: 1380000, factoryCash: 1620000, agencyCash: 980000 }
        ],
        businessComparison: [
          { category: 'Cash In (Revenue)', factory: 6100000, agency: 3750000 },
          { category: 'Operating Expense', factory: 3600000, agency: 1820000 },
          { category: 'Net Operating Surplus', factory: 2500000, agency: 1930000 }
        ]
      }
    }
  },
  recentActivityFeed: [
    {
      id: 'ACT-101',
      timestamp: '10 mins ago',
      timeISO: '2026-08-12 03:18',
      module: 'Factory',
      user: 'Manager Suresh Patel',
      avatar: 'SP',
      title: 'Brick Order #ORD-9021 Placed',
      description: 'Client Apex Infra placed a brick order for 50,000 Red Clay Solid Bricks.',
      amount: 'BDT 2,50,000',
      type: 'income',
      status: 'In Progress'
    },
    {
      id: 'ACT-102',
      timestamp: '25 mins ago',
      timeISO: '2026-08-12 03:03',
      module: 'Factory',
      user: 'Supervisor Ramesh Kumar',
      avatar: 'RK',
      title: 'Worker Wage Payout Approved',
      description: 'Manager Suresh Patel approved a worker payout of BDT 50,000 for Kiln & Molding Crew.',
      amount: 'BDT 50,000',
      type: 'expense',
      status: 'Approved'
    },
    {
      id: 'ACT-103',
      timestamp: '45 mins ago',
      timeISO: '2026-08-12 02:43',
      module: 'Agency',
      user: 'HR Admin Jessica Taylor',
      avatar: 'JT',
      title: 'Agency Client Payment Received',
      description: 'Agency client Metro Builders completed payment for Invoice #INV-AG01.',
      amount: 'BDT 1,80,000',
      type: 'income',
      status: 'Completed'
    },
    {
      id: 'ACT-104',
      timestamp: '1 hour ago',
      timeISO: '2026-08-12 02:28',
      module: 'Agency',
      user: 'Account Manager David Miller',
      avatar: 'DM',
      title: 'Contractor Placement Deployed',
      description: '12 New skilled contractors deployed to Summit Manufacturing Site.',
      amount: '12 Workers',
      type: 'deployment',
      status: 'Completed'
    },
    {
      id: 'ACT-105',
      timestamp: '2 hours ago',
      timeISO: '2026-08-12 01:28',
      module: 'Factory',
      user: 'Inventory Officer Priya Sharma',
      avatar: 'PS',
      title: 'Raw Coal Shipment Delivered',
      description: 'Coal India Supplies delivered 25 Tons Anthracite Coal to Raw Material Yard.',
      amount: 'BDT 1,42,000',
      type: 'expense',
      status: 'Completed'
    },
    {
      id: 'ACT-106',
      timestamp: '3 hours ago',
      timeISO: '2026-08-12 00:28',
      module: 'Agency',
      user: 'HR Admin Jessica Taylor',
      avatar: 'JT',
      title: 'Weekly Timesheet Verified',
      description: 'Client Apex Logistics Hub approved 38 contractor timesheets for Week 32.',
      amount: '758 Hours',
      type: 'payroll',
      status: 'Approved'
    },
    {
      id: 'ACT-107',
      timestamp: '4 hours ago',
      timeISO: '2026-08-11 23:28',
      module: 'Factory',
      user: 'Finance Controller Marcus Chen',
      avatar: 'MC',
      title: 'Utility Electricity Bill Settled',
      description: 'Industrial high voltage electricity bill paid to Apex Power Grid.',
      amount: 'BDT 56,000',
      type: 'expense',
      status: 'Completed'
    }
  ],
  globalStats: {
    totalRevenueMonthly: 'BDT 98,50,000',
    totalExpensesMonthly: 'BDT 54,20,000',
    netOperatingProfit: 'BDT 44,30,000',
    profitMarginPercent: '45.0%',
    activeUsers: 18,
    systemHealth: '100% Operational',
    lastBackupTime: 'Today at 02:00 AM'
  },
  auditLogs: [
    { id: 'LOG-1092', timestamp: '2026-08-12 03:10:14', module: 'System Admin', user: 'Alexander Wright', userRole: 'Super Admin', action: 'Modified System Rate Limits & Firewalls', details: 'Updated owner API rate limits and enhanced remote monitoring IP whitelist.', status: 'Info', ip: '192.168.1.45' },
    { id: 'LOG-1091', timestamp: '2026-08-12 02:45:22', module: 'Brick Factory', user: 'Suresh Patel', userRole: 'Factory Manager', action: 'Approved Coal Vendor Bill #BILL-FB01', details: 'Authorized payment of BDT 1,42,000 to Coal India Supplies Ltd via direct bank wire.', status: 'Success', ip: '10.0.4.12' },
    { id: 'LOG-1090', timestamp: '2026-08-12 01:12:05', module: 'Manpower Agency', user: 'Jessica Taylor', userRole: 'HR Manager', action: 'Added 4 New Contractor Profiles', details: 'Registered forklift operators EMP-A07 to EMP-A10 for Apex Logistics.', status: 'Success', ip: '172.16.0.88' },
    { id: 'LOG-1089', timestamp: '2026-08-11 22:30:00', module: 'System Admin', user: 'System Auto-Backup', userRole: 'Automated Job', action: 'Database Snapshot Executed (GCP Cloud Storage)', details: 'Daily database backup archive created successfully (Size: 142 MB).', status: 'Info', ip: 'Internal Cron' },
    { id: 'LOG-1088', timestamp: '2026-08-11 19:15:40', module: 'System Admin', user: 'Marcus Chen', userRole: 'Finance Controller', action: 'Exported Global Financial Reconciliation PDF', details: 'Downloaded monthly consolidated P&L and tax report for owner review.', status: 'Warning', ip: '192.168.1.102' },
    { id: 'LOG-1087', timestamp: '2026-08-11 16:40:12', module: 'Brick Factory', user: 'Ramesh Kumar', userRole: 'Kiln Supervisor', action: 'Updated Kiln Temperature Telemetry', details: 'Adjusted Kiln A temperature setpoint to 1,050°C for Batch #892 firing cycle.', status: 'Success', ip: '10.0.4.18' },
    { id: 'LOG-1086', timestamp: '2026-08-11 14:22:00', module: 'Manpower Agency', user: 'David Miller', userRole: 'Account Officer', action: 'Generated Client Invoice #INV-AG04', details: 'Issued billing statement for BDT 1,14,000 to Global Tech Park Facility.', status: 'Success', ip: '172.16.0.95' },
    { id: 'LOG-1085', timestamp: '2026-08-11 11:05:30', module: 'Brick Factory', user: 'Priya Sharma', userRole: 'Inventory Officer', action: 'Raw Clay Soil Stock Check', details: 'Recorded 145 Tons clay soil inventory in Raw Yard Sector 2.', status: 'Info', ip: '10.0.4.20' }
  ],
  reportsList: [
    {
      id: 'REP-01',
      title: 'Consolidated Executive P&L Statement',
      category: 'Financial Reconciliation',
      period: 'July 2026',
      date: '2026-08-01',
      fileSize: '2.4 MB',
      format: 'PDF',
      status: 'Ready',
      summary: 'Combined gross cash in BDT 98,50,000, total expenses BDT 54,20,000 across Factory and Agency with BDT 44,30,000 net surplus.',
      highlights: [
        { label: 'Combined Cash In', value: 'BDT 98,50,000' },
        { label: 'Total Operating Costs', value: 'BDT 54,20,000' },
        { label: 'Net Profit Margin', value: '45.0%' }
      ]
    },
    {
      id: 'REP-02',
      title: 'Brick Factory Production & Material Audit',
      category: 'Factory Operations',
      period: 'July 2026',
      date: '2026-08-02',
      fileSize: '1.8 MB',
      format: 'XLSX',
      status: 'Ready',
      summary: '1,250,000 molded bricks produced, 18.4 Tons coal buffer remaining, total worker wages disbursed BDT 38,50,000.',
      highlights: [
        { label: 'Total Bricks Produced', value: '1,250,000 Units' },
        { label: 'Kiln Efficiency', value: '98.8%' },
        { label: 'Fuel Expense', value: 'BDT 4,10,000' }
      ]
    },
    {
      id: 'REP-03',
      title: 'Manpower Agency Placement & Billing Ledger',
      category: 'Agency Operations',
      period: 'July 2026',
      date: '2026-08-03',
      fileSize: '3.1 MB',
      format: 'PDF',
      status: 'Ready',
      summary: '184 active placed workers across 28 client contracts with 18.5% average agency commission margin.',
      highlights: [
        { label: 'Active Contractors', value: '184 Placed' },
        { label: 'Hours Billed', value: '3,656 Hrs' },
        { label: 'Avg Commission', value: '18.5%' }
      ]
    },
    {
      id: 'REP-04',
      title: 'Enterprise Tax & Statutory Compliance Report',
      category: 'Tax & Legal',
      period: 'Q2 2026',
      date: '2026-07-15',
      fileSize: '4.2 MB',
      format: 'PDF',
      status: 'Ready',
      summary: 'Quarterly VAT and worker withholding tax reconciliation for domestic tax authority filing.',
      highlights: [
        { label: 'VAT Liability', value: 'BDT 6,20,000' },
        { label: 'Withholding Tax', value: 'BDT 3,40,000' },
        { label: 'Filing Status', value: 'Compliant' }
      ]
    },
    {
      id: 'REP-05',
      title: 'Worker Attendance & Payroll Disbursal Log',
      category: 'HR & Payroll',
      period: 'July 2026',
      date: '2026-08-05',
      fileSize: '1.2 MB',
      format: 'XLSX',
      status: 'Ready',
      summary: '224 combined workers, 94.2% average attendance rate, total payroll disbursed BDT 48,20,000.',
      highlights: [
        { label: 'Total Workforce', value: '224 Staff' },
        { label: 'Attendance Rate', value: '94.2%' },
        { label: 'Total Wages Paid', value: 'BDT 48,20,000' }
      ]
    }
  ],
  systemSettings: {
    companyName: 'Smart ERP Holdings Inc.',
    taxRegistrationNumber: 'TAX-88392019',
    currencySymbol: 'BDT ',
    dateFormat: 'YYYY-MM-DD',
    autoBackupFrequency: 'Daily (02:00 AM)',
    webhookUrl: 'https://api.smarterp.io/v1/webhooks/events',
    sessionTimeoutMins: 60,
    twoFactorAuthRequired: true,
    emailNotifications: true
  }
};
