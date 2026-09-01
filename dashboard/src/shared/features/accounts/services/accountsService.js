import { apiClient } from '@/lib/api-client';

/**
 * Accounts and Reports API Service
 */
export const accountsService = {
  // ── 1. Payments ─────────────────────────────────────────────────────────────
  async getPayments(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/payments', { params });
    return res.data;
  },

  // ── 2. Company Expense Bills ────────────────────────────────────────────────
  async getBills(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/bills', { params });
    return res.data;
  },

  async getBillById(id) {
    const res = await apiClient.get(`/api/v1/accounts/bills/${id}`);
    return res.data;
  },

  async createBill(payload) {
    const res = await apiClient.post('/api/v1/accounts/bills', payload);
    return res.data;
  },

  async updateBill(id, payload) {
    const res = await apiClient.put(`/api/v1/accounts/bills/${id}`, payload);
    return res.data;
  },

  async deleteBill(id) {
    const res = await apiClient.delete(`/api/v1/accounts/bills/${id}`);
    return res.data;
  },

  // ── 3. Salaries ─────────────────────────────────────────────────────────────
  async getSalaries(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/salaries', { params });
    return res.data;
  },

  // ── 4. Expenses (Cash Vouchers) ─────────────────────────────────────────────
  async getExpenses(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/expenses', { params });
    return res.data;
  },

  // ── 5. Cash Book ────────────────────────────────────────────────────────────
  async getCashBook(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/cash-book', { params });
    return res.data?.data;
  },

  // ── 6. Bank Ledger ──────────────────────────────────────────────────────────
  async getBankLedger(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/bank-ledger', { params });
    return res.data?.data;
  },

  // ── 7. Reports Summary ──────────────────────────────────────────────────────
  async getReportsSummary(params = {}) {
    const res = await apiClient.get('/api/v1/accounts/reports/summary', { params });
    return res.data?.data;
  },

  // ── 4. Export CSV (Generates on VPS + Downloads directly) ───────────────────
  async exportReportCsv({ type = 'payments', period = 'this_month', startDate = '', endDate = '' }) {
    const res = await apiClient.post(
      '/api/v1/accounts/reports/export',
      { type, period, startDate, endDate },
      { responseType: 'blob' }
    );

    // Extract filename from header or fallback
    const disposition = res.headers?.['content-disposition'] || '';
    let fileName = `report-${type}-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }

    // Trigger browser instant download
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, fileName };
  },

  // ── 5. VPS Stored Downloads History ─────────────────────────────────────────
  async getExportDownloads() {
    const res = await apiClient.get('/api/v1/accounts/reports/downloads');
    return res.data?.data || [];
  },

  // ── 6. Download specific archived VPS report ────────────────────────────────
  async downloadArchivedReport(fileName) {
    const res = await apiClient.get(`/api/v1/accounts/reports/download/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
    });

    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  },
};

export default accountsService;
