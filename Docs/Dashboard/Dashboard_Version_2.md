# Dashboard Version 2 Change Logs (DR-01 to DR-20)

This document tracks the comprehensive redesign of the Monsur Ali Travels ERP Dashboard to match the modern Shadcn UI Admin layout (`ref` template) and full migration of state management to **Zustand**. Entries are sorted with the latest at the top.

---

### DR-12: Redesign Modern Collapsible Sidebar Component (`Sidebar.jsx`)

- **Date**: 2026-08-20
- **Impact**: Navigation Sidebar, Hierarchical ERP Submodules, Active Highlighting
- **Description**:
  - Rebuilt [`Sidebar.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/Sidebar.jsx) using the `ref` template architecture (`SidebarPrimitive`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `Collapsible`, `SidebarMenuSub`, `SidebarFooter`).
  - Integrated dynamic `navConfig.js` rendering for all 5 portals with smooth accordion menus, active item indicators, tooltips in collapsed mode, and brand logo header.
  - Connected directly to `usePortalStore` and `useAuthStore` without legacy Context API dependencies.
- **Changes**:
  - Updated [`dashboard/src/components/layout/Sidebar.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/Sidebar.jsx).

### DR-11: Create Modern Sticky Header Component (`Header.jsx`)

- **Date**: 2026-08-20
- **Impact**: Application Header, Breadcrumb Trail, Global Search & Notifications Trigger
- **Description**:
  - Implemented [`Header.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/Header.jsx) matching `ref/src/components/layout/Header.tsx` with sticky backdrop-blur glass styling.
  - Linked `SidebarTrigger`, dynamic `Breadcrumb` reflecting active ERP portal and submodule, global `Ctrl+K` search modal trigger, notification indicator badge, `ModeToggle`, and `ProfileDropdown`.
- **Changes**:
  - Created [`dashboard/src/components/layout/Header.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/Header.jsx).

### DR-10: Create ModeToggle & ProfileDropdown Layout Components

- **Date**: 2026-08-20
- **Impact**: Header Controls, User Profile Menu, Dark/Light Switch
- **Description**:
  - Implemented [`ModeToggle.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/ModeToggle.jsx) using `useThemeStore` to switch seamlessly between dark and light modes with smooth icon scaling.
  - Implemented [`ProfileDropdown.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/ProfileDropdown.jsx) using `useAuthStore` and `usePortalStore` with avatar initials fallback, online status badge, role badge, user profile link, settings link, and clean sign-out handler.
- **Changes**:
  - Created [`dashboard/src/components/layout/ModeToggle.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/ModeToggle.jsx).
  - Created [`dashboard/src/components/layout/ProfileDropdown.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/layout/ProfileDropdown.jsx).

### DR-09: Port Breadcrumb UI Primitives (`breadcrumb.jsx`)

- **Date**: 2026-08-20
- **Impact**: Navigation Header, Breadcrumbs Component, Path Hierarchy
- **Description**:
  - Implemented [`breadcrumb.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/breadcrumb.jsx) (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) matching `ref/src/components/ui/breadcrumb.tsx`.
  - Configured chevron icon separators, smooth interactive link transitions, and current page emphasis.
- **Changes**:
  - Created [`dashboard/src/components/ui/breadcrumb.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/breadcrumb.jsx).

### DR-08: Port Collapsible & Modern Sidebar UI Primitives

- **Date**: 2026-08-20
- **Impact**: Sidebar UI Primitives, Dynamic Collapsible Menus, Mobile Drawer
- **Description**:
  - Implemented [`collapsible.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/collapsible.jsx) using `@base-ui/react/collapsible` matching the `ref` template.
  - Verified and aligned [`sidebar.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/sidebar.jsx) primitives (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuSub`, `SidebarTrigger`, `SidebarInset`) for responsive mobile drawer and desktop collapse behaviors.
- **Changes**:
  - Created [`dashboard/src/components/ui/collapsible.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/collapsible.jsx).

### DR-07: Port Core Shadcn UI Primitives (`Button`, `Badge`, `Card`, `Separator`)

- **Date**: 2026-08-20
- **Impact**: UI Component Library, Design Tokens, Interactive Micro-States
- **Description**:
  - Upgraded [`Button.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/Button.jsx) and [`button.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/button.jsx) with modern 9/10/8h sizing, refined focus rings (`focus-visible:ring-3`), and shadow elevations.
  - Upgraded [`Badge.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/Badge.jsx) with pill tags, subtle status variants (`success`, `warning`, `info`, `destructive`, `outline`), and modern typography.
  - Refactored [`Card.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/Card.jsx) with clean border rings, smooth headers, and action layouts.
  - Updated [`separator.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/separator.jsx) to match modern `@base-ui/react` separator implementation.
- **Changes**:
  - Updated [`dashboard/src/components/ui/Button.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/Button.jsx), [`dashboard/src/components/ui/button.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/button.jsx).
  - Updated [`dashboard/src/components/ui/Badge.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/Badge.jsx), [`dashboard/src/components/ui/badge.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/badge.jsx).
  - Updated [`dashboard/src/components/ui/Card.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/Card.jsx), [`dashboard/src/components/ui/card.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/card.jsx).
  - Updated [`dashboard/src/components/ui/separator.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/components/ui/separator.jsx).

