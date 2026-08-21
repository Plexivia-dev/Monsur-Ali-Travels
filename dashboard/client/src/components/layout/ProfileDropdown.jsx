import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Settings, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePortalStore } from '../../store/usePortalStore';
import { usePortal } from '../../context/PortalContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ProfileDropdown = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { switchPortal } = usePortal();

  const displayName = user?.name || 'Administrator';
  const displayEmail = user?.email || 'admin@monsuralitravelsbd.com';
  const displayRole = (() => {
    const role = user?.role || 'Super Admin';
    if (String(role).toLowerCase() === 'staff') {
      const sub = user?.subRole || user?.sub_role || user?.designation;
      return sub ? sub.replace(/_/g, ' ') : 'Staff';
    }
    return role;
  })();
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted/80 cursor-pointer" />
        }
      >
        <Avatar className="size-8">
          <AvatarImage src={user?.avatar || ''} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="ring-background absolute right-0 bottom-0 block size-2.5 rounded-full bg-emerald-500 ring-2" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg border border-border">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 font-normal">
            <div className="relative">
              <Avatar className="size-9">
                <AvatarImage src={user?.avatar || ''} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="ring-background absolute right-0 bottom-0 block size-2.5 rounded-full bg-emerald-500 ring-2" />
            </div>
            <div className="flex flex-1 flex-col items-start overflow-hidden">
              <span className="text-foreground text-sm font-semibold truncate w-full">{displayName}</span>
              <span className="text-muted-foreground text-xs truncate w-full">{displayEmail}</span>
              <span className="text-[10px] text-primary font-medium tracking-wide uppercase mt-0.5">{displayRole}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-xs py-2"
            onClick={() => switchPortal('admin', 'profile')}
          >
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{t('header.myProfile', 'My Account & Profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-xs py-2"
            onClick={() => switchPortal('admin', 'settings')}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span>{t('header.systemSettings', 'System Settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="flex items-center gap-2 cursor-pointer text-xs py-2 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>{t('header.signOut', 'Sign out')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
