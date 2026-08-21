# 📊 Schema & Dashboard Access Mapping Plan
**Project Name:** Monsur Ali Travels ERP  
**Document Version:** 1.0.0  
**Date:** 2026-08-21  
**Target Location:** `Docs/02_Schema_and_Dashboard_Mapping.md`

---

## 📂 1. Complete Database Collections Overview (15 Collections)

All collections strictly contain a unique `did` (Domain Identifier) field for relational mapping and migration stability.

| # | Model Name | File Name | MongoDB Collection | Description / Domain Purpose |
|---|---|---|---|---|
| 1 | **Client** | `client.model.js` | `clients` | Client bio info, NID, passport, guardian details & attachment repository. |
| 2 | **CaseFile** | `caseFile.model.js` | `casefiles` | Main processing dossier for visa, passport & work permit pipelines. |
| 3 | **CandidateCaseFile** | `candidateCaseFile.model.js` | `candidatecasefiles` | Overseas manpower candidate deployment pipelines. |
| 4 | **IndianVisaSubmission**| `indianVisaSubmission.model.js` | `indianvisasubmissions` | Indian Visa specific appointment & submission forms. |
| 5 | **PassportSubmission**  | `passportSubmission.model.js` | `passportsubmissions` | Passport receipt, submission & delivery tracking. |
| 6 | **CustomerGuardian**    | `customerGuardianApplication.model.js` | `customerguardians` | Guardian affidavit & relationship authorization forms. |
| 7 | **EmploymentAgreement** | `employmentAgreement.model.js` | `employment-agreement` | Legal employment contracts & manpower agreement studio. |
| 8 | **MoneyReceipt**        | `moneyreceipts.model.js` | `moneyreceipts` | Official payment receipt generation with QR verification code. |
| 9 | **Invoice**             | `invoice.model.js` | `invoices` | Billing invoices generated for clients. |
| 10 | **User**               | `user.model.js` | `users` | System authentication profiles (`Owner`, `Admin`, `Manager`, `Staff`). |
| 11 | **Employee**           | `employee.model.js` | `employees` | Staff profiles, designations, joining dates & salary history. |
| 12 | **CashVoucher**         | `cashVoucher.model.js` | `cashvouchers` | Office operational expenses, petty cash & vendor payouts. |
| 13 | **SalarySlip**          | `salarySlip.model.js` | `salaryslips` | Staff monthly salary disburse slips. |
| 14 | **Notification**        | `notification.model.js` | `notifications` | Targeted handoff & system event notification queue. |
| 15 | **SystemLog**           | `systemLog.model.js` | `systemlogs` | Master audit log of modifying actions taken by Admin/Staff. |

---

## 🛡️ 2. Dashboard Access & Permission Matrix

The system segregates data access between **`dashboard/client`** (Staff / Frontdesk Portal) and **`dashboard/admin`** (Owner / Admin Portal).

| Collection Name | `dashboard/client` (Staff Scope) | `dashboard/admin` (Admin Scope) | Access Rationale & Security Scoping |
|---|---|---|---|
| **`clients`** | **CREATE / READ / UPDATE** | **FULL CONTROL / ANALYTICS** | Staff creates client bio & documents; Admin views client metrics. |
| **`casefiles`** | **CREATE / READ (Assigned) / MARK DONE** | **FULL CONTROL / ASSIGN / APPROVE** | Staff creates case & executes assigned step; Admin controls pipeline. |
| **`candidatecasefiles`** | **CREATE / READ / UPDATE** | **FULL CONTROL** | Overseas manpower candidates & deployment pipeline tracking. |
| **`indianvisasubmissions`** | **CREATE / READ / UPDATE** | **FULL CONTROL** | Sub-pipeline form for Indian Visa preparation. |
| **`passportsubmissions`** | **CREATE / READ / UPDATE** | **FULL CONTROL** | Daily passport intake & delivery tracking. |
| **`customerguardians`** | **CREATE / READ / UPDATE** | **FULL CONTROL** | Guardian affidavit forms. |
| **`employment-agreement`**| **CREATE / READ / PRINT** | **FULL CONTROL** | Legal contract generation in Document Studio. |
| **`moneyreceipts`** | **CREATE (Entry) / READ** | **FULL CONTROL / AUDIT** | Staff enters client payment receipt; Admin reviews revenue. |
| **`invoices`** | **CREATE / READ / PRINT** | **FULL CONTROL** | Client billing invoice creation. |
| **`notifications`** | **READ (Targeted) / MARK READ** | **READ (Global) / SYSTEM BROADCAST** | Staff gets task handoff alerts; Admin gets completion alerts. |
| **`users`** | ❌ **NO ACCESS** | **FULL CONTROL** | Only Admin/Owner can manage logins & assign `employeeDid`. |
| **`employees`** | 🔒 **READ (Self Profile Only)** | **FULL CONTROL / PAYROLL** | Admin manages staff salary, permissions & designations. |
| **`cashvouchers`** | ❌ **NO ACCESS** *(Accountant Only)* | **FULL CONTROL** | Operational office expense logging. |
| **`salaryslips`** | 🔒 **READ (Self Slip Only)** | **FULL CONTROL / DISBURSE** | Staff salary slip issuance. |
| **`systemlogs`** | ❌ **NO ACCESS** | **FULL CONTROL** | Master administrative audit trail. |

---

## 🎯 3. Functional Responsibilities by Portal

### 🟢 Portal A: Client Dashboard (`dashboard/client`) — Staff & Operations Portal
- **Primary Goal:** Quick data entry, document studio generation, and assigned task completion.
- **Key Modules & Screen Responsibilities:**
  1. **New Client Onboarding:** Create new `Client` profile, upload passport/NID scans.
  2. **Case Entry:** Open a new `CaseFile` (initial intake entry).
  3. **My Assigned Tasks:** Filtered view displaying only `casefiles` where `assignedToDid === currentUser.did`. Staff executes task & clicks **"Mark as Done"**.
  4. **Document Studio:** Issue `MoneyReceipt`, `Invoice`, `EmploymentAgreement`, and `CustomerGuardian` forms.
  5. **Notification Hub:** View real-time alerts when a case is assigned/handed over to them.

### 🔴 Portal B: Admin Dashboard (`dashboard/admin`) — Owner & Admin Master Control
- **Primary Goal:** Executive control, JIRA-like workflow pipeline management, approvals, user access, and accounting.
- **Key Modules & Screen Responsibilities:**
  1. **Case Workflow Board (JIRA-style Kanban):** Master view of all active `casefiles`. Admin assigns steps, sets deadlines, approves completions, or rejects with feedback.
  2. **Today's Activity Feed:** Real-time stream of all status changes, step completions, and handoffs executed on the current date.
  3. **User & Employee Management:** Create user logins (`users`), link to `Employee` record (`employeeDid`), assign roles (`Admin`, `Manager`, `Staff`), set permissions.
  4. **Accounting & Financial Reports:** Master revenue ledgers, client dues summary, office operational expenses (`cashvouchers`), and employee payroll (`salaryslips`).
  5. **System Audit Trail:** Review IP addresses, modified routes, and timestamps via `systemlogs`.

---

*This mapping document guides the route implementation and component scoping across both dashboards.*
