import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import TasksOverviewList from '../components/overview/TasksOverviewList';

export default function Overview() {
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState('all');

  const englishDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Task Overview
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs capitalize bg-black/5 text-black border border-black/10">
              {user?.role || 'Staff'} Workspace
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-black/60">
            Welcome back, <span className="font-semibold text-black">{user?.name || user?.fullName || 'Colleague'}</span>. Here is your assigned task overview and active workflow status.
          </p>
        </div>

        {/* Live Date Chip */}
        <div className="flex items-center gap-2 bg-white border border-black/10 px-3 py-1.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-black/70" />
          <span className="text-xs font-semibold text-black">{englishDate}</span>
        </div>
      </div>

      {/* Horizontal KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* All Tasks */}
        <div
          onClick={() => setFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            filter === 'all'
              ? 'bg-linear-to-r from-sky-950 via-indigo-950 to-black text-white border-sky-600/50 shadow-lg shadow-sky-950/25 ring-1 ring-sky-400/30'
              : 'bg-white border-black/10 hover:bg-black/[0.03] shadow-xs text-black'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'all' ? 'text-sky-300' : 'text-black/60'}`}>
              Total Tasks
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'all' ? 'text-white' : 'text-black'}`}>
              All Assigned
            </span>
          </div>
          <div className={`p-2 rounded-xl border shrink-0 ${filter === 'all' ? 'bg-white/10 border-white/20 text-sky-300 shadow-inner' : 'bg-black/[0.04] border-black/10 text-black'}`}>
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => setFilter('pending')}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            filter === 'pending'
              ? 'bg-linear-to-r from-sky-950 via-indigo-950 to-black text-white border-sky-600/50 shadow-lg shadow-sky-950/25 ring-1 ring-sky-400/30'
              : 'bg-white border-black/10 hover:bg-black/[0.03] shadow-xs text-black'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'pending' ? 'text-amber-300' : 'text-black/60'}`}>
              Pending Tasks
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'pending' ? 'text-white' : 'text-black'}`}>
              Action Required
            </span>
          </div>
          <div className={`p-2 rounded-xl border shrink-0 ${filter === 'pending' ? 'bg-white/10 border-white/20 text-amber-300 shadow-inner' : 'bg-black/[0.04] border-black/10 text-black'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setFilter('in_progress')}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            filter === 'in_progress'
              ? 'bg-linear-to-r from-sky-950 via-indigo-950 to-black text-white border-sky-600/50 shadow-lg shadow-sky-950/25 ring-1 ring-sky-400/30'
              : 'bg-white border-black/10 hover:bg-black/[0.03] shadow-xs text-black'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'in_progress' ? 'text-sky-300' : 'text-black/60'}`}>
              In Progress
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'in_progress' ? 'text-white' : 'text-black'}`}>
              In Workflow
            </span>
          </div>
          <div className={`p-2 rounded-xl border shrink-0 ${filter === 'in_progress' ? 'bg-white/10 border-white/20 text-sky-300 shadow-inner' : 'bg-black/[0.04] border-black/10 text-black'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setFilter('completed')}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            filter === 'completed'
              ? 'bg-linear-to-r from-sky-950 via-indigo-950 to-black text-white border-sky-600/50 shadow-lg shadow-sky-950/25 ring-1 ring-sky-400/30'
              : 'bg-white border-black/10 hover:bg-black/[0.03] shadow-xs text-black'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'completed' ? 'text-emerald-300' : 'text-black/60'}`}>
              Completed
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'completed' ? 'text-white' : 'text-black'}`}>
              Done & Verified
            </span>
          </div>
          <div className={`p-2 rounded-xl border shrink-0 ${filter === 'completed' ? 'bg-white/10 border-white/20 text-emerald-300 shadow-inner' : 'bg-black/[0.04] border-black/10 text-black'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Task List Table / View */}
      <TasksOverviewList activeFilter={filter} onFilterChange={setFilter} />
    </div>
  );
}
