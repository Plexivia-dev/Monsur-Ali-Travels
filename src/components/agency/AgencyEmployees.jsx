import React, { useState } from 'react';
import { useAgencyData, useAddAgencyEmployee } from '../../api/hooks';
import { DataTable } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Users2, UserPlus, Building2, Clock, DollarSign, Phone } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const AgencyEmployees = () => {
  const { data: agencyData, isLoading } = useAgencyData();
  const addEmployeeMutation = useAddAgencyEmployee();
  const { addToast } = usePortal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Warehouse Specialist',
    client: 'Apex Logistics Hub',
    hourlyPay: '18',
    billRate: '25',
    phone: ''
  });

  if (isLoading || !agencyData) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Contractor Placement Directory...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addEmployeeMutation.mutate(
      {
        name: formData.name,
        role: formData.role,
        client: formData.client,
        hourlyPay: Number(formData.hourlyPay),
        billRate: Number(formData.billRate),
        phone: formData.phone || '+1 555-0200'
      },
      {
        onSuccess: () => {
          addToast(`Contractor ${formData.name} placed at ${formData.client}!`, 'success');
          setIsModalOpen(false);
          setFormData({ name: '', role: 'Warehouse Specialist', client: 'Apex Logistics Hub', hourlyPay: '18', billRate: '25', phone: '' });
        }
      }
    );
  };

  const columns = [
    {
      header: 'Contractor Name & Role',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
            {row.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{row.name}</p>
            <p className="text-xs text-slate-500">{row.role} ({row.id})</p>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Enterprise Client',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{row.client}</span>
        </div>
      )
    },
    {
      header: 'Rates (Pay / Bill)',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-900 dark:text-white">Pay: ${row.hourlyPay}/hr</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Bill: ${row.billRate}/hr</p>
        </div>
      )
    },
    {
      header: 'Spread Margin',
      cell: (row) => {
        const margin = row.billRate - row.hourlyPay;
        const marginPct = Math.round((margin / row.billRate) * 100);
        return (
          <Badge variant="success">
            +${margin}/hr ({marginPct}%)
          </Badge>
        );
      }
    },
    {
      header: 'Hours This Week',
      cell: (row) => (
        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
          {row.hoursThisWeek} hrs
        </span>
      )
    },
    {
      header: 'Placement Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'Deployed' ? 'info' : 'neutral'}>
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
            <Users2 className="w-5 h-5 text-sky-500" />
            Placed Contractor Workforce & Timesheets
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage field staffing deployments, client assignments, hourly pay rates, and agency margins.
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setIsModalOpen(true)}>
          New Placement
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        title="Contractor Roster"
        subtitle="Placed workers and bench talent"
        columns={columns}
        data={agencyData.employees}
        searchPlaceholder="Search contractor name, role, client..."
        filterKey="status"
        filterOptions={[
          { label: 'Deployed', value: 'DEPLOYED' },
          { label: 'Bench', value: 'BENCH' }
        ]}
      />

      {/* Modal: New Placement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Place Contractor at Enterprise Client"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={addEmployeeMutation.isPending}>
              {addEmployeeMutation.isPending ? 'Placing...' : 'Confirm Placement'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Contractor Full Name"
            placeholder="e.g. Michael Scott"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Role / Designation"
              placeholder="e.g. Forklift Operator"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />

            <Select
              label="Assigned Client Enterprise"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              options={[
                { label: 'Apex Logistics Hub', value: 'Apex Logistics Hub' },
                { label: 'Metro Builders & Infra', value: 'Metro Builders & Infra' },
                { label: 'Summit Manufacturing Ltd', value: 'Summit Manufacturing Ltd' },
                { label: 'Global Tech Park Facility', value: 'Global Tech Park Facility' },
                { label: 'Harbor Freight Terminals', value: 'Harbor Freight Terminals' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Worker Pay Rate ($/hr)"
              type="number"
              value={formData.hourlyPay}
              onChange={(e) => setFormData({ ...formData, hourlyPay: e.target.value })}
              required
            />

            <Input
              label="Client Bill Rate ($/hr)"
              type="number"
              value={formData.billRate}
              onChange={(e) => setFormData({ ...formData, billRate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Phone Number"
            placeholder="+1 555-0200"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
