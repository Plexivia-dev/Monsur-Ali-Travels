import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { 
  Loader2, 
  Search, 
  Trash2, 
  RefreshCw, 
  FolderOpen, 
  Users, 
  Clock, 
  Shield, 
  UserX,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrashPage() {
  const [activeCollection, setActiveCollection] = useState('cases'); // 'cases' | 'users'
  const [caseFiles, setCaseFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch deleted / inactive case files
  const fetchCaseFiles = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch cases with status CANCELLED or inactive query
      const res = await apiClient.get('/api/v1/client/cases?limit=100');
      if (res.data?.status === 'success' || res.data?.data) {
        const allCases = res.data.data || [];
        // Filter soft-deleted or cancelled or inactive case files
        const deleted = allCases.filter(
          (c) => c.isActive === false || c.isDeleted === true || c.status === 'CANCELLED' || c.status === 'REJECTED'
        );
        // If no explicit deleted found, show all inactive/cancelled or fallback to cancelled cases
        setCaseFiles(deleted.length > 0 ? deleted : allCases.filter(c => c.status === 'CANCELLED' || c.isActive === false));
      }
    } catch (err) {
      toast.error('Failed to load deleted client case files.');
      setCaseFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch deleted / inactive users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/users');
      if (res.data?.data) {
        const allUsers = res.data.data || [];
        // Show inactive or deleted accounts
        const inactiveUsers = allUsers.filter((u) => u.isActive === false || u.isDeleted === true);
        setUsers(inactiveUsers.length > 0 ? inactiveUsers : allUsers.filter(u => u.isActive === false));
      }
    } catch (err) {
      toast.error('Failed to load user collection.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeCollection === 'cases') {
      fetchCaseFiles();
    } else {
      fetchUsers();
    }
  }, [activeCollection, fetchCaseFiles, fetchUsers]);

  const handleRefresh = () => {
    if (activeCollection === 'cases') {
      fetchCaseFiles();
    } else {
      fetchUsers();
    }
  };

  const filteredCases = caseFiles.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.caseNumber || '').toLowerCase().includes(q) ||
      (c.applicantName || '').toLowerCase().includes(q) ||
      (c.passportNumber || '').toLowerCase().includes(q) ||
      (c.caseType || '').toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Trash2 className="size-7 text-rose-500" />
            Trash & Deleted Records
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Audit and view soft-deleted client case files and inactive user accounts.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Collection Selection (Radio Inputs) & Search */}
      <Card className="bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Radio Group */}
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Select Collection:
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="trashCollection"
                value="cases"
                checked={activeCollection === 'cases'}
                onChange={() => {
                  setActiveCollection('cases');
                  setSearch('');
                }}
                className="size-4 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${
                activeCollection === 'cases' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <FolderOpen className="size-4" />
                Client Case Files
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="trashCollection"
                value="users"
                checked={activeCollection === 'users'}
                onChange={() => {
                  setActiveCollection('users');
                  setSearch('');
                }}
                className="size-4 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${
                activeCollection === 'users' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <Users className="size-4" />
                User Accounts
              </span>
            </label>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeCollection === 'cases' ? 'Search case files...' : 'Search users...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Table Content */}
      {activeCollection === 'cases' ? (
        <Card className="bg-white border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">Case No</th>
                  <th className="px-6 py-4 font-medium">Client / Applicant</th>
                  <th className="px-6 py-4 font-medium">Passport No</th>
                  <th className="px-6 py-4 font-medium">Country / Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <Loader2 className="size-7 animate-spin text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground font-medium">Loading deleted case files...</span>
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-muted-foreground">
                      <FolderOpen className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="font-semibold text-foreground text-sm">No deleted client case files found in Trash</p>
                      <p className="text-xs mt-0.5">All active cases are running smoothly.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c, index) => (
                    <tr key={c._id || c.did || index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground w-12">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-primary font-mono">
                        {c.caseNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{c.applicantName || 'Unknown Applicant'}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {c.passportNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium uppercase">
                          {c.caseType || c.country || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          <AlertTriangle className="size-3" /> {c.status || 'Deleted'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground text-xs whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="size-3.5" />
                          {new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">User Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <Loader2 className="size-7 animate-spin text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground font-medium">Loading user collection...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-muted-foreground">
                      <UserX className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="font-semibold text-foreground text-sm">No deleted or inactive users found</p>
                      <p className="text-xs mt-0.5">All user accounts are currently active.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, index) => (
                    <tr key={u._id || u.userId || index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground w-12">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{u.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          <Shield className="size-3" /> {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          <UserX className="size-3" /> {u.isActive === false ? 'Inactive' : 'Deleted'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground text-xs whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="size-3.5" />
                          {new Date(u.createdAt || Date.now()).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
