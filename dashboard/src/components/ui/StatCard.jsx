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
    blue: 'bg-primary/15 text-primary',
    amber: 'bg-amber-500/15 text-amber-500',
    emerald: 'bg-emerald-500/15 text-emerald-500',
    purple: 'bg-purple-500/15 text-purple-500',
    rose: 'bg-rose-500/15 text-rose-500',
    indigo: 'bg-secondary/15 text-secondary'
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 shadow-2xs hover:border-muted-foreground/30 transition-all group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold text-foreground tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${iconBgClasses[badgeColor] || iconBgClasses.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 gap-x-1 text-xs">
        {trend && (
          <div className="flex items-center gap-1 font-medium">
            {trendType === 'up' && (
              <span className="flex items-center text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                {trend}
              </span>
            )}
            {trendType === 'down' && (
              <span className="flex items-center text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                {trend}
              </span>
            )}
            {trendType === 'neutral' && (
              <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {trend}
              </span>
            )}
          </div>
        )}
        {subtitle && (
          <span className="text-muted-foreground truncate">
            {subtitle}
          </span>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-3 w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress > 80 ? 'bg-emerald-500' : progress > 50 ? 'bg-primary' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
