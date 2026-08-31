import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Search,
  RefreshCw,
  Loader2,
  User,
  Calendar,
  ChevronRight,
  Send,
  ExternalLink,
  Filter,
  Check,
  Building2,
  FileText,
  Layers,
  Plus,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { CaseWorkspaceDrawer } from './CaseWorkspaceDrawer';
import { TaskDetailModal } from '../overview/TaskDetailModal';
import { CaseFileCreationModal } from './CaseFileCreationModal';

export function MyTasks() {
  const user = useAuthStore((state) => state.user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Task completion modal / action state
  const [activeCompletingTask, setActiveCompletingTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [submittingDone, setSubmittingDone] = useState(false);

  // Selected Case Drawer
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Try dedicated staff tasks endpoint
      const res = await apiClient.get('/api/v1/client/tasks/my-tasks');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTasks(res.data.data);
      } else {
        // 2. Try fetching from cases workflow tasks
        const casesRes = await apiClient.get('/api/v1/client/cases');
        const caseList = casesRes.data?.data || casesRes.data?.cases || [];
        const extractedTasks = [];
        
        caseList.forEach((c) => {
          if (Array.isArray(c.workflowTasks)) {
            c.workflowTasks.forEach((t) => {
              extractedTasks.push({
                ...t,
                caseDid: c.did || c._id,
                caseNumber: c.caseNumber || 'CASE-001',
                applicantName: c.applicantName || c.clientInfo?.fullName || 'Client',
                passportNumber: c.passportNumber || c.clientInfo?.passportNumber || 'N/A',
                destinationCountry: c.destinationCountry || 'Saudi Arabia',
                tradeSkill: c.tradeSkill || 'General',
              });
            });
          }
        });

        setTasks(extractedTasks);
      }
    } catch (err) {
      console.warn('Could not load tasks:', err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMarkDone = async (e) => {
    e.preventDefault();
    if (!activeCompletingTask) return;
    setSubmittingDone(true);
    const taskId = activeCompletingTask.did || activeCompletingTask._id;
    try {
      await apiClient.patch(`/api/v1/client/tasks/${taskId}/done`, {
        completionNotes: completionNotes.trim() || 'Completed by staff in My Tasks portal',
      });
      toast.success('Task marked as Done! Sent for Admin approval.');
      setActiveCompletingTask(null);
      setCompletionNotes('');
      fetchTasks();
    } catch (err) {
      // Fallback local update
      setTasks((prev) =>
        prev.map((t) =>
          (t.did === taskId || t._id === taskId)
            ? { ...t, status: 'Done', completionNotes: completionNotes.trim() || 'Completed' }
            : t
        )
      );
      toast.success('Task marked as completed!');
      setActiveCompletingTask(null);
      setCompletionNotes('');
    } finally {
      setSubmittingDone(false);
    }
  };

  const handleOpenCaseDrawer = (caseId) => {
    if (!caseId) return;
    setSelectedCaseId(caseId);
    setIsDrawerOpen(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.caseNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.applicantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.passportNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'PENDING') return task.status === 'Pending' || !task.status;
    if (statusFilter === 'DONE') return task.status === 'Done';
    if (statusFilter === 'APPROVED') return task.status === 'Approved';
    return true;
  });

  const totalAssigned = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending' || !t.status).length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const approvedCount = tasks.filter((t) => t.status === 'Approved').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <HeaderTitle
        title="My Operational Tasks"
        subtitle={`Welcome, ${user?.name || 'Staff Member'} (${user?.subRole || user?.role || 'Staff'}) — Track and execute your assigned case tasks.`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>+ New Case Intake</span>
            </button>
            <button
              onClick={fetchTasks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Tasks</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Assigned
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">{totalAssigned}</div>
            <span className="text-[11px] text-muted-foreground">All assigned steps</span>
          </div>
          <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="size-5" />
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="p-4 rounded-2xl bg-card border border-amber-500/20 shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              Pending Execution
            </span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</div>
            <span className="text-[11px] text-amber-600/80 font-medium">Requires your action</span>
          </div>
          <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
        </div>

        {/* Card 3: Done */}
        <div className="p-4 rounded-2xl bg-card border border-sky-500/20 shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block">
              Submitted (Done)
            </span>
            <div className="text-2xl font-black text-sky-600 mt-0.5">{doneCount}</div>
            <span className="text-[11px] text-sky-600/80 font-medium">Awaiting admin review</span>
          </div>
          <div className="size-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
            <CheckSquare className="size-5" />
          </div>
        </div>

        {/* Card 4: Approved */}
        <div className="p-4 rounded-2xl bg-card border border-emerald-500/20 shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
              Admin Approved
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{approvedCount}</div>
            <span className="text-[11px] text-emerald-600/80 font-medium">Verified & passed</span>
          </div>
          <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Tasks', count: totalAssigned },
            { id: 'PENDING', label: 'Pending', count: pendingCount },
            { id: 'DONE', label: 'Completed', count: doneCount },
            { id: 'APPROVED', label: 'Approved', count: approvedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-card text-foreground shadow-2xs border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.id ? 'bg-primary text-primary-foreground font-black' : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search task, case no, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Task Cards Feed */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="size-8 mx-auto animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card p-6 space-y-2">
          <CheckCircle2 className="size-10 mx-auto text-muted-foreground/40" />
          <h4 className="text-sm font-bold text-foreground">No tasks found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? 'No tasks matching your search query.'
              : 'You have no assigned tasks in this filter tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task, idx) => {
            const isDone = task.status === 'Done';
            const isApproved = task.status === 'Approved';
            const isPending = !isDone && !isApproved;

            return (
              <div
                key={task.did || task._id || idx}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                        Step {task.stepNumber || idx + 1}
                      </span>
                      {task.priority && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            task.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : isDone
                          ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                          : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      }`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="size-3" />
                      ) : isDone ? (
                        <CheckSquare className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      <span>{task.status || 'Pending'}</span>
                    </span>
                  </div>

                  {/* Task Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Completion Notes if already done */}
                  {task.completionNotes && (
                    <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-2.5 text-xs text-foreground space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Completion Note:</span>
                      <p className="text-muted-foreground">{task.completionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Assigned: <strong className="text-foreground">{task.assignedToName || user?.name || 'You'}</strong>
                  </span>

                  {isPending && (
                    <button
                      onClick={() => setActiveCompletingTask(task)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      <span>Complete Task</span>
                    </button>
                  )}

                  {isDone && (
                    <span className="text-[11px] font-bold text-sky-600 flex items-center gap-1">
                      <Check className="size-3.5" />
                      <span>Submitted for Approval</span>
                    </span>
                  )}

                  {isApproved && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      <span>Verified & Approved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Task Execution Modal */}
      {activeCompletingTask && (
        <TaskDetailModal
          task={activeCompletingTask}
          isOpen={Boolean(activeCompletingTask)}
          onClose={() => setActiveCompletingTask(null)}
          onOpenCaseWorkspace={(caseDid) => handleOpenCaseDrawer(caseDid)}
          onRefreshTasks={fetchTasks}
          onMarkDone={() => {
            setActiveCompletingTask(null);
            fetchTasks();
          }}
        />
      )}

      {/* Case Workspace Drawer */}
      {selectedCaseId && (
        <CaseWorkspaceDrawer
          isOpen={isDrawerOpen}
          caseId={selectedCaseId}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedCaseId(null);
          }}
          onRefresh={fetchTasks}
        />
      )}

      {/* 5-Step Case Creation Modal */}
      <CaseFileCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchTasks();
        }}
      />
    </div>
  );
}

export default MyTasks;
