# 🤖 AI Prompting & System Architecture Instructions

> [!IMPORTANT]
> **MANDATORY SCOPE PREFIX RULES FOR ALL AI ASSISTANTS:**
> - **`backend/`** ➔ `MB-` (Express API, Mongoose Models, Controllers)
> - **`frontend/`** ➔ `MF-` (Public Portal, React/Next components)
> - **`dashboard/src/shared`** ➔ `MD-` (Shared Components & Stores)
> - **`dashboard/src/admin`** ➔ `AD-` (Admin Portal, RBAC, Operations)
> - **`dashboard/src/client`** ➔ `CD-` (Client & Staff Workspace)
> - **`Docs/`** ➔ `MA-` (Architecture, Specs, Docs)
> - **`scripts/` / Infra** ➔ `DEP-` (Deployment, Nginx, Docker)

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

1. **Four Exact System Roles:**
   - **`Owner`**: Master ownership across all present and future business modules, master financials, and system overrides. **NO API CAN CREATE AN OWNER ROLE.** Owner accounts are bootstrapped directly or managed by existing Owner.
   - **`Admin`**: High-level manager with full operational control (assigning steps, approving completions, assigning staff roles).
   - **`Manager`**: Mid-level supervisor managing specific department cases or operational queues.
   - **`Staff`**: Operational staff member executing assigned tasks. **MUST be linked to a valid Employee record (`employeeDid`).**

2. **Strict Role Assignment & Staff Requirements:**
   - Roles (`Admin`, `Manager`, `Staff`) can ONLY be assigned or modified through the Admin scope (`/api/v1/admin/users`) by an Admin or Owner.
   - Every `Staff` user MUST have a valid `employeeDid` linking them to the `Employee` collection.
   - Public registration endpoints MUST NEVER allow role selection or creation of `Owner`/`Admin` accounts.

3. **Dedicated `Employee` Collection:**
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
