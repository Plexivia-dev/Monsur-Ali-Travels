import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  subtitle,
  icon: Icon,
  badgeColor = 'blue',
  progress
}) => {
  const iconBgClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${iconBgClasses[badgeColor] || iconBgClasses.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {trend && (
          <div className="flex items-center gap-1 font-medium">
            {trendType === 'up' && (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                {trend}
              </span>
            )}
            {trendType === 'down' && (
              <span className="flex items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                {trend}
              </span>
            )}
            {trendType === 'neutral' && (
              <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {trend}
              </span>
            )}
          </div>
        )}
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
            {subtitle}
          </span>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress > 80 ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
