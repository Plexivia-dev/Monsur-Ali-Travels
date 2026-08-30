import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';

export function AdminHeader({ lang, setLang }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname !== '/admin') {
      if (location.pathname.startsWith('/admin/docs/')) {
        navigate('/admin/docs');
      } else {
        navigate(-1);
      }
    }
  };

  const showBackButton = location.pathname !== '/admin';

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:px-6 shadow-xs select-none">
      {/* Left: Back Navigation */}
      <div className="flex items-center gap-2 md:gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-white/95 text-slate-900 font-bold text-xs shadow-sm cursor-pointer border border-white/40 transition-all group"
            title={'Go back to previous page'}
          >
            <ArrowLeft className="h-4 w-4 text-slate-900 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            <span className="hidden sm:inline">{'Back'}</span>
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Language Switcher Pill */}
        <div
          onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
          className="flex items-center bg-white/10 hover:bg-white/15 border border-white/20 p-0.5 rounded-full cursor-pointer select-none shrink-0 transition-all duration-200"
          title={`Switch to ${lang === 'EN' ? 'Bengali' : 'English'}`}
        >
          <span
            className={cn(
              'text-[10.5px] font-bold uppercase px-2 py-0.5 rounded-full transition-all duration-200',
              lang === 'EN'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-white/80 hover:text-white'
            )}
          >
            EN
          </span>
          <span
            className={cn(
              'text-[10.5px] font-bold uppercase px-2 py-0.5 rounded-full transition-all duration-200',
              lang === 'BN'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-white/80 hover:text-white'
            )}
          >
            BN
          </span>
        </div>

        {/* Real-time Notifications Bell Dropdown */}
        <NotificationBell />
      </div>
    </header>
  );
}

export default AdminHeader;
