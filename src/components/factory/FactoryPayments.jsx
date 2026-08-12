import React, { useState } from 'react';
import { useFactoryData, useCreateFactoryPayment } from '../../api/hooks';
import { DataTable } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { CreditCard, Plus, CheckCircle, Clock, Banknote, ShieldCheck } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const FactoryPayments = () => {
  const { data: factoryData, isLoading } = useFactoryData();
  const createPaymentMutation = useCreateFactoryPayment();
  const { addToast } = usePortal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    category: 'Weekly Wage Payout',
    amount: '',
    method: 'Bank Transfer',
    ref: ''
  });

  if (isLoading || !factoryData) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Factory Disbursement Logs...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipient.trim() || !formData.amount) return;

    createPaymentMutation.mutate(
      {
        recipient: formData.recipient,
        category: formData.category,
        amount: Number(formData.amount),
        method: formData.method,
        ref: formData.ref || `TXN-${Math.floor(100000 + Math.random() * 900000)}`
      },
      {
        onSuccess: () => {
          addToast(`Payment of $${formData.amount} to ${formData.recipient} processed!`, 'success');
          setIsModalOpen(false);
          setFormData({ recipient: '', category: 'Weekly Wage Payout', amount: '', method: 'Bank Transfer', ref: '' });
        }
      }
    );
  };

  const columns = [
    {
      header: 'Payment Reference & Beneficiary',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{row.recipient}</p>
          <p className="text-xs text-slate-500">{row.id} • Ref: {row.ref}</p>
        </div>
      )
    },
    {
      header: 'Payout Purpose',
      cell: (row) => (
        <Badge variant={row.category.includes('Wage') ? 'warning' : 'info'}>
          {row.category}
        </Badge>
      )
    },
    {
      header: 'Disbursement Amount',
      cell: (row) => <span className="font-bold text-sm text-slate-900 dark:text-white">${row.amount.toLocaleString()}</span>
    },
    {
      header: 'Method & Date',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800 dark:text-slate-200">{row.method}</p>
          <p className="text-slate-400">{row.date}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'Scheduled' ? 'warning' : 'info'}>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Payout Schedules & Disbursement Logs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly kiln worker wage payouts, vendor settlements, and cash book registers.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Payment
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        title="Disbursement Audit Trail"
        subtitle="Completed, scheduled, and processing payouts"
        columns={columns}
        data={factoryData.payments}
        searchPlaceholder="Search recipient, transaction ref, method..."
        filterKey="status"
        filterOptions={[
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Scheduled', value: 'SCHEDULED' },
          { label: 'Processing', value: 'PROCESSING' }
        ]}
      />

      {/* Modal: Record Payment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Factory Payment Disbursement"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={createPaymentMutation.isPending}>
              {createPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Recipient / Beneficiary Name"
            placeholder="e.g. Daily Kiln Workers Crew A"
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payout Purpose"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Weekly Wage Payout', value: 'Weekly Wage Payout' },
                { label: 'Vendor Settlement', value: 'Vendor Settlement' },
                { label: 'Transport Payment', value: 'Transport Payment' },
                { label: 'Raw Material Payout', value: 'Raw Material Payout' },
                { label: 'Maintenance Advance', value: 'Maintenance Advance' }
              ]}
            />

            <Input
              label="Amount ($)"
              type="number"
              placeholder="e.g. 6400"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payment Method"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              options={[
                { label: 'Bank Transfer', value: 'Bank Transfer' },
                { label: 'Cash / Direct Ledger', value: 'Cash / Direct Ledger' },
                { label: 'UPI / Online', value: 'UPI / Online' },
                { label: 'Check', value: 'Check' }
              ]}
            />

            <Input
              label="Transaction Ref / Check #"
              placeholder="e.g. TXN-99201"
              value={formData.ref}
              onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
