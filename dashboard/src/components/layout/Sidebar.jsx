import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, Globe, Menu, X } from 'lucide-react';
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

export const Sidebar = () => {
  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const user = useAuthStore((state) => state.user);
  const { state, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Maintain open state for collapsible parent menus
  const [openMenus, setOpenMenus] = useState({
    Candidates: true,
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
      <SidebarHeader className="h-16 border-b border-sidebar-border px-2 flex items-center justify-center transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="size-9 rounded-full bg-white p-[4px] border border-border/20 flex items-center justify-center shrink-0 shadow-xs hover:opacity-90 transition-all duration-200 cursor-pointer overflow-hidden"
            title="Open Sidebar"
          >
            {logoImg ? (
              <img src={logoImg} alt="Monsur Ali Travels" className="w-full h-full object-contain" />
            ) : (
              <Globe className="w-4 h-4 text-primary" />
            )}
          </button>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <div
              onClick={() => handleItemSelect('agency', 'dashboard')}
              className="flex items-center justify-start gap-2.5 cursor-pointer group/brand overflow-hidden text-left"
            >
              <div className="size-10 rounded-full bg-white p-[4px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-border/20">
                {logoImg ? (
                  <img src={logoImg} alt="Monsur Ali Travels" className="w-full h-full object-contain" />
                ) : (
                  <Globe className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex flex-col min-w-0 text-left items-start">
                <span className="font-semibold text-sm text-sidebar-foreground tracking-tight truncate leading-tight">
                  Monsur Ali Travels
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  Smart ERP v2.0
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
              className="size-6 rounded-full border border-border p-[2px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Close Sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="p-2 space-y-4">
        {navGroups.map((group, groupIdx) => {
          return (
            <SidebarGroup key={groupIdx} className="p-0">
              <SidebarGroupLabel className="px-3 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                {group.groupLabel}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, itemIdx) => {
                    const hasChildren = Array.isArray(item.childItems) && item.childItems.length > 0;

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
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                tooltip={item.label}
                                onClick={(e) => {
                                  if (isCollapsed) {
                                    e.preventDefault();
                                    handleParentMenuClick(item.label);
                                  }
                                }}
                                className={cn(
                                  'w-full justify-between cursor-pointer font-medium text-xs transition-all duration-200',
                                  isChildActive && 'text-primary font-semibold'
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {renderIcon(item.icon, 'w-4 h-4 shrink-0')}
                                  <span className="truncate">{item.label}</span>
                                </div>
                                <ChevronRight
                                  className={cn(
                                    'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                                  )}
                                />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-5 border-l border-sidebar-border pl-2 my-1 space-y-0.5">
                                {item.childItems.map((subItem, subIdx) => {
                                  const isActive =
                                    activePortal === subItem.portal && activeSubmodule === subItem.submodule;

                                  return (
                                    <SidebarMenuSubItem key={subIdx}>
                                      <SidebarMenuSubButton
                                        isActive={isActive}
                                        onClick={() => handleItemSelect(subItem.portal, subItem.submodule)}
                                        className={cn(
                                          'cursor-pointer text-xs rounded-md py-1.5 transition-colors duration-200',
                                          isActive
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                                        )}
                                      >
                                        <span className="truncate">{subItem.label}</span>
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
                          tooltip={item.label}
                          onClick={() => handleItemSelect(item.portal, item.submodule)}
                          className={cn(
                            'cursor-pointer text-xs font-medium rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:text-primary-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          {renderIcon(
                            item.icon,
                            cn('w-4 h-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')
                          )}
                          <span className="truncate">{item.label}</span>
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
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-1 py-1 rounded-lg bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center">
          <div className="size-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-sidebar-foreground truncate">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">{user?.role || 'Super Admin'}</span>
          </div>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
};

export default Sidebar;
