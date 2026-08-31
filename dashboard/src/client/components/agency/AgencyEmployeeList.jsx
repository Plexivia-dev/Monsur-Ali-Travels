import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  UserCheck,
  Eye,
  X,
  Phone,
  Mail,
  Shield,
  Calendar,
  Lock,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function AgencyEmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/client/employees?limit=1000');
      const staffList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setEmployees(staffList);
    } catch (err) {
      console.error('Failed to load agency employees:', err);
      toast.error('Unable to fetch employee roster from server.');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = String(emp.name || emp.fullName || '').toLowerCase();
      const email = String(emp.email || '').toLowerCase();
      const phone = String(emp.phone || '').toLowerCase();
      const role = String(emp.designation || emp.role || '').toLowerCase();
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query);

      const matchesRole =
        roleFilter === 'all' || role === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [employees, search, roleFilter]);

  const uniqueRoles = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      const r = e.designation || e.role;
      if (r) set.add(r);
    });
    return Array.from(set);
  }, [employees]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xs text-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <UserCheck className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Employee & Staff Directory
              </h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Official staff directory and organizational roster (Read-Only Access)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-[11px] font-semibold text-muted-foreground">
            <Lock className="size-3.5 text-muted-foreground" />
            <span>Read Only</span>
          </div>

          <button
            type="button"
            onClick={fetchEmployees}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted/80 border border-border text-xs font-semibold rounded-xl text-foreground transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reloading...' : 'Reload Staff'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 sm:p-4 rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by staff name, email, phone, role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider text-[11px] border-b border-border select-none">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Role / Designation</th>
                <th className="py-3.5 px-4 font-semibold">Account Status</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                      <span className="text-xs font-semibold text-foreground">Loading employee roster...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
                        <UserCheck className="size-6 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-bold text-foreground">No staff members found</span>
                      <p className="text-xs text-muted-foreground">No employee records match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const empName = emp.name || emp.fullName || 'Unnamed Staff';
                  const email = emp.email || '—';
                  const phone = emp.phone || '—';
                  const role = emp.designation || emp.role || 'Staff';
                  const isActive = emp.status === 'Active' || (emp.isActive !== false && !emp.status);
                  const joinedDate = emp.joiningDate || emp.createdAt
                    ? new Date(emp.joiningDate || emp.createdAt).toLocaleDateString('en-GB')
                    : '—';

                  return (
                    <tr
                      key={emp._id || emp.id || emp.did}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{empName}</div>
                            <div className="text-[10.5px] font-mono text-muted-foreground">
                              {emp.did || emp._id || emp.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-foreground font-medium">{phone}</div>
                        {email !== '—' && (
                          <div className="text-[11px] text-muted-foreground font-mono">{email}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-muted border border-border text-foreground">
                          {role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted border-border text-muted-foreground'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {joinedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="size-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && filteredEmployees.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, filteredEmployees.length)} to{' '}
              {Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length} staff
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-card hover:bg-muted disabled:opacity-40 border border-border rounded-md text-foreground font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="font-semibold text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-card hover:bg-muted disabled:opacity-40 border border-border rounded-md text-foreground font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Details Modal (Strict Read-Only) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-foreground">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <UserCheck className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Employee Details
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Verified Staff Profile (Read-Only)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-base">
                    {(selectedEmployee.name || selectedEmployee.fullName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-bold text-foreground">
                      {selectedEmployee.name || selectedEmployee.fullName || 'Staff Member'}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      DID: {selectedEmployee.did || selectedEmployee._id || selectedEmployee.id}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted border border-border text-foreground">
                  {selectedEmployee.designation || selectedEmployee.role || 'Staff'}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {selectedEmployee.phone || 'Not provided'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Email Address</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground font-mono">
                    {selectedEmployee.email || 'Not provided'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Shield className="size-3.5 text-muted-foreground" />
                    <span>Assigned Role</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {selectedEmployee.designation || selectedEmployee.role || 'Staff Member'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>Joined On</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-foreground">
                    {selectedEmployee.joiningDate || selectedEmployee.createdAt
                      ? new Date(selectedEmployee.joiningDate || selectedEmployee.createdAt).toLocaleDateString('en-GB')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyEmployeeList;
