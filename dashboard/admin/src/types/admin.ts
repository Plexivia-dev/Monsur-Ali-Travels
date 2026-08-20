// ── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = 'Owner' | 'Superadmin' | 'Admin' | 'Employee';

export interface AuthUser {
  id: string;
  did?: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  avatar?: string;
}

// ── API generic wrapper ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Admin Overview / KPIs ─────────────────────────────────────────────────────

export interface KpiTimeframeData {
  totalExpenseFormatted: string;
  totalCashInFormatted: string;
  pendingPaymentsFormatted: string;
  attendanceRate: number;
  attendanceDetails?: string;
  expenseBreakdown: { factory: number; agency: number };
  cashInBreakdown: { factory: number; agency: number };
  cashFlowTrends: Array<{ time: string; cashIn: number; expense: number }>;
  businessComparison: Array<{ category: string; factory: number; agency: number }>;
}

export interface OwnerOverview {
  timeframes: {
    Today: KpiTimeframeData;
    'Last 7 Days': KpiTimeframeData;
    'Last 30 Days': KpiTimeframeData;
  };
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  timeISO?: string;
  module: 'Factory' | 'Agency' | 'Passport' | 'System';
  user: string;
  avatar: string;
  title: string;
  description: string;
  amount?: string;
  type?: 'income' | 'expense';
  status: string;
}

export interface AdminDashboardData {
  ownerOverview: OwnerOverview;
  notifications: BackendNotification[];
  recentActivityFeed: ActivityFeedItem[];
  systemUsers?: SystemUser[];
  auditLogs?: AuditLog[];
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface BackendNotification {
  _id: string;
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  module: 'passport' | 'agency' | 'factory' | 'system';
  createdBy?: string;
  createdAt: string;
  read?: boolean;
}

// ── System Users ──────────────────────────────────────────────────────────────

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  performedBy: string;
  userRole: UserRole;
  ipAddress?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Pending';
}
