import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import {
  User,
  Shield,
  Search,
  RefreshCw,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  UnifiedDataTable,
  DataTableColumnHeader,
} from '@/components/ui/unified-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Renders the System Users & Staff Management page for Admin Dashboard
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // TanStack Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Name" />,
        cell: ({ row }) => {
          const u = row.original;
          const name = u.fullName || u.name || 'User';
          return (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-foreground block">{name}</span>
                <div className="font-mono text-[10px] text-muted-foreground">
                  DID: {u.did ? `${u.did.slice(0, 14)}...` : u._id?.slice(0, 14) || '—'}
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
            {row.getValue('email') || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.getValue('phone') || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role & Sub-Role" />,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
                {u.role || 'Staff'}
              </Badge>
              {u.subRole && (
                <Badge variant="secondary" className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  {u.subRole}
                </Badge>
              )}
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Account Status" />,
        cell: ({ row }) => {
          const active = row.getValue('isActive') !== false;
          return (
            <Badge
              className={
                active
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                  : 'bg-rose-100 text-rose-700'
              }
            >
              {active ? 'Active' : 'Suspended'}
            </Badge>
          );
        },
      },
    ],
    []
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground uppercase tracking-wider">
              Access Control
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {users.length} Total Users & Staff
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mt-1.5 flex items-center gap-2.5">
            <User className="size-7 text-primary" />
            <span>System Users & Staff</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage agency administrators, operations staff, accountants, and user privileges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchUsers}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

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
        searchPlaceholder="Search by Name, Email, Phone..."
        emptyTitle="No users found matching criteria."
        emptyDescription="There are no system users matching the search filter."
      />
    </div>
  );
};

export default UsersPage;
