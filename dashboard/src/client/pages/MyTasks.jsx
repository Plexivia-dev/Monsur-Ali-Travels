import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Loader2, FileText, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import { TaskDoneModal } from '../components/tasks/TaskDoneModal';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/tasks/my-tasks');
      const data = res.data?.data || res.data || [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load assigned tasks.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-5 p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-sky-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              My Assigned Operational Tasks
            </h1>
            <p className="text-xs text-sky-100/70 max-w-xl">
              View and execute tasks assigned to you by Admin. Review permitted documents and submit completion notes when finished.
            </p>
          </div>
          <button
            onClick={fetchMyTasks}
            className="p-2.5 bg-white hover:bg-gray-50 text-sky-600 rounded-xl border border-gray-200 transition-all cursor-pointer shadow-sm self-start md:self-auto"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {['all', 'pending', 'in_progress', 'done', 'approved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${statusFilter === st
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Fetching assigned tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Tasks Found</h3>
          <p className="text-xs text-muted-foreground">You currently have no tasks matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.did || task._id}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-sky-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-sky-400">Step {task.stepNumber || 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : task.status === 'Done'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                  >
                    {task.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground leading-snug">{task.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description || 'No detailed instructions provided.'}</p>

                {/* Permitted Documents Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border">
                  <Lock className="w-3 h-3 text-sky-400" />
                  <span>{(task.permittedDocs || []).length} Permitted Document(s) Attached</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">Ref: {task.caseDid?.substring(0, 10)}...</span>
                {task.status !== 'Approved' && task.status !== 'Done' ? (
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Execute Task <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Task Submitted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Done Modal */}
      {selectedTask && (
        <TaskDoneModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={fetchMyTasks}
        />
      )}
    </div>
  );
}
