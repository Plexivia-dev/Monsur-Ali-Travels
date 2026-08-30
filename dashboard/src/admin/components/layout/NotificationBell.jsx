import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  User,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    initSocket,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (user?.did || user?.id) {
      initSocket(user.did || user.id);
    }
  }, [user, initSocket]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (item) => {
    const notifId = item._id || item.did || item.id;
    if (!item.isRead) {
      await markAsRead(notifId);
    }
    setIsOpen(false);

    if (item.module === 'visa' && item.refDid) {
      navigate(`/admin/visa-workflows/${item.refDid}`);
    } else if (item.module === 'invoice' || item.module === 'agreement') {
      navigate(`/admin/docs`);
    } else if (item.module === 'client' && item.refDid) {
      navigate(`/admin/clients/${item.refDid}`);
    } else {
      navigate('/admin/system/activity-logs');
    }
  };

  const getModuleIcon = (module, type) => {
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (type === 'danger') return <XCircle className="w-4 h-4 text-rose-500" />;

    switch (module) {
      case 'visa':
        return <Layers className="w-4 h-4 text-sky-500" />;
      case 'invoice':
        return <CreditCard className="w-4 h-4 text-indigo-500" />;
      case 'agreement':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'client':
        return <User className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const past = new Date(dateStr);
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer',
          isOpen && 'bg-white/15'
        )}
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="h-4.5 w-4.5 text-white" />

        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-sidebar animate-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sky-400/80 ring-2 ring-sidebar" />
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-foreground">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30 text-muted-foreground" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[11px] text-muted-foreground/70">
                  Real-time events and operational alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const notifKey = item.did || item._id || item.id;
                const isUnread = !item.isRead;

                return (
                  <div
                    key={notifKey}
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      'p-3.5 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer text-left relative group',
                      isUnread && 'bg-primary/5 dark:bg-primary/10'
                    )}
                  >
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-foreground shrink-0 mt-0.5 border border-zinc-200/60 dark:border-zinc-700/50">
                      {getModuleIcon(item.module, item.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn('text-xs truncate font-bold text-foreground', isUnread && 'text-primary dark:text-sky-400')}>
                          {item.title || 'Notification'}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {item.message}
                      </p>

                      {item.createdBy && (
                        <p className="text-[9.5px] text-muted-foreground/60 mt-1">
                          By: {item.createdBy}
                        </p>
                      )}
                    </div>

                    {isUnread && (
                      <span className="size-2 rounded-full bg-primary shrink-0 self-center" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/system/activity-logs');
              }}
              className="w-full py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View All System Activity Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
