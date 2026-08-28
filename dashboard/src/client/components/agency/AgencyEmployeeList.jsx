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
  Briefcase,
  User,
  CheckCircle2,
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
      const response = await apiClient.get('/api/v1/users');
      const payload = response.data;
      const staffList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
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
      const role = String(emp.role || emp.designation || '').toLowerCase();
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
      if (e.role) set.add(e.role);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <UserCheck className="size-5 text-zinc-100" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                Employee & Staff Directory
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                Official staff directory and organizational roster (Read-Only Access)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
            <Lock className="size-3.5 text-zinc-400" />
            <span>Read Only</span>
          </div>

          <button
            type="button"
            onClick={fetchEmployees}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reloading...' : 'Reload Staff'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by staff name, email, phone, role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer font-medium"
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800 select-none">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Role / Designation</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-zinc-400" />
                      <span className="text-xs font-semibold">Loading employee roster...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="size-8 text-zinc-600 stroke-[1.5]" />
                      <span className="text-sm font-semibold text-zinc-400">No staff members found</span>
                      <p className="text-xs text-zinc-600">No employee records match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const empName = emp.name || emp.fullName || 'Unnamed Staff';
                  const email = emp.email || '—';
                  const phone = emp.phone || '—';
                  const role = emp.role || emp.designation || 'Staff';
                  const isActive = emp.isActive !== false;
                  const joinedDate = emp.createdAt
                    ? new Date(emp.createdAt).toLocaleDateString('en-GB')
                    : '—';

                  return (
                    <tr
                      key={emp._id || emp.id || emp.did}
                      className="hover:bg-zinc-900/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{empName}</div>
                            <div className="text-[10.5px] font-mono text-zinc-500">
                              {emp.did || emp._id || emp.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-zinc-200 font-medium">{phone}</div>
                        {email !== '—' && (
                          <div className="text-[11px] text-zinc-500 font-mono">{email}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-zinc-900 border border-zinc-700 text-zinc-200">
                          {role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isActive
                              ? 'bg-zinc-900 border border-zinc-700 text-white'
                              : 'bg-zinc-900/50 border border-zinc-800 text-zinc-500'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? 'bg-white' : 'bg-zinc-600'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {joinedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                        >
                          <Eye className="size-3.5 text-zinc-300" />
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, filteredEmployees.length)} to{' '}
              {Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length} staff
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 rounded-md text-white font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="font-semibold text-white">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 rounded-md text-white font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Details Modal (Strict Read-Only) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <UserCheck className="size-4 text-zinc-100" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">
                    Employee Details
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Verified Staff Profile (Read-Only)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-white text-base">
                    {(selectedEmployee.name || selectedEmployee.fullName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">
                      {selectedEmployee.name || selectedEmployee.fullName || 'Staff Member'}
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      DID: {selectedEmployee.did || selectedEmployee._id || selectedEmployee.id}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-white">
                  {selectedEmployee.role || 'Staff'}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-zinc-400" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {selectedEmployee.phone || 'Not provided'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-zinc-400" />
                    <span>Email Address</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 font-mono">
                    {selectedEmployee.email || 'Not provided'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Shield className="size-3.5 text-zinc-400" />
                    <span>Assigned Role</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {selectedEmployee.role || 'Staff Member'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-zinc-400" />
                    <span>Joined On</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-zinc-200">
                    {selectedEmployee.createdAt
                      ? new Date(selectedEmployee.createdAt).toLocaleDateString('en-GB')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
