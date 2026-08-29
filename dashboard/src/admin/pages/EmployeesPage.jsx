import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  UserCheck,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Calendar,
  Pencil,
  Trash2,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  UnifiedDataTable,
  DataTableColumnHeader,
} from '@/components/ui/unified-table';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { UnifiedModalHeader, UnifiedModalFooter } from '@shared/components/common/UnifiedModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Renders the Agency Employees & Staff Directory page for Admin Dashboard
export const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    designation: '',
    department: 'General',
    baseSalary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    accessLevel: 'Level_1',
    status: 'Active',
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    designation: '',
    department: 'General',
    baseSalary: '',
    joiningDate: '',
    accessLevel: 'Level_1',
    status: 'Active',
  });

  // Fetches employees list from backend
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/employees');
      const data =
        res.data?.data ||
        res.data?.employees ||
        (Array.isArray(res.data) ? res.data : []);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load employees list:', err);
      toast.error(err.response?.data?.message || 'Failed to load employees directory.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Formats ISO date string into readable date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Creates a new employee record
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!createForm.fullName.trim()) return toast.error('Full name is required.');
    if (!createForm.phone.trim()) return toast.error('Phone number is required.');
    if (!createForm.designation.trim()) return toast.error('Designation is required.');

    setCreateLoading(true);
    try {
      const res = await apiClient.post('/api/v1/admin/employees', {
        fullName: createForm.fullName.trim(),
        phone: createForm.phone.trim(),
        email: createForm.email.trim() || undefined,
        designation: createForm.designation.trim(),
        department: createForm.department.trim() || 'General',
        baseSalary: Number(createForm.baseSalary) || 0,
        joiningDate: createForm.joiningDate || undefined,
        accessLevel: createForm.accessLevel,
        status: createForm.status,
      });

      const newEmp = res.data?.data || res.data;
      if (newEmp) {
        setEmployees((prev) => [newEmp, ...prev]);
      }

      toast.success(`Employee "${createForm.fullName}" registered successfully!`);
      setCreateModalOpen(false);
      setCreateForm({
        fullName: '',
        phone: '',
        email: '',
        designation: '',
        department: 'General',
        baseSalary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        accessLevel: 'Level_1',
        status: 'Active',
      });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee record.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Opens Edit modal
  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      fullName: emp.fullName || '',
      phone: emp.phone || '',
      email: emp.email || '',
      designation: emp.designation || '',
      department: emp.department || 'General',
      baseSalary: emp.baseSalary !== undefined ? String(emp.baseSalary) : '',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      accessLevel: emp.accessLevel || 'Level_1',
      status: emp.status || 'Active',
    });
    setEditModalOpen(true);
  };

  // Updates an employee record
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const empId = editingEmployee.did || editingEmployee._id || editingEmployee.id;
    if (!empId) return toast.error('Invalid employee identifier.');

    if (!editForm.fullName.trim()) return toast.error('Full name is required.');
    if (!editForm.phone.trim()) return toast.error('Phone number is required.');
    if (!editForm.designation.trim()) return toast.error('Designation is required.');

    setEditLoading(true);
    try {
      const payload = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || undefined,
        designation: editForm.designation.trim(),
        department: editForm.department.trim() || 'General',
        baseSalary: Number(editForm.baseSalary) || 0,
        joiningDate: editForm.joiningDate || undefined,
        accessLevel: editForm.accessLevel,
        status: editForm.status,
      };

      const res = await apiClient.put(`/api/v1/admin/employees/${empId}`, payload);
      const updated = res.data?.data || res.data;

      setEmployees((prev) =>
        prev.map((item) => ((item.did || item._id) === empId ? { ...item, ...updated } : item))
      );

      toast.success(`Employee "${editForm.fullName}" updated successfully!`);
      setEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee record.');
    } finally {
      setEditLoading(false);
    }
  };

  // Deletes an employee
  const handleDeleteEmployee = async (emp) => {
    const empId = emp.did || emp._id || emp.id;
    if (!empId) return;
    if (!window.confirm(`Are you sure you want to delete employee "${emp.fullName}"?`)) return;

    setDeletingId(empId);
    try {
      await apiClient.delete(`/api/v1/admin/employees/${empId}`);
      toast.success(`Employee "${emp.fullName}" removed.`);
      setEmployees((prev) => prev.filter((item) => (item.did || item._id) !== empId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee.');
    } finally {
      setDeletingId(null);
    }
  };

  // Columns definition for UnifiedDataTable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee Name & Code" />
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {emp.fullName?.charAt(0)?.toUpperCase() || 'E'}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-foreground block truncate">
                  {emp.fullName || 'Unnamed Employee'}
                </span>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {emp.employeeCode || emp.did?.slice(0, 12) || '—'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'designation',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Designation & Dept" />
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-primary shrink-0" />
                <span>{emp.designation || '—'}</span>
              </div>
              <div className="text-muted-foreground text-[11px]">
                {emp.department || 'General'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Contact Info" />
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="size-3 text-sky-500 shrink-0" />
                <span>{emp.phone || '—'}</span>
              </div>
              {emp.email && (
                <div className="text-muted-foreground flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                  <Mail className="size-3 text-muted-foreground shrink-0" />
                  <span>{emp.email}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'baseSalary',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Base Salary" />
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="font-semibold text-foreground text-xs flex items-center gap-1">
              <span className="text-muted-foreground font-mono">BDT</span>
              <span>{Number(emp.baseSalary || 0).toLocaleString()}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const emp = row.original;
          const isActive = emp.status === 'Active';
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              {isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
              {emp.status || 'Active'}
            </span>
          );
        },
      },
      {
        accessorKey: 'joiningDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joining Date" />
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <span className="text-xs text-muted-foreground font-medium">
              {formatDate(emp.joiningDate || emp.createdAt)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="text-xs font-bold text-muted-foreground">Actions</span>,
        cell: ({ row }) => {
          const emp = row.original;
          const isDeleting = deletingId === (emp.did || emp._id);

          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(emp)}
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors border-border"
                title="Edit Employee Profile"
              >
                <Pencil className="size-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => handleDeleteEmployee(emp)}
                className="h-8 px-2 text-xs cursor-pointer text-rose-600 border-rose-200/60 hover:bg-rose-500/10"
                title="Delete Employee"
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId]
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <HeaderTitle
        variant="general"
        icon={UserCheck}
        title="Employees Directory"
        subtitle="Manage agency staff profiles, designations, contact credentials, and payroll bases."
        actions={
          <>
            <button
              onClick={() => fetchEmployees()}
              className="p-2.5 bg-card hover:bg-muted text-primary rounded-xl border border-border transition-all cursor-pointer shadow-xs"
              title="Refresh Records"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" />
              <span>Add New Employee</span>
            </button>
          </>
        }
      />

      {/* Unified Data Table */}
      <UnifiedDataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchKey="fullName"
        searchPlaceholder="Search employees by name, phone, designation..."
      />

      {/* Create Employee Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-100 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <UnifiedModalHeader
              icon={UserPlus}
              title="Add New Employee"
              subtitle="Register a new agency staff member in the ERP directory."
              onClose={() => setCreateModalOpen(false)}
            />

            <form onSubmit={handleCreateEmployee} className="flex flex-col flex-grow">
              <div className="p-6 space-y-4 text-xs text-zinc-100 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="employee@domain.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Visa Executive"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Processing, Accounts"
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Base Salary (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={createForm.baseSalary}
                      onChange={(e) => setCreateForm({ ...createForm, baseSalary: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={createForm.joiningDate}
                      onChange={(e) => setCreateForm({ ...createForm, joiningDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Status
                    </label>
                    <select
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="On_Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Access Level
                    </label>
                    <select
                      value={createForm.accessLevel}
                      onChange={(e) => setCreateForm({ ...createForm, accessLevel: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs cursor-pointer"
                    >
                      <option value="Level_1">Level 1 (Standard)</option>
                      <option value="Level_2">Level 2 (Senior)</option>
                      <option value="Level_3">Level 3 (Lead)</option>
                      <option value="Manager">Manager</option>
                      <option value="Full_Staff">Full Staff Access</option>
                    </select>
                  </div>
                </div>
              </div>

              <UnifiedModalFooter
                onCancel={() => setCreateModalOpen(false)}
                submitLabel="Save Employee"
                isSubmitting={createLoading}
              />
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-100 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <UnifiedModalHeader
              icon={Pencil}
              title="Edit Employee Profile"
              subtitle={`Modify employee info for ${editingEmployee?.fullName || ''}`}
              onClose={() => setEditModalOpen(false)}
            />

            <form onSubmit={handleUpdateEmployee} className="flex flex-col flex-grow">
              <div className="p-6 space-y-4 text-xs text-zinc-100 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.designation}
                      onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Base Salary (BDT)
                    </label>
                    <input
                      type="number"
                      value={editForm.baseSalary}
                      onChange={(e) => setEditForm({ ...editForm, baseSalary: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary text-xs cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="On_Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              <UnifiedModalFooter
                onCancel={() => setEditModalOpen(false)}
                submitLabel="Update Employee"
                isSubmitting={editLoading}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
