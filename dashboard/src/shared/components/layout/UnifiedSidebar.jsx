import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  ChevronRight,
  Globe,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
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
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import logoImg from '@shared/assets/logo.png';

/**
 * Universal Sidebar Component for Client and Admin Dashboards.
 * 
 * Features:
 * - space-y-3 spacing between menu items
 * - Pure white icons on active / selected state and on hover
 * - Unified responsive collapsible behavior (icon collapse 48px <-> expanded 256px)
 * - Brand header with logo, title, and collapse trigger
 * - Smooth collapsible submenus with indicator lines
 * - Footer with user profile info, role badge, and Sign Out action
 */
export function UnifiedSidebar({
  menuGroups = [],
  activeChecker,
  onItemSelect,
  brandTitle = 'Monsur Ali Travels',
  brandSubtitle = 'Smart ERP v3.1',
  logo = logoImg,
  user = null,
  onLogout = () => {},
  onProfileClick = null,
  lang = 'EN',
  className = '',
}) {
  const { state, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [openMenus, setOpenMenus] = useState({});

  // Keep parent menus persistently open when any child is active to prevent collapsible accordion flicker
  React.useEffect(() => {
    if (!Array.isArray(menuGroups)) return;
    setOpenMenus((prev) => {
      let hasChanges = false;
      const next = { ...prev };
      
      menuGroups.forEach((group) => {
        group.items?.forEach((item) => {
          if (item.childItems?.some((child) => activeChecker?.(child))) {
            const id = item.id || item.name;
            if (!next[id]) {
              next[id] = true;
              hasChanges = true;
            }
          }
        });
      });
      
      return hasChanges ? next : prev;
    });
  }, [menuGroups, activeChecker]);

  const toggleGroup = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleGroupClick = (id) => {
    if (isCollapsed) {
      setOpen(true);
      setOpenMenus((prev) => ({
        ...prev,
        [id]: true,
      }));
    } else {
      toggleGroup(id);
    }
  };

  const handleNavClick = (item) => {
    if (isCollapsed) {
      setOpen(true);
    }
    if (onItemSelect) {
      onItemSelect(item);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderIcon = (iconName, extraClassName = '') => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.FileText;
    return <IconComponent className={cn('w-4.5 h-4.5 shrink-0 transition-colors duration-200', extraClassName)} />;
  };

  const userRole = String(user?.role || '').toLowerCase();
  const userSubRole = String(user?.subRole || user?.sub_role || user?.designation || '').toLowerCase();

  return (
    <SidebarPrimitive
      collapsible="icon"
      className={cn(
        'border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out select-none',
        className
      )}
    >
      {/* Brand Header */}
      <SidebarHeader className="h-14 border-b border-sidebar-border px-3 flex items-center justify-center transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="size-9 rounded-full border border-sky-400/50 hover:border-sky-300 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sky-300 hover:text-white flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 cursor-pointer"
            title={lang === 'BN' ? 'সাইডবার খুলুন' : 'Open Sidebar'}
            aria-label="Open Sidebar"
          >
            <Menu className="w-4 h-4 text-sky-300 hover:text-white" />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <div
              onClick={() => handleNavClick({ path: '/' })}
              className="flex items-center justify-start gap-2.5 cursor-pointer group/brand overflow-hidden text-left"
            >
              <div className="size-10 rounded-full bg-white p-[3px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-white/30">
                {logo ? (
                  <img src={logo} alt={brandTitle} className="w-full h-full object-contain" />
                ) : (
                  <Globe className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex flex-col min-w-0 text-left items-start">
                <span className="font-bold text-sm text-sidebar-foreground tracking-tight truncate leading-tight">
                  {brandTitle}
                </span>
                <span className="text-[10px] text-sky-200 font-semibold uppercase tracking-wider mt-0.5">
                  {brandSubtitle}
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
              className="size-7 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 border border-sidebar-border text-sky-300 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
              title={lang === 'BN' ? 'সাইডবার বন্ধ করুন' : 'Close Sidebar'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="p-2 space-y-4">
        {menuGroups.map((group, groupIdx) => {
          // Role filtering for groups
          if (group.roles && group.roles.length > 0) {
            const hasRole = group.roles.includes(userRole) || group.roles.includes(userSubRole);
            if (!hasRole) return null;
          }
          if (group.excludeRoles && group.excludeRoles.length > 0) {
            const isExcluded = group.excludeRoles.includes(userRole) || group.excludeRoles.includes(userSubRole);
            if (isExcluded) return null;
          }

          const groupLabel = lang === 'BN' ? (group.groupLabelBn || group.groupLabel) : group.groupLabel;

          return (
            <SidebarGroup key={groupIdx} className="p-0">
              {groupLabel && (
                <SidebarGroupLabel className="px-3 pt-2 pb-1 text-[11px] font-extrabold tracking-widest text-sky-400 uppercase">
                  {groupLabel}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                {/* Applied space-y-3 between menu items */}
                <SidebarMenu className="space-y-3">
                  {group.items.map((item, itemIdx) => {
                    // Role filtering for items
                    if (item.roles && item.roles.length > 0) {
                      const hasRole = item.roles.includes(userRole) || item.roles.includes(userSubRole);
                      if (!hasRole) return null;
                    }
                    if (item.excludeRoles && item.excludeRoles.length > 0) {
                      const isExcluded = item.excludeRoles.includes(userRole) || item.excludeRoles.includes(userSubRole);
                      if (isExcluded) return null;
                    }

                    const hasChildren = Array.isArray(item.childItems) && item.childItems.length > 0;
                    const itemLabel = lang === 'BN' ? (item.nameBn || item.name || item.label) : (item.name || item.label);

                    if (hasChildren) {
                      const isAnyChildActive = item.childItems.some((child) =>
                        activeChecker ? activeChecker(child) : false
                      );
                      const isCollapsibleOpen = openMenus[item.id || item.name] ?? isAnyChildActive;

                      return (
                        <Collapsible
                          key={itemIdx}
                          open={isCollapsibleOpen}
                          onOpenChange={() => toggleGroup(item.id || item.name)}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              tooltip={itemLabel}
                              onClick={(e) => {
                                e.preventDefault();
                                handleGroupClick(item.id || item.name);
                              }}
                              className={cn(
                                'group w-full justify-between cursor-pointer font-medium text-sm py-2 px-3 rounded-xl transition-all duration-200 text-sidebar-foreground hover:text-white hover:bg-sidebar-accent',
                                isAnyChildActive &&
                                  'bg-white/20 text-white font-bold border border-white/30 shadow-xs'
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {renderIcon(
                                  item.icon,
                                  cn(
                                    isAnyChildActive
                                      ? 'text-white'
                                      : 'text-sky-300 group-hover:text-white'
                                  )
                                )}
                                <span className="truncate group-hover:text-white">{itemLabel}</span>
                              </div>
                              <ChevronRight
                                className={cn(
                                  'w-4 h-4 transition-transform duration-200',
                                  isAnyChildActive
                                    ? 'text-white'
                                    : 'text-sky-300 group-hover:text-white',
                                  isCollapsibleOpen && 'rotate-90',
                                  'group-data-[collapsible=icon]:hidden'
                                )}
                              />
                            </SidebarMenuButton>
                            <CollapsibleContent>
                              {/* Submenu with space-y-2 */}
                              <SidebarMenuSub className="ml-5 border-l-2 border-sky-400/30 pl-3 my-2 space-y-2">
                                {item.childItems.map((subItem, subIdx) => {
                                  if (subItem.roles && subItem.roles.length > 0) {
                                    const hasRole = subItem.roles.includes(userRole) || subItem.roles.includes(userSubRole);
                                    if (!hasRole) return null;
                                  }
                                  const isSubActive = activeChecker ? activeChecker(subItem) : false;
                                  const subLabel = lang === 'BN' ? (subItem.nameBn || subItem.name || subItem.label) : (subItem.name || subItem.label);

                                  return (
                                    <SidebarMenuSubItem key={subIdx}>
                                      <SidebarMenuSubButton
                                        isActive={isSubActive}
                                        onClick={() => handleNavClick(subItem)}
                                        className={cn(
                                          'group cursor-pointer text-[13px] rounded-lg py-2 px-2.5 flex items-center gap-2 transition-all duration-200',
                                          isSubActive
                                            ? '!bg-white !text-slate-900 font-bold shadow-xs hover:!bg-white hover:!text-slate-900 focus:!text-slate-900 focus:!bg-white active:!bg-white active:!text-slate-900'
                                            : 'text-sidebar-foreground/85 hover:text-white hover:bg-sidebar-accent font-medium'
                                        )}
                                      >
                                        {subItem.icon &&
                                          renderIcon(
                                            subItem.icon,
                                            cn(
                                              'w-4 h-4 shrink-0 transition-colors',
                                              isSubActive
                                                ? '!text-slate-900 group-hover:!text-slate-900'
                                                : 'text-sky-300 group-hover:text-white'
                                            )
                                          )}
                                        <span
                                          className={cn(
                                            'truncate transition-colors',
                                            isSubActive
                                              ? '!text-slate-900 group-hover:!text-slate-900 font-bold'
                                              : 'group-hover:text-white'
                                          )}
                                        >
                                          {subLabel}
                                        </span>
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

                    const isActive = activeChecker ? activeChecker(item) : false;

                    return (
                      <SidebarMenuItem key={itemIdx}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={itemLabel}
                          onClick={() => handleNavClick(item)}
                          className={cn(
                            'group cursor-pointer text-sm font-medium py-2 px-3 rounded-xl transition-all duration-200',
                            isActive
                              ? '!bg-white !text-slate-900 font-bold shadow-xs hover:!bg-white hover:!text-slate-900 focus:!text-slate-900 focus:!bg-white active:!bg-white active:!text-slate-900'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
                          )}
                        >
                          {renderIcon(
                            item.icon,
                            cn(
                              'w-4.5 h-4.5 shrink-0 transition-colors',
                              isActive
                                ? '!text-slate-900 group-hover:!text-slate-900'
                                : 'text-sky-300 group-hover:text-white'
                            )
                          )}
                          <span
                            className={cn(
                              'truncate transition-colors',
                              isActive
                                ? '!text-slate-900 group-hover:!text-slate-900 font-bold'
                                : 'group-hover:text-white'
                            )}
                          >
                            {itemLabel}
                          </span>
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
      <SidebarFooter className="border-t border-sidebar-border p-2 flex items-center justify-center overflow-hidden transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={onProfileClick}
            className="size-8 rounded-full border border-sky-400/50 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sky-300 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer mx-auto shadow-xs"
            title={user?.name || 'My Profile'}
            aria-label="Profile"
          >
            <User className="w-4 h-4 text-sky-300 hover:text-white" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl bg-sidebar-accent border border-sidebar-border w-full overflow-hidden shadow-xs">
            <div
              onClick={onProfileClick}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title={user?.name || 'My Profile'}
            >
              <div className="size-9 rounded-full bg-sky-500/30 border border-sky-300/40 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-bold text-sidebar-foreground truncate leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10.5px] text-sky-200 font-medium truncate mt-0.5">
                  {user?.role || 'Staff'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="size-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
              title={lang === 'BN' ? 'লগআউট' : 'Sign Out'}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

export default UnifiedSidebar;
