import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import {
  User,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  ToggleLeft,
  ToggleRight,
  X,
  Calendar,
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

// Renders the System Users & Staff Management page for Admin Dashboard
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Staff',
  });

  // Fetches system users list
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/users');
      const data =
        res.data?.data ||
        res.data?.users ||
        (Array.isArray(res.data) ? res.data : []);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users list:', err);
      toast.error(err.response?.data?.message || 'Failed to load system users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Formats ISO date string into readable date
  const formatDate = (dateStr) => {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Creates a new system user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.fullName.trim()) return toast.error('Full name is required.');
    if (!createForm.email.trim()) return toast.error('Email is required.');
    if (!createForm.password.trim() || createForm.password.length < 6)
      return toast.error('Password must be at least 6 characters.');

    setCreateLoading(true);
    try {
      await apiClient.post('/api/v1/admin/users', {
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || undefined,
        password: createForm.password,
        role: createForm.role,
      });
      toast.success(`User "${createForm.fullName}" created successfully!`);
      setCreateModalOpen(false);
      setCreateForm({ fullName: '', email: '', phone: '', password: '', role: 'Staff' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Toggles a user's active/suspended status
  const handleToggleStatus = useCallback(
    async (user) => {
      const userId = user._id || user.did;
      if (!userId) return;
      const currentActive = user.isActive !== false;
      setTogglingId(userId);
      try {
        await apiClient.patch(`/api/v1/admin/users/${userId}/status`, {
          isActive: !currentActive,
        });
        toast.success(
          `User "${user.fullName || user.name}" ${!currentActive ? 'activated' : 'suspended'} successfully.`
        );
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update user status.');
      } finally {
        setTogglingId(null);
      }
    },
    [fetchUsers]
  );

  // TanStack Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Name" />,
        cell: ({ row }) => {
          const u = row.original;
          const name = u.fullName || u.name || 'User';
          let avatarUrl = u.avatar || u.profilePicture;
          if (avatarUrl) {
            if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://') && !avatarUrl.startsWith('data:')) {
              const base = API_BASE_URL.replace(/\/+$/, '');
              const path = avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl;
              avatarUrl = `${base}${path}`;
            }
          } else {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true&rounded=true`;
          }
          return (
            <div className="flex items-center gap-3">
              <div className="size-9.5 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center shadow-xs">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true`;
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-foreground block text-xs">{name}</span>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {u.did ? `DID: ${u.did.slice(0, 14)}...` : u._id ? `ID: ${u._id.slice(0, 14)}...` : '\u2014'}
                </div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.getValue('email') || '\u2014'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.getValue('phone') || '\u2014'}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => {
          const u = row.original;
          const role = u.role || 'Staff';
          const roleBadgeColor =
            role === 'Owner'
              ? 'bg-primary text-primary-foreground'
              : role === 'Admin'
              ? 'bg-primary/80 text-primary-foreground'
              : role === 'Accountant'
              ? 'bg-primary/60 text-primary-foreground'
              : 'bg-primary/50 text-primary-foreground';
          return (
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-[11px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs ${roleBadgeColor}`}>
                {role}
              </span>
              {u.subRole && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-border">
                  {u.subRole}
                </span>
              )}
            </div>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const active = row.getValue('isActive') !== false;
          return (
            <Badge
              className={
                active
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }
            >
              {active ? 'Active' : 'Suspended'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-medium">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const u = row.original;
          const userId = u._id || u.did;
          const isToggling = togglingId === userId;
          const isActive = u.isActive !== false;
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={isToggling}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(u);
              }}
              className={`h-7 px-2.5 text-xs font-semibold cursor-pointer gap-1 shadow-xs ${
                isActive
                  ? 'text-destructive border-destructive/30 hover:bg-destructive/5'
                  : 'text-primary border-primary/30 hover:bg-primary/5'
              }`}
            >
              {isToggling ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isActive ? (
                <ToggleRight className="size-3.5" />
              ) : (
                <ToggleLeft className="size-3.5" />
              )}
              <span>{isActive ? 'Suspend' : 'Activate'}</span>
            </Button>
          );
        },
      },
    ],
    [handleToggleStatus, togglingId]
  );

  const facetedFilters = [
    {
      columnId: 'role',
      title: 'Role',
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Owner', value: 'Owner' },
        { label: 'Staff', value: 'Staff' },
        { label: 'Accountant', value: 'Accountant' },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <HeaderTitle
        variant="general"
        icon={Shield}
        title="System Users & Staff"
        badge={`${users.length} Total`}
        subtitle="Manage agency administrators, operations staff, accountants, and user account privileges."
        actions={
          <>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2.5 bg-card hover:bg-muted text-primary rounded-xl border border-border transition-all cursor-pointer shadow-xs"
              title="Refresh Users"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" />
              <span>Add New User</span>
            </button>
          </>
        }
      />

      {/* TanStack Unified Data Table */}
      <UnifiedDataTable
        columns={columns}
        data={users}
        isLoading={loading}
        loadingRowCount={5}
        enablePagination={true}
        pageSize={15}
        pageSizeOptions={[10, 15, 25, 50]}
        enableSorting={true}
        enableFiltering={true}
        facetedFilters={facetedFilters}
        enableExport={true}
        exportFilename="system-users-directory"
        searchPlaceholder="Search by Name, Email, Phone, Role..."
        emptyTitle="No users found."
        emptyDescription="No system users match the current search or filter criteria."
      />

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border text-card-foreground shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Unified Modal Header */}
            <UnifiedModalHeader
              icon={UserPlus}
              title="Add System User"
              subtitle="Create a new agency staff or admin account."
              onClose={() => setCreateModalOpen(false)}
            />

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="flex flex-col flex-grow overflow-hidden text-xs">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="e.g. Md. Rafiqul Islam"
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Role <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring cursor-pointer"
                    >
                      <option value="Owner" className="bg-popover text-popover-foreground">Owner</option>
                      <option value="Admin" className="bg-popover text-popover-foreground">Admin</option>
                      <option value="Staff" className="bg-popover text-popover-foreground">Staff</option>
                      <option value="Accountant" className="bg-popover text-popover-foreground">Accountant</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. user@agency.com"
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="e.g. +880 1712-345678"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Unified Modal Footer */}
              <UnifiedModalFooter
                onCancel={() => setCreateModalOpen(false)}
                cancelText="Cancel"
                submitText="Create User"
                loadingText="Creating..."
                submitIcon={CheckCircle2}
                loading={createLoading}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
