# 📄 Business Requirements Document (BRD)
**Project Name:** Monsur Ali Travels ERP & Operations Management System  
**Document Version:** 1.0.0  
**Date:** 2026-08-21  
**Target Location:** `Docs/01_Business_Requirements.md`

---

## 📑 1. Executive Summary & Core Objective

Monsur Ali Travels is a premier travel agency, manpower exporter, and visa processing service provider. As the business expands, managing long-term visa pipelines, passport tracking, staff handoffs, document creation, and complex multi-stage client payments through manual or fragmented systems leads to inefficiencies, delayed follow-ups, and lack of accountability.

The core objective of this ERP system is to establish a **centralized, transparent, role-guarded, and automated workflow platform**. It isolates administrative/owner-level oversight from staff-level daily operations while introducing a JIRA-style task and case lifecycle pipeline.

---

## 👥 2. User Roles & Permission Hierarchy (RBAC)

The system strictly divides operations among four explicit user roles (`USER_ROLES = ["Owner", "Admin", "Manager", "Staff"]`):

### 2.1 Owner
- **Role Purpose:** Full master ownership across present and future business modules, master financials, and system overrides.
- **Security Rule:** **NO API CAN CREATE AN OWNER ROLE.** Owner accounts are bootstrapped directly or managed by existing Owner.

### 2.2 Admin
- **Role Purpose:** High-level manager with full operational control.
- **Key Rights:** Assigns workflow steps, approves work done, manages users, and assigns staff roles.

### 2.3 Manager
- **Role Purpose:** Mid-level supervisor managing specific department queues and team progress.

### 2.4 Staff
- **Role Purpose:** Operational staff member executing assigned tasks and onboardings.
- **Mandatory Constraint:** Anyone with the `Staff` role **MUST be a valid Employee** linked via `employeeDid` to the `Employee` collection.
- **Assignment Constraint:** Roles can ONLY be assigned or modified through the Admin scope (`/api/v1/admin/users`) by an Admin or Owner.

---

## 🔄 3. Core Business Workflows

### 3.1 Long-Term Case & Visa Processing Workflow (JIRA-Style Pipeline)

Visa processing (Greek Work Permits, N. Macedonia, Saudi Manpower, Indian Visa, PCC) is long-term and involves multiple legal, government, and VFS stages. The system operates on a **strict assignment, handoff, and approval pipeline**:

```
[Client Onboarding / Frontdesk]
  │  (Creates initial Case File & collects documents)
  ▼
[Owner / Admin Assignment]
  │  (Assigns Step 1 to Processor e.g. Lawyer/Ikram)
  ▼
[Processor / Staff Execution]
  │  (Executes task: Online submission, document check -> Marks "DONE")
  ▼
[Owner / Admin Approval & Handoff]
  │  (Receives notification -> Reviews work -> Approves -> Assigns Step 2)
  ▼
[Subordinate / Secondary Processing]
  │  (Prepares Indian Visa / PCC / VFS Submission -> Marks "DONE")
  ▼
[Final Verification & Delivery]
  │  (Admin verifies full payment -> Marks "COMPLETED & DELIVERED")
```

#### Detailed Stage Breakdown for Visa & Passport Cases:
1. **File Receipt & Entry:** Frontdesk receives physical passport/documents from client and logs a new Case File.
2. **Handoff to Senior/Lawyer:** File assigned/sent to specialized processor (e.g. Ikram). Status updates to *"Handed over to [Name]"*.
3. **Acceptance & Processing:** Processor marks file as *"Received / In Progress"*.
4. **Online Submission:** Processor completes online government submission and marks stage *"Online Submitted - Pending Approval"*.
5. **Government / Embassy Approval:** Status updated to *"Approved"*.
   - **Automation Trigger:** Triggers an immediate notification to Frontdesk staff to call the client and initiate secondary processing (Indian Visa, PCC).
6. **Indian Visa Application Preparation:** Subordinates prepare Indian Visa documentation. Status: *"Preparing Indian Visa"*.
7. **Indian Visa Submission:** Submitted to VFS/Agency. Status: *"Indian Visa Submitted"*.
8. **Interview Scheduling (If required):** If embassy issues an interview date, status updates to *"Interview Scheduled for [Date]"*.
9. **Police Clearance Certificate (PCC):**
   - PCC application logged -> *"PCC Applied"*.
   - PCC issued -> *"PCC Ready - Prepared for Overseas Travel"*.
