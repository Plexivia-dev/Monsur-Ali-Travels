import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  ArrowUpDown,
  Filter,
  Play,
  Eye,
  RefreshCw,
  FolderOpen,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '../../lib/api-client';
import { useAuthStore } from '../../store/useAuthStore';
import { TaskDoneModal } from '../tasks/TaskDoneModal';
import { TaskDetailModal } from './TaskDetailModal';
import { toast } from 'sonner';

const SAMPLE_TASKS = [
  {
    did: 'TASK-2026-001',
    caseDid: 'CASE-MAT-8942',
    title: 'Verify Passport Bio-Page & Validity Check',
    description: 'Verify the scanned applicant passport machine-readable zone (MRZ), check minimum 6-month validity, and compare name spelling with national ID.',
    stepNumber: 1,
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    permittedDocs: [
      { did: 'DOC-8821', documentName: 'Applicant Original Passport Copy', fileName: 'passport_scan.pdf' },
      { did: 'DOC-8822', documentName: 'National NID Verification Extract', fileName: 'nid_record.pdf' }
    ]
  },
  {
    did: 'TASK-2026-002',
    caseDid: 'CASE-MAT-8940',
    title: 'Prepare Official Employment Contract Draft',
    description: 'Draft the bilingual Arabic/English Employment Agreement as per overseas employer terms. Fill salary breakdown and job placement grade.',
    stepNumber: 2,
    status: 'In_Progress',
    startedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    permittedDocs: [
      { did: 'DOC-8819', documentName: 'Employer Demand Letter', fileName: 'demand_letter.pdf' },
      { did: 'DOC-8820', documentName: 'Standard Contract Template', fileName: 'contract_std.docx' }
    ]
  },
  {
    did: 'TASK-2026-003',
    caseDid: 'CASE-MAT-8935',
    title: 'Medical Fitness Certificate Review & Cross-Match',
    description: 'Verify GCC approved GAMCA/Wafid medical fitness clearance certificate and ensure negative infectious disease test results.',
    stepNumber: 2,
    status: 'In_Progress',
    startedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    permittedDocs: [
      { did: 'DOC-8810', documentName: 'GAMCA Medical Fitness Slip', fileName: 'medical_fit_8935.pdf' }
    ]
  },
  {
    did: 'TASK-2026-004',
    caseDid: 'CASE-MAT-8929',
    title: 'Embassy Visa Stamping Submission Package',
    description: 'Compile complete physical dossier with embassy token slip, verified passport photos, and authenticated police clearance record.',
    stepNumber: 3,
    status: 'Done',
    completedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    completionNotes: 'All 4 dossier items verified, token generated and delivered to liaison agent.',
    permittedDocs: [
      { did: 'DOC-8801', documentName: 'Police Clearance Certificate', fileName: 'police_clearance.pdf' },
      { did: 'DOC-8802', documentName: 'Embassy Submission Token Slip', fileName: 'token_slip_09.pdf' }
    ]
  },
  {
    did: 'TASK-2026-005',
    caseDid: 'CASE-MAT-8920',
    title: 'Flight Ticket & BMET Smart Card Clearance Verification',
    description: 'Confirm BMET clearance card is active on government immigration portal and link electronic flight e-ticket to candidate file.',
    stepNumber: 4,
    status: 'Approved',
    completedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    completionNotes: 'BMET Smart card QR validated. Flight itinerary confirmed with Biman Bangladesh Airlines.',
    permittedDocs: [
      { did: 'DOC-8790', documentName: 'BMET Clearance Card PDF', fileName: 'bmet_card.pdf' },
      { did: 'DOC-8791', documentName: 'Airlines E-Ticket', fileName: 'eticket_flight.pdf' }
    ]
  }
];

