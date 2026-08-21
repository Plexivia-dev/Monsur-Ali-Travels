# 🤖 AI Prompting & System Architecture Instructions

> **IMPORTANT:** This document defines mandatory architectural constraints, domain knowledge, and system rules that MUST be strictly maintained by any AI model or developer working on the **Monsur Ali Travels ERP** codebase.

---

## 📌 1. Mandatory Database & DID Rules (`@rules:DID`)

1. **Mandatory `did` Field in Every Collection:**
   - Every single Mongoose schema / MongoDB collection MUST include a unique `did` (Decentralized Identifier) generated via `generateDid()`.
   - Example: `did: { type: String, default: () => generateDid(), unique: true, index: true }`.

2. **Relations MUST Use `did` (NOT `_id`):**
   - Inter-collection references and relations MUST use `did` strings (e.g., `clientDid`, `userDid`, `caseDid`, `createdByDid`, `assignedToDid`).
   - MongoDB's internal `_id` (ObjectId) MUST NEVER be used or exposed in API contracts, queries, DB lookups, or relations.

3. **Database Migration Standard:**
   - Using `did` ensures 100% seamless migration to PostgreSQL/Prisma or multi-tenant database clusters without breaking relational integrity.

---

## 👥 2. User Roles & Employee Management

1. **Three Core System Roles:**
   - **`Owner`**: Full master ownership across all present and future business modules, master financials, system logs, and administrative overrides.
   - **`Admin`**: High-level operational manager who assigns workflow steps, approves work done, manages users, and oversees daily task boards.
   - **`Employee`**: Staff / Frontdesk members who create initial client files, execute assigned tasks, and mark steps as "Done".

2. **Dedicated `Employee` Collection:**
   - Employee details MUST be stored in the dedicated `Employee` collection (`employee.model.js`).
   - Tracks: Employee Code (`EMP-XXXX`), `userDid`, Designation, Department, Base Salary, Salary Payment History (`salaryHistory`), Join Date, and Access Levels (`Level_1`, `Level_2`, `Manager`, etc.).
   - Granular Permissions: `canCreateCases`, `canUpdateStatus`, `canViewAccounts`, `canManageDocs`.

---

## ✈️ 3. European & Overseas Visa Pipeline Context (Greece / N. Macedonia)

1. **Embassy Location Context:**
   - European work permit countries (Greece, N. Macedonia, etc.) do NOT have embassy processing centers in Bangladesh for work visas. Applicants MUST travel to **New Delhi, India** to attend embassy interviews and submit biometrics.

2. **Indian Visa as a Prerequisite Sub-Pipeline:**
   - When a client's Greece / N. Macedonia Work Permit / Offer Letter is **Approved**, they MUST apply for an **Indian Visa** to travel to India.
   - Therefore, the Indian Visa processing (Application -> VFS Submit -> PCC Ready -> Indian Visa Issued) is a mandatory sub-pipeline embedded within European Work Permit cases.

---

## 🏛️ 4. Portal Architecture & Dashboard Division

1. **`dashboard/admin` (Owner & Admin Dashboard):**
   - Master Control Center.
   - JIRA-style Kanban & Workflow Pipeline Board (Step assignment, approvals, Next Step transition).
   - Full Financial Ledger, Payroll, Company Dues, and Audit Logs.

2. **`dashboard/client` (Staff & Operations Dashboard):**
   - Staff Workspace.
   - Initial Client & Case File Creation (Frontdesk Entry).
   - "My Assigned Tasks" view (Staff only sees tasks assigned to their `userDid`).
   - Document Studio (Money Receipts, Invoices, Agreements, Salary Slips).

---

*Keep this instruction file updated whenever system-wide constraints or core business rules change.*
