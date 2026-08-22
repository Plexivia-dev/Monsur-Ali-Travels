import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Loader2, Search, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadBills() {
      try {
        const res = await apiClient.get('/api/v1/client/invoices?limit=50');
        if (res.data?.status === 'success') {
          setBills(res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load bills.');
      } finally {
        setLoading(false);
      }
    }
    loadBills();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredBills = bills.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.invoiceNo?.toLowerCase().includes(term) ||
      b.clientName?.toLowerCase().includes(term) ||
      b.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bills</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All outgoing bills, invoices, and expenses.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <Card className="bg-white border border-gray-200 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Bill No</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Recipient/Vendor</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      No bills found.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill._id || bill.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">
                        {bill.invoiceNo || bill.billNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(bill.createdAt || bill.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {bill.clientName || bill.vendorName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-rose-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {formatCurrency(bill.amount || bill.grandTotal)}
                      </td>
                      <td className="px-6 py-4">
                        {bill.status === 'confirmed' || bill.status === 'paid' ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" /> Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
