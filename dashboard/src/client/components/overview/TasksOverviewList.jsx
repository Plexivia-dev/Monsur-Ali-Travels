import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  FileText,
  Eye,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '../../lib/api-client';
import { TaskDoneModal } from '../tasks/TaskDoneModal';
import { TaskDetailModal } from './TaskDetailModal';
import { CaseWorkspaceDrawer } from '../agency/CaseWorkspaceDrawer';
import { toast } from 'sonner';

export function TasksOverviewList({ activeFilter, onFilterChange }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('step'); // 'step', 'newest', 'status'

  // Modals state
  const [doneModalTask, setDoneModalTask] = useState(null);
  const [detailModalTask, setDetailModalTask] = useState(null);

  // Case Drawer State
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch tasks exclusively from live backend API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/tasks/my-tasks');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTasks(res.data.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setTasks([]);
      toast.error(err.response?.data?.message || 'Failed to fetch assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (activeFilter === 'pending') return task.status === 'Pending';
        if (activeFilter === 'in_progress') return task.status === 'In_Progress' || task.status === 'In Progress';
        if (activeFilter === 'completed') return task.status === 'Done' || task.status === 'Approved';
        return true;
      })
      .filter((task) => {
        // Search query filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          task.title?.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.did?.toLowerCase().includes(q) ||
          task.caseDid?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'step') {
          return (a.stepNumber || 0) - (b.stepNumber || 0);
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

  // Helper for status badge
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '_');
    if (s === 'pending') {
      return (
        <Badge variant="pending" className="font-semibold text-xs">
          Pending
        </Badge>
      );
    }
    if (s === 'in_progress' || s === 'in progress') {
      return (
        <Badge variant="in_progress" className="font-semibold text-xs">
          In Progress
        </Badge>
      );
    }
    if (s === 'done' || s === 'approved') {
      return (
        <Badge variant="done" className="font-semibold text-xs">
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-semibold text-xs">
        {status || 'Unknown'}
      </Badge>
    );
  };

  const handleOpenCaseDrawer = (caseDid) => {
    if (!caseDid) return;
    setSelectedCaseId(caseDid);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, ID, or case number..."
            className="pl-9 h-9 text-xs bg-muted/40 border-border focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Selector */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-card text-foreground shadow-xs'
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
                  ? 'bg-card text-foreground shadow-xs'
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
                  ? 'bg-card text-foreground shadow-xs'
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
                  ? 'bg-card text-foreground shadow-xs'
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
              className="h-9 px-2.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary cursor-pointer"
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
              className="h-9 w-9 border-border hover:bg-muted shrink-0"
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
            <div className="size-8 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">Loading your assigned workflow tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <CheckCircle2 className="w-6 h-6 text-primary" />
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
                  className={`p-4 transition-colors hover:bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCompleted ? 'opacity-90' : ''
                  }`}
                >
                  {/* Left Column: Step Pill + Task Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Step Number Tag */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-14 h-12 rounded-lg bg-muted border border-border text-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-muted-foreground">Step</span>
                      <span className="text-base font-extrabold font-mono leading-tight">{task.stepNumber || 1}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(task.status)}

                        {task.caseDid && (
                          <button
                            type="button"
                            onClick={() => handleOpenCaseDrawer(task.caseDid)}
                            className="text-[11px] font-mono text-foreground font-semibold flex items-center gap-1 bg-muted hover:bg-muted/80 px-2 py-0.5 rounded border border-border transition-colors cursor-pointer"
                            title="Click to open case workspace"
                          >
                            <FolderOpen className="w-3 h-3 text-muted-foreground" />
                            {task.caseDid}
                          </button>
                        )}

                        {permittedDocs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDetailModalTask(task)}
                            className="text-[11px] font-semibold text-foreground bg-muted hover:bg-muted/80 border border-border px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-primary" />
                            {permittedDocs.length} {permittedDocs.length === 1 ? 'Doc' : 'Docs'}
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => setDetailModalTask(task)}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug"
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
                        <div className="text-[11px] text-foreground bg-muted/60 border border-border px-2.5 py-1 rounded-md inline-block">
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
                      {!isCompleted ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setDetailModalTask(task)}
                          className="h-8 px-3.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Do Task
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailModalTask(task)}
                            className="h-8 px-2.5 text-xs font-semibold border-border hover:bg-muted text-foreground flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            View Details
                          </Button>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Completed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Completion Modal */}
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

      {/* Enhanced Task Execution Modal */}
      {detailModalTask && (
        <TaskDetailModal
          task={detailModalTask}
          isOpen={Boolean(detailModalTask)}
          onClose={() => setDetailModalTask(null)}
          onOpenCaseWorkspace={(caseDid) => handleOpenCaseDrawer(caseDid)}
          onRefreshTasks={fetchTasks}
          onMarkDone={(t) => {
            setDetailModalTask(null);
            setDoneModalTask(t);
          }}
        />
      )}

      {/* 360-Degree Case Workspace Drawer */}
      {isDrawerOpen && selectedCaseId && (
        <CaseWorkspaceDrawer
          caseId={selectedCaseId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedCaseId(null);
          }}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
}

export default TasksOverviewList;
