# Dashboard Version 2 Change Logs (DR-01 to DR-20)

This document tracks the comprehensive redesign of the Monsur Ali Travels ERP Dashboard to match the modern Shadcn UI Admin layout (`ref` template) and full migration of state management to **Zustand**. Entries are sorted with the latest at the top.

---

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