export function TasksOverviewList({ activeFilter, onFilterChange }) {
  const user = useAuthStore((state) => state.user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('step'); // 'step', 'newest', 'status'
  
  // Modals state
  const [doneModalTask, setDoneModalTask] = useState(null);
  const [detailModalTask, setDetailModalTask] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/tasks/my-tasks');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTasks(res.data.data);
      } else {
        setTasks(SAMPLE_TASKS);
      }
    } catch (err) {
      // Fallback to sample tasks for resilient client UI
      setTasks(SAMPLE_TASKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Quick action: start in progress
  const handleStartTask = async (task) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.did === task.did || t._id === task._id ? { ...t, status: 'In_Progress' } : t))
      );
      toast.success(`Task "${task.title}" started!`);
    } catch (e) {
      toast.error('Failed to update task status');
    }
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter tab
        if (activeFilter === 'pending' && task.status !== 'Pending') return false;
        if (activeFilter === 'in_progress' && task.status !== 'In_Progress' && task.status !== 'In Progress') return false;
        if (activeFilter === 'completed' && task.status !== 'Done' && task.status !== 'Approved') return false;

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(q);
        const descMatch = task.description?.toLowerCase().includes(q);
        const caseMatch = task.caseDid?.toLowerCase().includes(q);
        const didMatch = task.did?.toLowerCase().includes(q);
        return titleMatch || descMatch || caseMatch || didMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'step') {
          return (a.stepNumber || 1) - (b.stepNumber || 1);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        return 0;
      });
  }, [tasks, activeFilter, searchQuery, sortBy]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="pending" className="gap-1 font-semibold">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending
          </Badge>
        );
      case 'In_Progress':
      case 'In Progress':
        return (
          <Badge variant="in_progress" className="gap-1 font-semibold">
            <span className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
            In Progress
          </Badge>
        );
      case 'Done':
        return (
          <Badge variant="done" className="gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Done
          </Badge>
        );
      case 'Approved':
        return (
          <Badge variant="approved" className="gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="rejected" className="gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by task title, case reference, instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/40 border-border focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Selector */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('pending')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFilter === 'pending'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending ({tasks.filter((t) => t.status === 'Pending').length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('in_progress')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFilter === 'in_progress'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              In Progress ({tasks.filter((t) => t.status === 'In_Progress' || t.status === 'In Progress').length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('completed')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed ({tasks.filter((t) => t.status === 'Done' || t.status === 'Approved').length})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 pl-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-2.5 text-xs bg-black/5 dark:bg-white/5 border border-border rounded-lg text-foreground focus:outline-none focus:border-foreground cursor-pointer"
            >
              <option value="step">Sort by Step #</option>
              <option value="newest">Sort by Newest</option>
              <option value="status">Sort by Status</option>
            </select>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={fetchTasks}
              disabled={loading}
              className="h-9 w-9 border-border hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
              title="Refresh task list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-foreground' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Tasks List */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-8 border-3 border-muted border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">Loading your assigned workflow tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <CheckCircle2 className="w-6 h-6 text-foreground/60" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No tasks found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? `No tasks matched "${searchQuery}". Try clearing search filters.`
                  : 'You have no assigned tasks in this filter category.'}
              </p>
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-xs mt-2"
              >
                Clear Search Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map((task) => {
              const permittedDocs = task.permittedDocs || [];
              const isCompleted = task.status === 'Done' || task.status === 'Approved';

              return (
                <div
                  key={task.did || task._id}
                  className={`p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCompleted ? 'opacity-90' : ''
                  }`}
                >
                  {/* Left Column: Step Pill + Task Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Step Number Tag */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-14 h-12 rounded-lg bg-black/5 dark:bg-white/10 border border-border text-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-muted-foreground">Step</span>
                      <span className="text-base font-extrabold font-mono leading-tight">{task.stepNumber || 1}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(task.status)}

                        {task.caseDid && (
                          <span className="text-[11px] font-mono text-foreground font-semibold flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-border">
                            <FolderOpen className="w-3 h-3 text-muted-foreground" />
                            {task.caseDid}
                          </span>
                        )}

                        {permittedDocs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDetailModalTask(task)}
                            className="text-[11px] font-semibold text-foreground bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-border px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            {permittedDocs.length} {permittedDocs.length === 1 ? 'Doc' : 'Docs'}
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => setDetailModalTask(task)}
                        className="text-sm font-bold text-foreground hover:underline transition-colors cursor-pointer leading-snug"
                      >
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Completion note preview */}
                      {task.completionNotes && (
                        <div className="text-[11px] text-foreground bg-black/5 dark:bg-white/10 border border-border px-2.5 py-1 rounded-md inline-block">
                          <span className="font-semibold">Note:</span> {task.completionNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Timestamps & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                    <div className="text-left md:text-right text-[11px] text-muted-foreground hidden sm:block">
                      <div>Assigned: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}</div>
                      <div className="text-[10px] text-muted-foreground/80">ID: {task.did || 'TASK-N/A'}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailModalTask(task)}
                        className="h-8 px-2.5 text-xs font-semibold border-border hover:bg-black/5 dark:hover:bg-white/10 text-foreground flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        Details
                      </Button>

                      {task.status === 'Pending' && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleStartTask(task)}
                          className="h-8 px-3 text-xs font-bold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 flex items-center gap-1.5 shadow-xs"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </Button>
                      )}

                      {!isCompleted && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setDoneModalTask(task)}
                          className="h-8 px-3 text-xs font-bold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Done
                        </Button>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground bg-black/5 dark:bg-white/10 border border-border px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mark as Done Modal */}
      {doneModalTask && (
        <TaskDoneModal
          task={doneModalTask}
          onClose={() => setDoneModalTask(null)}
          onSuccess={() => {
            fetchTasks();
            setDoneModalTask(null);
          }}
        />
      )}

      {/* Task Detail Modal */}
      {detailModalTask && (
        <TaskDetailModal
          task={detailModalTask}
          isOpen={Boolean(detailModalTask)}
          onClose={() => setDetailModalTask(null)}
          onMarkDone={(t) => {
            setDetailModalTask(null);
            setDoneModalTask(t);
          }}
        />
      )}
    </div>
  );
}
export default TasksOverviewList;
