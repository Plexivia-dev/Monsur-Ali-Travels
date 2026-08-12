import React, { useState } from 'react';
import { useFactoryData, useCreateFactoryBill } from '../../api/hooks';
import { DataTable } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileText, Plus, DollarSign, Calendar, Truck, Flame, Receipt, AlertCircle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const FactoryBills = () => {
  const { data: factoryData, isLoading } = useFactoryData();
  const createBillMutation = useCreateFactoryBill();
  const { addToast } = usePortal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    category: 'Raw Coal',
    amount: '',
    dueDate: '',
    items: ''
  });

  if (isLoading || !factoryData) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Factory Raw Material Bills...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendor.trim() || !formData.amount) return;

    createBillMutation.mutate(
      {
        vendor: formData.vendor,
        category: formData.category,
        amount: Number(formData.amount),
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        items: formData.items || 'Factory Material Supply'
      },
      {
        onSuccess: () => {
          addToast(`Vendor bill from ${formData.vendor} generated successfully!`, 'success');
          setIsModalOpen(false);
          setFormData({ vendor: '', category: 'Raw Coal', amount: '', dueDate: '', items: '' });
        }
      }
    );
  };

  const columns = [
    {
      header: 'Bill Reference & Vendor',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{row.vendor}</p>
          <p className="text-xs text-slate-500">{row.id} • {row.items}</p>
        </div>
      )
    },
    {
      header: 'Category',
      cell: (row) => (
        <Badge variant={row.category.includes('Coal') ? 'warning' : row.category.includes('Soil') ? 'success' : row.category.includes('Freight') ? 'info' : 'purple'}>
          {row.category}
        </Badge>
      )
    },
    {
      header: 'Amount',
      cell: (row) => <span className="font-bold text-sm text-slate-900 dark:text-white">${row.amount.toLocaleString()}</span>
    },
    {
      header: 'Date Created / Due',
      cell: (row) => (
        <div className="text-xs">
          <p className="text-slate-700 dark:text-slate-300">Issued: {row.date}</p>
          <p className="text-slate-400">Due: {row.dueDate}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger'}>
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
            <FileText className="w-5 h-5 text-amber-500" />
            Raw Material Bills & Supplier Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track Coal procurement, Red Soil/Clay quarry deliveries, Haulage logistics, and Utilities.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create Supplier Bill
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        title="Factory Invoicing & Expense Ledger"
        subtitle="All active and settled vendor supply bills"
        columns={columns}
        data={factoryData.bills}
        searchPlaceholder="Search vendor name, category, items..."
        filterKey="status"
        filterOptions={[
          { label: 'Paid', value: 'PAID' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Overdue', value: 'OVERDUE' }
        ]}
      />

      {/* Modal: Create Bill */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Factory Supply Bill"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={createBillMutation.isPending}>
              {createBillMutation.isPending ? 'Generating...' : 'Save Bill'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Vendor / Supplier Name"
            placeholder="e.g. Coal India Supplies Ltd."
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Expense Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Raw Coal Procurement', value: 'Raw Coal' },
                { label: 'Soil/Clay Material Quarry', value: 'Soil/Clay Material' },
                { label: 'Freight & Transport', value: 'Freight & Transport' },
                { label: 'Electricity & Utilities', value: 'Electricity & Utilities' },
                { label: 'Kiln Machinery Maintenance', value: 'Maintenance' }
              ]}
            />

            <Input
              label="Total Bill Amount ($)"
              type="number"
              placeholder="e.g. 12500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <Input
            label="Line Items Description"
            placeholder="e.g. 20 Tons Anthracite Coal Grade A"
            value={formData.items}
            onChange={(e) => setFormData({ ...formData, items: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