### DR-06: Central Navigation Configuration for All ERP Portals (`navConfig.js`)

- **Date**: 2026-08-20
- **Impact**: Global Navigation Structure, Multi-Module ERP Hierarchy
- **Description**:
  - Created [`navConfig.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/configs/navConfig.js) providing a unified, schema-driven navigation structure matching the `ref` template architecture.
  - Configured 5 major portal sections: **Manpower Agency**, **Brick Factory**, **Document Studio**, **Data Records Center**, and **System Administration** with icons, sub-menus, paths, and portal identifiers.
- **Changes**:
  - Created [`dashboard/src/configs/navConfig.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/configs/navConfig.js).

### DR-05: Port OKLCH Neutral Color Tokens & Modern Sans Typography

- **Date**: 2026-08-20
- **Impact**: Global Design System, Typography, Tailwind v4 Theme Variables
- **Description**:
  - Replaced legacy color variables and forced serif styling in `index.css` with the modern Shadcn OKLCH neutral color system from the `ref` template.
  - Configured crisp geometric sans-serif typography (`Plus Jakarta Sans`, `Inter`, `Geist`, `Hind Siliguri`) with modern radii (`0.625rem`), refined dark mode contrast, and custom scrollbar styles.
  - Preserved critical `@media print` rules for the Document Studio high-precision A4 generation engine.
- **Changes**:
  - Updated [`dashboard/src/index.css`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/index.css).

### DR-04: Portal & UI State Management Migration to Zustand (`usePortalStore`)

- **Date**: 2026-08-20
- **Impact**: Global Navigation State, Active Portals/Submodules, URL Sync, UI Sidebar & Notifications
- **Description**:
  - Implemented [`usePortalStore.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/store/usePortalStore.js) with Zustand to manage active portal/submodule selection (`activePortal`, `activeSubmodule`), URL path parsing and synchronizing, sidebar toggle state (`isSidebarOpen`), global search dialog (`searchOpen`, `searchQuery`), and notification alert items.
  - Provided direct store access with selector capabilities to eliminate full-tree re-renders.
  - Refactored `PortalContext.jsx` into a light sync wrapper around `usePortalStore` for clean backwards compatibility.
- **Changes**:
  - Created [`dashboard/src/store/usePortalStore.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/store/usePortalStore.js).
  - Updated [`dashboard/src/context/PortalContext.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/context/PortalContext.jsx).

### DR-03: Auth State Management Migration to Zustand (`useAuthStore`)

- **Date**: 2026-08-20
- **Impact**: Global Authentication State, Token Management, 2FA, Google Sign-in
- **Description**:
  - Implemented [`useAuthStore.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/store/useAuthStore.js) using Zustand to handle user authentication state (`user`, `isLoading`), credential login, 2FA verification, Google login, and logout.
  - Managed secure token caching in `localStorage` (`accessToken`, `refreshToken`, `user`) with automatic state hydration on startup.
  - Refactored `auth-context.jsx` to delegate directly to `useAuthStore` without React Context overhead.
- **Changes**:
  - Created [`dashboard/src/store/useAuthStore.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/store/useAuthStore.js).
  - Updated [`dashboard/src/lib/auth-context.jsx`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/lib/auth-context.jsx).

### DR-02: Theme State Management Migration to Zustand (`useThemeStore`)

- **Date**: 2026-08-20
- **Impact**: Global Theme Store, Dark/Light Mode, LocalStorage Persistence
- **Description**:
  - Created [`useThemeStore.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/store/useThemeStore.js) with Zustand to manage theme toggling (`light` / `dark`), HTML root class updates (`.dark`), and `localStorage` persistence (`smart_erp_theme`).
  - Added export alias `useTheme` for seamless backward-compatibility and zero unnecessary re-renders.
- **Changes**:
  - Created [`dashboard/src/store/useThemeStore.js`](file:///f:/Monsur%20Ali%20Travels/dashboard/src/store/useThemeStore.js).

### DR-01: Initialization of Dashboard v2 Redesign Roadmap & Documentation

- **Date**: 2026-08-20
- **Impact**: Project Documentation, Architecture & Redesign Roadmap
- **Description**:
  - Initialized `Dashboard_Version_2.md` to record the 20-task execution plan (DR-01 to DR-20).
  - Defined architecture plan to adopt the `ref` template design system (OKLCH neutral tokens, clean sans typography, collapsible modern sidebar, sticky header with breadcrumbs, and refined data tables).
  - Outlined pure Zustand state management strategy replacing legacy Context API (`PortalContext`, `ThemeContext`, `auth-context`).
- **Changes**:
  - Created [`Docs/Dashboard/Dashboard_Version_2.md`](file:///f:/Monsur%20Ali%20Travels/Docs/Dashboard/Dashboard_Version_2.md).
