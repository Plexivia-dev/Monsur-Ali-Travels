import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import TasksOverviewList from '../components/overview/TasksOverviewList';

export default function Overview() {
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState('all');

  const todayFormatted = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
              টাস্ক ওভারভিউ (Task Overview)
            </h1>
            <Badge variant="primary" className="font-semibold text-xs capitalize">
              {user?.role || 'Staff'} Workspace
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.name || user?.fullName || 'Colleague'}</span>. আপনার নির্ধারিত কাজের তালিকা ও আপডেট নিচে দেওয়া হলো।
          </p>
        </div>

        {/* Live Date Chip */}
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-semibold text-foreground">{englishDate}</span>
        </div>
      </div>

      {/* Horizontal KPI Summary Strip (Compact & Clickable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* All Tasks */}
        <div
          onClick={() => setFilter('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
            filter === 'all'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white ring-1 ring-black/20 dark:ring-white/20'
              : 'bg-card border-border hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'all' ? 'text-white/80 dark:text-black/70' : 'text-muted-foreground'}`}>
              মোট টাস্ক (Total)
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'all' ? 'text-white dark:text-black' : 'text-foreground'}`}>
              Assigned Tasks
            </span>
          </div>
          <div className={`p-2 rounded-lg border shrink-0 ${filter === 'all' ? 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-black/20 text-white dark:text-black' : 'bg-black/5 dark:bg-white/10 border-border text-foreground'}`}>
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => setFilter('pending')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
            filter === 'pending'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white ring-1 ring-black/20 dark:ring-white/20'
              : 'bg-card border-border hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'pending' ? 'text-white/80 dark:text-black/70' : 'text-muted-foreground'}`}>
              অপেক্ষমান (Pending)
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'pending' ? 'text-white dark:text-black' : 'text-foreground'}`}>
              To Be Started
            </span>
          </div>
          <div className={`p-2 rounded-lg border shrink-0 ${filter === 'pending' ? 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-black/20 text-white dark:text-black' : 'bg-black/5 dark:bg-white/10 border-border text-foreground'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setFilter('in_progress')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
            filter === 'in_progress'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white ring-1 ring-black/20 dark:ring-white/20'
              : 'bg-card border-border hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'in_progress' ? 'text-white/80 dark:text-black/70' : 'text-muted-foreground'}`}>
              চলমান (In Progress)
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'in_progress' ? 'text-white dark:text-black' : 'text-foreground'}`}>
              Active Working
            </span>
          </div>
          <div className={`p-2 rounded-lg border shrink-0 ${filter === 'in_progress' ? 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-black/20 text-white dark:text-black' : 'bg-black/5 dark:bg-white/10 border-border text-foreground'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setFilter('completed')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
            filter === 'completed'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white ring-1 ring-black/20 dark:ring-white/20'
              : 'bg-card border-border hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${filter === 'completed' ? 'text-white/80 dark:text-black/70' : 'text-muted-foreground'}`}>
              সম্পন্ন (Completed)
            </span>
            <span className={`text-xl font-extrabold tracking-tight ${filter === 'completed' ? 'text-white dark:text-black' : 'text-foreground'}`}>
              Done & Verified
            </span>
          </div>
          <div className={`p-2 rounded-lg border shrink-0 ${filter === 'completed' ? 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-black/20 text-white dark:text-black' : 'bg-black/5 dark:bg-white/10 border-border text-foreground'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Task List Table / View */}
      <TasksOverviewList activeFilter={filter} onFilterChange={setFilter} />
    </div>
  );
}