10. **Global VFS Submission:** Submitted at VFS Global Center -> *"Submitted to Global VFS on [Date]"*.
11. **Final Delivery:** Visa issued, remaining dues collected, passport handed to client -> *"Completed & Delivered"*.

---

### 3.2 Real-Time Notifications & Daily Activity Monitoring

1. **Targeted Handoff Notifications:**
   - Whenever a case or specific step is assigned/handed over to a staff member, they receive an immediate in-app notification (*"Case X has been assigned to you"*).
2. **Approval Notifications:**
   - When a major milestone (e.g., Offer Letter Approval) is marked complete by Admin, assigned frontdesk staff automatically receive a notification to take action.
3. **Admin Daily Activity Feed ("Today's Updates"):**
   - The Owner Dashboard features a dedicated real-time log showing every status change, step completion, and handoff executed during the current date, sorted chronologically with timestamps and staff names.

---

### 3.3 Financial & Accounting Model

1. **3-Stage Milestone Payment Structure:**
   - **Step 1 (Advance):** Collected at file creation/entry.
   - **Step 2 (Offer / Government Approval):** Collected upon approval of offer letter/work permit.
   - **Step 3 (Delivery):** Final settlement collected prior to passport/visa handover.
2. **Dynamic Ledger:**
   - Ability to record custom installments beyond 3 steps if client payment terms vary.
   - Real-time calculation of `Total Agreed Amount`, `Total Paid Amount`, and `Due Amount`.
3. **Financial Reports (Accountant & Owner Only):**
   - Client Dues Summary.
   - Office Expense & Cash Voucher Ledger.
   - Employee Payroll & Salary Slips.
   - Revenue & Profitability per Case Type.

---

## 🏗️ 4. Architectural & System Boundaries

### 4.1 System Structure & Dashboard Segregation
- **Unified Backend Server (`/backend`):** Express.js & MongoDB API with isolated route scopes:
  - `/api/v1/admin/*` (Strictly guarded by RBAC for Owner/Admin).
  - `/api/v1/client/*` (Operational routes for Staff/Frontdesk).
  - `/api/v1/*` (Shared authentication, upload, and notification endpoints).
- **Dual Dashboard Architecture (`/dashboard`):**
  - **`dashboard/admin`**: Dedicated app for Owner/Admin managing analytics, JIRA workflow board, user access, and global financials.
  - **`dashboard/client`**: Dedicated operational portal for Staff managing initial case creation, "My Assigned Tasks", and Document Studio.
  - **`dashboard/Logs`**: Subdirectories (`admin/` and `client/`) maintaining standardized change logs (`AD01-100.md`, `CD01-100.md`).

### 4.2 Audit & System Logging
- All modifying actions (`POST`, `PUT`, `PATCH`, `DELETE`) executed within administrative routes are automatically captured by `auditLog` middleware and recorded in the `SystemLog` database collection (including IP address, payload, staff identity, and timestamp).

---

## 📌 5. Summary of Data Domain Terminology

To maintain domain clarity across all code and documentation:
- **Client (formerly Customer):** The individual or corporate entity whose visa/passport is being processed.
- **Case File:** The central processing dossier representing a specific visa, work permit, or passport service pipeline.
- **Workflow Step:** An individual task within a Case File assigned to a specific user with a status (`Pending` -> `In Progress` -> `Done` -> `Approved`).
- **Handoff:** Transferring operational responsibility of a Case File or Step from one user to another.

---

## 🔒 6. Mandatory System Architecture Rules

> [!CAUTION]
> **STRICT RULE: Mandatory DID Field in All Collections**
> - **Rule:** Every single MongoDB collection/schema MUST include a unique `did` (Decentralized/Domain Identifier) field generated via `generateDid()`.
> - **Rule:** MongoDB's internal `_id` (ObjectId) MUST NEVER be used or exposed in API contracts, data migrations, lookups, or inter-collection references. All lookups, references, and migrations MUST strictly rely on `did`.
> - **Reason:** Ensures seamless database migration (e.g., MongoDB to PostgreSQL/Prisma), zero external dependency on MongoDB ObjectId formats, and multi-tenant domain compatibility.
