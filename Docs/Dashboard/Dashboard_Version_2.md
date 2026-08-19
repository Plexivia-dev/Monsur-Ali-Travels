# Dashboard Version 2 Change Logs (DR-01 to DR-20)

This document tracks the comprehensive redesign of the Monsur Ali Travels ERP Dashboard to match the modern Shadcn UI Admin layout (`ref` template) and full migration of state management to **Zustand**. Entries are sorted with the latest at the top.

---

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
