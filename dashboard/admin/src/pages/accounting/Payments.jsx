import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Loader2, Search, ArrowDownLeft, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await apiClient.get('/api/v1/client/receipts?limit=50');
        if (res.data?.status === 'success') {
          setPayments(res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load payments.');
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.receiptNo?.toLowerCase().includes(term) ||
      p.clientName?.toLowerCase().includes(term) ||
      p.paymentMethod?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All incoming money receipts and client payments.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments..."
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
                  <th className="px-6 py-4 font-medium">Receipt No</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Client/Source</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id || payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">
                        {payment.receiptNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(payment.createdAt || payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {payment.clientName || payment.clientId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600 flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          {payment.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === 'confirmed' || payment.status === 'paid' ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" /> Pending
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
