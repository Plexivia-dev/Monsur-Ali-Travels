import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import {
  User,
  Shield,
  Search,
  RefreshCw,
  UserPlus,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Key,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

// Renders the System Users & Staff Management page for Admin Dashboard
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetches system users list
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/users');
      const data = res.data?.data || res.data?.users || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users list:', err);
      toast.error('Failed to load system users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (u.fullName || u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
              Access Control
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {users.length} Total Users & Staff
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mt-1.5 flex items-center gap-2.5">
            <User className="size-7 text-primary" />
            <span>System Users & Staff (ইউজার ও স্টাফ ম্যানেজমেন্ট)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage agency administrators, operations staff, accountants, and user privileges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border border-input bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Users"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-background rounded-2xl border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Name, Email, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-input bg-muted/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-input bg-background font-semibold text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles (সকল রোল)</option>
            <option value="Admin">Admin</option>
            <option value="Owner">Owner</option>
            <option value="Staff">Staff</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>

      {/* Users DataTable */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Loading users collection...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <User className="size-12 mx-auto opacity-30" />
              <p className="text-base font-semibold">No users found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">User Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Role & Sub-Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.did || u._id || u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {(u.fullName || u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-foreground">{u.fullName || u.name}</span>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              DID: {u.did?.slice(0, 14)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                        {u.email || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                        {u.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            {u.role || 'Staff'}
                          </span>
                          {u.subRole && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                              {u.subRole}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.isActive !== false
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
