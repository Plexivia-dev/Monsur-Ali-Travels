import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings,
  Layers,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Search,
  Filter,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Sliders,
  ChevronRight,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@shared/components/layout/PageTitle';
import { UserProfileSettingsPage } from '@shared/features/profile';

const CATEGORY_MAP = {
  DOCUMENT_UPLOAD: { label: 'Document Upload', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  LEGAL: { label: 'Legal & Contract', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  FINANCIAL: { label: 'Financial & Accounts', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  EMBASSY_PROCESS: { label: 'Embassy & Visa', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  VERIFICATION: { label: 'Verification & Scrutiny', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  GENERAL_ACTION: { label: 'Operational Action', color: 'bg-black/[0.04] text-black/70 border-black/15' },
};

const DOC_PRESETS = [
  { key: 'passport', label: 'Passport Bio-Page' },
  { key: 'nid', label: 'National ID (NID)' },
  { key: 'photo', label: '2x2 Studio Photo' },
  { key: 'agreement', label: 'Employment Agreement' },
  { key: 'police-clearance', label: 'Police Clearance Certificate' },
  { key: 'medical', label: 'Medical Report' },
  { key: 'bank-solvency', label: 'Bank Statement & Solvency' },
  { key: 'utility-bill', label: 'Electricity / Utility Bill' },
  { key: 'land-doc', label: 'Land / Property Asset' },
  { key: 'client-form', label: 'Client & Guardian Form' },
  { key: 'indian-visa', label: 'Indian Visa Docket' },
  { key: 'other', label: 'Other Document' },
];

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'task-types';

  // Task Types state
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterDocReq, setFilterDocReq] = useState('ALL'); // ALL, YES, NO

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'DOCUMENT_UPLOAD',
    requiresDocument: true,
    defaultDocumentType: 'passport',
    description: '',
    sortOrder: 0,
  });

  const fetchTaskTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/task-types?includeInactive=true');
      const data = res.data?.data || res.data || [];
      setTaskTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load task types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'task-types') {
      fetchTaskTypes();
    }
  }, [activeTab, fetchTaskTypes]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'DOCUMENT_UPLOAD',
      requiresDocument: true,
      defaultDocumentType: 'passport',
      description: '',
      sortOrder: (taskTypes.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'DOCUMENT_UPLOAD',
      requiresDocument: item.requiresDocument !== false,
      defaultDocumentType: item.defaultDocumentType || 'other',
      description: item.description || '',
      sortOrder: item.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveTaskType = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error('Task type name is required');
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await apiClient.put(`/api/v1/admin/task-types/${editingItem.did || editingItem._id}`, formData);
        toast.success(`Task Type "${formData.name}" updated successfully!`);
      } else {
        await apiClient.post('/api/v1/admin/task-types', formData);
        toast.success(`Task Type "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchTaskTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await apiClient.put(`/api/v1/admin/task-types/${item.did || item._id}`, {
        isActive: !item.isActive,
      });
      toast.success(`Task Type "${item.name}" ${!item.isActive ? 'activated' : 'deactivated'}`);
      setTaskTypes((prev) =>
        prev.map((t) => ((t.did || t._id) === (item.did || item._id) ? { ...t, isActive: !item.isActive } : t))
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete task type "${item.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/admin/task-types/${item.did || item._id}`);
      toast.success(`Task Type "${item.name}" removed.`);
      fetchTaskTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task type');
    }
  };

  // Filtered Task Types
  const filteredTaskTypes = taskTypes.filter((t) => {
    const matchesSearch =
      (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.defaultDocumentType || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesDocReq =
      filterDocReq === 'ALL' ||
      (filterDocReq === 'YES' && t.requiresDocument) ||
      (filterDocReq === 'NO' && !t.requiresDocument);
    return matchesSearch && matchesCategory && matchesDocReq;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Dynamic PageTitle */}
      <PageTitle
        title="Agency & System Settings"
        subtitle="Configure standard task types, required document bundles, workflow automation, and agency preferences."
        icon={Settings}
        badge="AGENCY SETTINGS"
        actions={
          activeTab === 'task-types' && (
            <Button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task Type</span>
            </Button>
          )
        }
      />

      {/* Main Settings Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto">
        <button
          onClick={() => setSearchParams({ tab: 'task-types' })}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'task-types'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Task Types & Document Bundles</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
            {taskTypes.length || 0}
          </span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'agency' })}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'agency'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Agency Preferences</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'profile' })}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile & Security</span>
        </button>
      </div>

      {/* TAB 1: TASK TYPES & WORKFLOW CONFIGURATION */}
      {activeTab === 'task-types' && (
        <div className="space-y-6">
          {/* Header Summary & Filter Bar */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Workflow Task Types Directory
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When assigning case steps, Admins select from these task types. Tasks requiring documents enforce multi-file uploads; action tasks enforce mandatory work notes.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search task types or documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                }`}
              >
                All Categories ({taskTypes.length})
              </button>
              {Object.entries(CATEGORY_MAP).map(([catKey, catCfg]) => {
                const count = taskTypes.filter((t) => t.category === catKey).length;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                      selectedCategory === catKey
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {catCfg.label} ({count})
                  </button>
                );
              })}

              <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

              <span className="text-[11px] font-bold text-muted-foreground mr-1">Document Intake:</span>
              <button
                onClick={() => setFilterDocReq('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  filterDocReq === 'ALL'
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterDocReq('YES')}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  filterDocReq === 'YES'
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                }`}
              >
                📄 Requires Document
              </button>
              <button
                onClick={() => setFilterDocReq('NO')}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  filterDocReq === 'NO'
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground'
                }`}
              >
                💬 Action / Notes Only
              </button>
            </div>
          </div>

          {/* Task Types Grid Table */}
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-card border border-border rounded-2xl">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-semibold">Loading Task Types Configuration...</p>
            </div>
          ) : filteredTaskTypes.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-xs space-y-3 bg-card border border-dashed border-border rounded-2xl">
              <Layers className="w-10 h-10 mx-auto opacity-40 text-muted-foreground" />
              <p className="font-semibold text-sm">No task types found matching the filter.</p>
              <Button onClick={handleOpenCreate} size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Task Type
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTaskTypes.map((item) => {
                const catCfg = CATEGORY_MAP[item.category] || CATEGORY_MAP.GENERAL_ACTION;
                return (
                  <div
                    key={item.did || item._id}
                    className={`bg-card border rounded-2xl p-5 space-y-4 shadow-xs transition-all ${
                      item.isActive ? 'border-border hover:border-primary/40' : 'border-border/40 opacity-60 bg-muted/10'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catCfg.color}`}>
                            {catCfg.label}
                          </span>
                          {item.isSystemDefault && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-muted text-muted-foreground">
                              System Preset
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                      </div>

                      {/* Active Status Badge */}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                          item.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}
                        title="Click to toggle active status"
                      >
                        {item.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{item.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description || 'No description provided.'}
                    </p>

                    {/* Behavior Pill */}
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        {item.requiresDocument ? (
                          <>
                            <UploadCloud className="w-4 h-4 text-sky-500 shrink-0" />
                            <span>Requires File Upload</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Mandatory Work Notes</span>
                          </>
                        )}
                      </div>
                      {item.defaultDocumentType && (
                        <span className="text-[10px] font-mono bg-background px-2 py-0.5 rounded border border-border text-muted-foreground uppercase">
                          {item.defaultDocumentType}
                        </span>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Order #{item.sortOrder || 0}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition cursor-pointer"
                          title="Edit Task Type"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!item.isSystemDefault && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                            title="Delete Task Type"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGENCY PREFERENCES */}
      {activeTab === 'agency' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground">Agency Profile & Operational Defaults</h3>
            <p className="text-xs text-muted-foreground">
              Configure global travel agency details, default currency, case numbering prefixes, and workflow automation settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Agency Legal Name</label>
              <input
                type="text"
                disabled
                value="Monsur Ali Travels & Tours Ltd."
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Primary Operating Currency</label>
              <input
                type="text"
                disabled
                value="BDT (Bangladeshi Taka - ৳)"
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Timezone</label>
              <input
                type="text"
                disabled
                value="Asia/Dhaka (GMT+6)"
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Case File Prefix</label>
              <input
                type="text"
                disabled
                value="CASE-YYYY-####"
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-semibold"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Global system defaults are synchronized across all staff accounts. To configure role-based access or team permissions, navigate to the Users & Employees management tabs.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: USER PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <UserProfileSettingsPage initialTab="profile" />
      )}

      {/* CREATE / EDIT TASK TYPE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <form
            onSubmit={handleSaveTaskType}
            className="relative bg-white border border-black/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl z-10 my-8 animate-in zoom-in-95 duration-150 text-black overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-black">
                  {editingItem ? 'Edit Task Type' : 'Add New Task Type'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
                title="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Task Type Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trade Test Skill Certificate, NID Card Copy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {Object.entries(CATEGORY_MAP).map(([catKey, catCfg]) => (
                    <option key={catKey} value={catKey}>
                      {catCfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requires Document Toggle */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">Requires File / Document Upload?</p>
                    <p className="text-[11px] text-muted-foreground">
                      If enabled, staff must upload the document. If disabled, staff must provide work notes/remarks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.requiresDocument}
                    onChange={(e) => setFormData({ ...formData, requiresDocument: e.target.checked })}
                    className="size-4 accent-primary cursor-pointer rounded"
                  />
                </div>

                {/* Default Document Preset (only if requiresDocument is true) */}
                {formData.requiresDocument && (
                  <div className="pt-2 border-t border-border">
                    <label className="block font-semibold text-muted-foreground mb-1">
                      Default Document Preset Key
                    </label>
                    <select
                      value={formData.defaultDocumentType}
                      onChange={(e) => setFormData({ ...formData, defaultDocumentType: e.target.value })}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {DOC_PRESETS.map((dp) => (
                        <option key={dp.key} value={dp.key}>
                          {dp.label} ({dp.key})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Task Scope / Guidelines for Staff
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what staff must verify or collect for this task..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2 text-xs">
              <Button
                type="button"
                variant="cancel"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                {editingItem ? 'Save Changes' : 'Create Task Type'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
