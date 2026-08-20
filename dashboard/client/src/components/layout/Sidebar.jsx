import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, Globe, Menu, X, LogOut, User } from 'lucide-react';
import { usePortalStore } from '../../store/usePortalStore';
import { useAuthStore } from '../../store/useAuthStore';
import { navGroups } from '../../configs/navConfig';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import logoImg from '../../assets/logo.png';
import { APP_VERSION } from '../../configs/appConfig';

export const Sidebar = () => {
  const { t } = useTranslation();
  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { state, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Maintain open state for collapsible parent menus
  const [openMenus, setOpenMenus] = useState({
    'Clients & Accounts': true,
  });

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Handle click on leaf item
  const handleItemSelect = (portal, submodule) => {
    switchPortal(portal, submodule);
    if (isCollapsed) {
      setOpen(true);
    } else {
      setOpen(false);
      if (isMobile) setOpenMobile(false);
    }
  };

  // Handle parent menu trigger click
  const handleParentMenuClick = (label) => {
    if (isCollapsed) {
      setOpen(true);
      setOpenMenus((prev) => ({ ...prev, [label]: true }));
    } else {
      toggleMenu(label);
    }
  };

  // Render icon safely from Lucide
  const renderIcon = (iconName, className = 'w-4 h-4') => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.FileText;
    return <IconComponent className={className} />;
  };

  return (
    <SidebarPrimitive collapsible="icon" className="border-r border-border bg-sidebar transition-all duration-300 ease-in-out">
      {/* Brand Header */}
      <SidebarHeader className="h-14 border-b border-white/15 px-3 flex items-center justify-center transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="size-9 rounded-full border border-sky-400/50 hover:border-sky-300 bg-white/10 hover:bg-white/20 text-sky-300 flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 cursor-pointer"
            title={t('brand.openSidebar', 'Open Sidebar')}
            aria-label={t('brand.openSidebar', 'Open Sidebar')}
          >
            <Menu className="w-4 h-4 text-sky-300" />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <div
              onClick={() => handleItemSelect('agency', 'dashboard')}
              className="flex items-center justify-start gap-2.5 cursor-pointer group/brand overflow-hidden text-left"
            >
              <div className="size-10 rounded-full bg-white p-[3px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-white/30">
                {logoImg ? (
                  <img src={logoImg} alt={t('brand.name', 'Monsur Ali Travels')} className="w-full h-full object-contain" />
                ) : (
                  <Globe className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex flex-col min-w-0 text-left items-start">
                <span className="font-bold text-sm text-white tracking-tight truncate leading-tight">
                  {t('brand.name', 'Monsur Ali Travels')}
                </span>
                <span className="text-[10px] text-sky-200 font-semibold uppercase tracking-wider mt-0.5">
                  {t('brand.tagline', { version: APP_VERSION, defaultValue: `Smart ERP v${APP_VERSION}` })}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (isMobile) setOpenMobile(false);
              }}
              className="size-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sky-300 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
              title={t('brand.closeSidebar', 'Close Sidebar')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="p-2 space-y-3">
        {navGroups.map((group, groupIdx) => {
          const displayGroupLabel = group.groupKey ? t(group.groupKey, group.groupLabel) : group.groupLabel;

          return (
            <SidebarGroup key={groupIdx} className="p-0">
              <SidebarGroupLabel className="px-3 pt-3 pb-1 text-[11px] font-extrabold tracking-widest text-sky-400 uppercase">
                {displayGroupLabel}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, itemIdx) => {
                    const hasChildren = Array.isArray(item.childItems) && item.childItems.length > 0;
                    const displayItemLabel = item.key ? t(item.key, item.label) : item.label;

                    if (hasChildren) {
                      const isChildActive = item.childItems.some(
                        (c) => activePortal === c.portal && activeSubmodule === c.submodule
                      );
                      const isOpen = openMenus[item.label] ?? isChildActive;

                      return (
                        <Collapsible
                          key={itemIdx}
                          open={isOpen}
                          onOpenChange={() => handleParentMenuClick(item.label)}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              tooltip={displayItemLabel}
                              onClick={(e) => {
                                e.preventDefault();
                                handleParentMenuClick(item.label);
                              }}
                              className={cn(
                                'w-full justify-between cursor-pointer font-medium text-sm py-2 px-3 rounded-xl transition-all duration-200 text-white hover:text-white hover:bg-white/10',
                                isChildActive && 'text-white font-bold bg-sky-500/25 border border-sky-400/40 shadow-xs'
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {renderIcon(item.icon, cn('w-4.5 h-4.5 shrink-0 transition-colors', isChildActive ? 'text-white' : 'text-sky-300'))}
                                <span className="truncate">{displayItemLabel}</span>
                              </div>
                              <ChevronRight
                                className={cn(
                                  'w-4 h-4 text-sky-300 transition-transform duration-200',
                                  isOpen && 'rotate-90',
                                  'group-data-[collapsible=icon]:hidden'
                                )}
                              />
                            </SidebarMenuButton>
                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-5 border-l-2 border-sky-400/30 pl-3 my-1.5 space-y-1">
                                {item.childItems.map((subItem, subIdx) => {
                                  const isActive =
                                    activePortal === subItem.portal && activeSubmodule === subItem.submodule;
                                  const displaySubLabel = subItem.key ? t(subItem.key, subItem.label) : subItem.label;

                                  return (
                                    <SidebarMenuSubItem key={subIdx}>
                                      <SidebarMenuSubButton
                                        isActive={isActive}
                                        onClick={() => handleItemSelect(subItem.portal, subItem.submodule)}
                                        className={cn(
                                          'cursor-pointer text-[13px] rounded-lg py-2 px-2.5 flex items-center gap-2 transition-all duration-200',
                                          isActive
                                            ? 'bg-sky-500/25 text-white font-bold border border-sky-400/40 shadow-xs'
                                            : 'text-slate-100 hover:text-white hover:bg-white/10 font-medium'
                                        )}
                                      >
                                        {subItem.icon && renderIcon(subItem.icon, cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-sky-300/90'))}
                                        <span className="truncate">{displaySubLabel}</span>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    }

                    const isActive = activePortal === item.portal && activeSubmodule === item.submodule;

                    return (
                      <SidebarMenuItem key={itemIdx}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={displayItemLabel}
                          onClick={() => handleItemSelect(item.portal, item.submodule)}
                          className={cn(
                            'cursor-pointer text-sm font-medium py-2 px-3 rounded-xl transition-all duration-200',
                            isActive
                              ? 'bg-sky-500/25 text-white font-bold border border-sky-400/40 shadow-xs'
                              : 'text-white hover:bg-white/10 hover:text-white'
                          )}
                        >
                          {renderIcon(
                            item.icon,
                            cn('w-4.5 h-4.5 shrink-0 transition-colors', isActive ? 'text-white' : 'text-sky-300')
                          )}
                          <span className="truncate">{displayItemLabel}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer Info */}
      <SidebarFooter className="border-t border-white/15 p-2 flex items-center justify-center overflow-hidden transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => handleItemSelect('admin', 'profile')}
            className="size-8 rounded-full border border-sky-400/50 bg-white/10 hover:bg-white/20 text-sky-300 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer mx-auto shadow-xs"
            title={user?.name ? `${user.name} (${t('header.myProfile', 'My Profile')})` : t('header.myProfile', 'My Profile')}
            aria-label={t('header.myProfile', 'My Profile')}
          >
            <User className="w-4 h-4 text-sky-300" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl bg-white/10 border border-white/15 w-full overflow-hidden shadow-xs">
            <div
              onClick={() => handleItemSelect('admin', 'profile')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title={t('header.myProfile', 'My Profile')}
            >
              <div className="size-9 rounded-full bg-sky-500/30 border border-sky-300/40 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10.5px] text-sky-200 font-medium truncate mt-0.5">{user?.role || 'Super Admin'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="size-8 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
              title={t('common.logout', 'Logout')}
              aria-label={t('common.logout', 'Logout')}
            >
              <LogOut className="w-4 h-4 transition-colors" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </SidebarPrimitive>
  );
};

export default Sidebar;
