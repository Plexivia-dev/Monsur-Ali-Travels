import React, { useState } from 'react';
import { useFactoryData, useAddFactoryEmployee } from '../../api/hooks';
import { DataTable } from "../ui/table";
import { Badge } from "../ui/badge";
import { Modal } from '../ui/Modal';
import { Input, Select } from "../ui/input";
import { Button } from "../ui/button";
import { Users, UserPlus } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const FactoryEmployees = () => {
  const { data: factoryData, isLoading } = useFactoryData();
  const addEmployeeMutation = useAddFactoryEmployee();
  const { addToast } = usePortal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Kiln Fireman',
    type: 'Daily Wage',
    dailyWage: '85',
    shift: 'Day',
    phone: '',
    assignedSection: 'Kiln Chamber A'
  });

  if (isLoading || !factoryData) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Factory Workforce Records...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addEmployeeMutation.mutate(
      {
        name: formData.name,
        role: formData.role,
        type: formData.type,
        dailyWage: Number(formData.dailyWage),
        shift: formData.shift,
        phone: formData.phone || '+1 555-0100',
        assignedSection: formData.assignedSection
      },
      {
        onSuccess: () => {
          addToast(`Worker ${formData.name} added to Factory roster!`, 'success');
          setIsModalOpen(false);
          setFormData({ name: '', role: 'Kiln Fireman', type: 'Daily Wage', dailyWage: '85', shift: 'Day', phone: '', assignedSection: 'Kiln Chamber A' });
        }
      }
    );
  };

  const columns = [
    {
      header: 'Employee Name & Role',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
            {row.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.role} ({row.id})</p>
          </div>
        </div>
      )
    },
    {
      header: 'Employment Type',
      cell: (row) => (
        <Badge variant={row.type === 'Full-Time' ? 'info' : row.type === 'Daily Wage' ? 'warning' : 'purple'}>
          {row.type}
        </Badge>
      )
    },
    {
      header: 'Assigned Section & Shift',
      cell: (row) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{row.assignedSection}</p>
          <span className="text-[11px] text-muted-foreground capitalize">{row.shift} Shift</span>
        </div>
      )
    },
    {
      header: 'Daily Rate',
      cell: (row) => <span className="font-bold text-foreground">${row.dailyWage}/day</span>
    },
    {
      header: 'Attendance (This Month)',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{row.attendanceDays} Days</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-555 font-medium">
            {Math.round((row.attendanceDays / 26) * 100)}%
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 border border-border rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Brick Factory Workforce & Attendance
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track daily wage kiln operators, Supervisors, molding crews, and attendance ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" icon={UserPlus} onClick={() => setIsModalOpen(true)}>
            Add Factory Worker
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        title="Factory Personnel Directory"
        subtitle="Active staff assigned across Kilns, Molding Bays, and Raw Material Yards"
        columns={columns}
        data={factoryData.employees}
        searchPlaceholder="Search workers, roles, or shifts..."
        filterKey="type"
        filterOptions={[
          { label: 'Full-Time', value: 'FULL-TIME' },
          { label: 'Daily Wage', value: 'DAILY WAGE' },
          { label: 'Contract', value: 'CONTRACT' }
        ]}
      />

      {/* Modal: Add Employee */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Factory Worker"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={addEmployeeMutation.isPending}>
              {addEmployeeMutation.isPending ? 'Saving...' : 'Register Worker'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Worker Full Name"
            placeholder="e.g. Rajesh Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { label: 'Kiln Supervisor', value: 'Kiln Supervisor' },
                { label: 'Molding Master', value: 'Molding Master' },
                { label: 'Kiln Fireman', value: 'Kiln Fireman' },
                { label: 'Clay Loader Operator', value: 'Clay Loader Operator' },
                { label: 'Haulage Driver', value: 'Haulage Driver' },
                { label: 'Sorting & QA Inspector', value: 'Sorting & QA Inspector' }
              ]}
            />

            <Select
              label="Employment Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { label: 'Daily Wage', value: 'Daily Wage' },
                { label: 'Full-Time', value: 'Full-Time' },
                { label: 'Contract', value: 'Contract' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Daily Wage ($ Rate)"
              type="number"
              value={formData.dailyWage}
              onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
              required
            />

            <Select
              label="Assigned Shift"
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              options={[
                { label: 'Day Shift (06:00 - 18:00)', value: 'Day' },
                { label: 'Night Shift (18:00 - 06:00)', value: 'Night' }
              ]}
            />
          </div>

          <Input
            label="Phone Number"
            placeholder="+1 555-0100"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Assigned Section / Bay"
            placeholder="e.g. Molding Bay 2 / Kiln C"
            value={formData.assignedSection}
            onChange={(e) => setFormData({ ...formData, assignedSection: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
