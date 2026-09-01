# Monsur Ali Travels ERP REST API Specification

**Base API Host:** `https://api.monsuralitravels.com` / `http://localhost:8000`  
**API Version Prefix:** `/api/v1`  
**Architectural Standard:** RESTful JSON over HTTP with Bearer JWT Authorization and `@rules:DID` UUID-based relational model identifiers.

---

## 1. Authentication & Security Endpoints

**Base Prefix:** `/api/v1/auth`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/login` | Public | Authenticates credentials (`email`/`phone` + `password`), returns HTTP-only cookies and JWT payload with user role & sub-role. |
| `POST` | `/register` | Admin / Owner | Registers a new internal staff member or portal user. |
| `POST` | `/refresh-token` | Public (Cookie) | Rotates and issues fresh access tokens using the refresh token. |
| `POST` | `/logout` | Public | Clears session cookies and revokes active token session. |
| `GET` | `/me` | Authenticated | Returns snapshot profile of currently logged-in user with assigned permissions. |

---

## 2. Master Case Files & Workflow Management

**Base Prefixes:** `/api/v1/cases`, `/api/v1/admin/cases`, `/api/v1/client/cases`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/` | Staff / Admin | Lists all case files with filtering (`caseType`, `status`, `assignedTo`, `search`, `page`, `limit`). |
| `POST` | `/` | Staff / Admin | Creates a new Case File. Auto-creates or links candidate client dossier and initializes payment ledger. |
| `GET` | `/:id` | Staff / Admin | Retrieves single Case File by DID, Case Number, or Passport Number. Populates tasks and receipts. |
| `PUT` | `/:id` | Staff / Admin | Updates candidate particulars, checklist items, or package financials. |
| `PATCH` | `/:id/workflow` | Staff / Admin | Transitions lifecycle stage (`ENTRY` → `PROCESSING` → `APPROVED_OFFER_LETTER` → `SUBMITTED_EMBASSY_BSF` → `COMPLETED_DELIVERED`). |
| `GET` | `/:caseDid/full-details` | Admin / Manager | Returns 360° case dossier including client bio, workflow tasks, vault documents, receipts, and audit history. |
| `POST` | `/assign-step` | Admin / Manager | Assigns a sequential workflow task step to a designated staff member with required document attachments. |
| `PATCH` | `/tasks/:taskDid/approve` | Admin / Manager | Approves a completed task submitted by a staff member and advances case status. |
| `POST` | `/:caseDid/payments` | Admin / Accountant | Records client payment intake (Advance, Offer Approval, or Final Delivery) and updates due balance. |
| `POST` | `/:caseDid/indian-visa-subpipeline` | Admin / Manager | 1-Click trigger for European cases reaching Offer Approval; generates Indian VFS task & Document Studio prefill. |
| `POST` | `/:id/messages` | Staff / Admin | Appends internal collaborative notes and communication messages to the case dossier. |
| `POST` | `/:id/documents` | Staff / Admin | Attaches scanned files to the Case Document Vault. |
| `PATCH` | `/:id/documents/:docDid/rename`| Staff / Admin | Renames document title or metadata in Document Vault. |
| `DELETE` | `/:id` | Owner / Admin | Deactivates or removes a case file record. |
| `GET` | `/summary` | Staff / Admin | Returns aggregated case statistics, active pipelines, and outstanding due amounts. |
| `GET` | `/lookup` | Staff / Admin | Fast search by query `q`, passport number, phone, or candidate name. |

---

## 3. Client Directory & Candidate 360 Profiles

**Base Prefixes:** `/api/v1/clients`, `/api/v1/admin/clients`, `/api/v1/client/clients`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/` | Staff / Admin | Lists registered clients with pagination, live search, and destination filter. |
| `POST` | `/` | Staff / Admin | Registers a new client with bio data, passport info, national ID, and guardian particulars. |
| `GET` | `/:id` | Staff / Admin | Retrieves client record by DID, Passport, or Phone. |
| `PUT` | `/:id` | Staff / Admin | Updates client profile information. |
| `DELETE` | `/:id` | Owner / Admin | Deletes client profile. |
| `GET` | `/:id/cases` | Staff / Admin | Retrieves all active and historical cases associated with the client. |
| `GET` | `/:id/vault` | Staff / Admin | Fetches all encrypted files in the client's Document Vault. |

---

## 4. Operational Staff Tasks & Workflow Execution

**Base Prefixes:** `/api/v1/tasks`, `/api/v1/client/tasks`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/my-tasks` | Staff | Returns all task steps assigned to the authenticated staff member. |
| `GET` | `/:id` | Staff / Admin | Retrieves task details with permitted documents and case snapshot. |
| `PATCH` | `/:id/done` | Staff | Marks task step as completed and submits notes/attachments for admin review. |
| `PATCH` | `/:taskDid/complete` | Staff / Admin | Direct completion endpoint for step execution modal. |

---

## 5. Document Studio (13 Official Document Generators)

**Base Prefixes:** `/api/v1/agreements`, `/api/v1/idcards`, `/api/v1/salary-slips`, `/api/v1/invoices`, `/api/v1/receipts`, `/api/v1/vouchers`, `/api/v1/indian-visas`, `/api/v1/certificates`

| Module / Document | Endpoint | Methods | Description |
|---|---|---|---|
| **Employment Agreement** | `/api/v1/agreements` | `GET`, `POST`, `PUT`, `DELETE` | Generates 4-page bilateral overseas employment contracts with guardian guarantee. |
| **Employee & Candidate ID Card** | `/api/v1/idcards` | `GET`, `POST`, `PUT`, `DELETE` | Generates CR80 dual-sided ID cards with embedded QR verification. |
| **Salary Slip & Payroll Voucher** | `/api/v1/salary-slips` | `GET`, `POST`, `PUT`, `DELETE` | Monthly payslip generator with allowances, deductions, and payment modes. |
| **Sales & Commercial Invoice** | `/api/v1/invoices` | `GET`, `POST`, `PUT`, `DELETE` | Tax invoices with itemized charges, VAT calculation, and QR payload. |
| **Money Receipt Voucher** | `/api/v1/receipts` | `GET`, `POST`, `PUT`, `DELETE` | Dual-copy (Office / Client) money receipts with auto-spelled in-words amount. |
| **Petty Cash / Payment Voucher** | `/api/v1/vouchers` | `GET`, `POST`, `PUT`, `DELETE` | Office expense and vendor payment cash vouchers. |
| **Indian Visa Application Form** | `/api/v1/indian-visas` | `GET`, `POST`, `PUT`, `DELETE` | Pre-fills high-commission Indian double-entry visa application forms for VFS Delhi. |
| **Passport Submission Form** | `/api/v1/passport-subs` | `GET`, `POST`, `PUT`, `DELETE` | Official passport physical handover and tracking slip. |
| **Job Verification Form** | `/api/v1/job-verifications`| `GET`, `POST`, `PUT`, `DELETE` | Experience and past employment verification letters. |
| **Experience Certificate** | `/api/v1/certificates/experience` | `GET`, `POST` | Official overseas work experience certificates. |
| **Character Certificate** | `/api/v1/certificates/character` | `GET`, `POST` | Police and local chairman character recommendation certificates. |
| **Marriage Verification Certificate** | `/api/v1/certificates/marriage` | `GET`, `POST` | Bilateral family attestation and marriage verification certificates. |
| **Client Guardian Bio Form** | `/api/v1/client-forms` | `GET`, `POST` | Comprehensive physical file intake and emergency contact declaration. |

---

## 6. Financial Accounts & General Ledger

**Base Prefix:** `/api/v1/accounts`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/summary` | Accountant / Admin | Returns real-time financial health, cash-in-hand, bank balances, and total dues. |
| `GET` | `/transactions` | Accountant / Admin | Lists all credit and debit transactions with date-range filters. |
| `POST` | `/transactions` | Accountant / Admin | Records an accounting transaction entry. |
| `GET` | `/ledgers` | Accountant / Admin | Returns chart of accounts and departmental ledgers. |
| `GET` | `/bills` | Accountant / Admin | Lists vendor and operational bills. |
| `POST` | `/bills` | Accountant / Admin | Records a new vendor payable bill. |
| `GET` | `/daily-balance` | Accountant / Admin | Returns daily closing balance statements. |

---

## 7. Universal QR Code & Public Verification Engine

**Base Prefix:** `/api/v1/qr`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET`, `POST` | `/` | Public | Generates dynamic QR code in `dataurl`, `svg`, or `png` formats with custom sizing and colors. |
| `GET` | `/agency` | Public | Returns cached Monsur Ali Travels official branding QR code. |
| `GET` | `/invoice/:id` | Public | Generates official validation QR code for a specific tax invoice. |
| `GET` | `/verify/:identifier` | Public | **Public Verification Gateway**: Validates Employee ID Cards, Money Receipts, Case Dossiers, and Agreements. |
| `GET` | `/verify?id=...` | Public | Query-parameter alias for QR scanner web applications. |

---

## 8. Cloudflare R2 Document Vault & File Storage

**Base Prefix:** `/api/v1/upload`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/single` | Authenticated | Uploads a single file to Cloudflare R2 bucket with automated categorization and DID tagging. |
| `POST` | `/document` | Authenticated | Streams scanned passport, NID, or medical certs directly to the candidate Document Vault. |
| `POST` | `/multiple` | Authenticated | Batch uploads multiple files. |
| `DELETE` | `/:fileId` | Admin / Owner | Deletes an uploaded file from R2 and removes database references. |

---

## 9. Real-Time Notifications & WebSocket Gateway

**Base Prefix:** `/api/v1/notifications`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/` | Authenticated | Returns notifications for the logged-in user or their role (`Admin`, `Staff`, etc.). |
| `PATCH` | `/:id/read` | Authenticated | Marks a notification as read. |
| `PATCH` | `/read-all` | Authenticated | Marks all unread notifications as read. |
| `WS` | `global.io` | Authenticated | Real-time WebSocket connection on event `new_notification`. |

---

## 10. Public Landing Website & Contact Inquiries

**Base Prefixes:** `/api/v1/inquiries`, `/api/v1/public/inquiries`, `/api/v1/contact`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/` | Public | Receives contact inquiries from the landing page. Features anti-spam honeypot, creates Admin notifications, and sends email alerts. |

---

## 11. Automated Email Dispatch & System Diagnostics

**Base Prefix:** `/api/v1/email`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET`, `POST` | `/` | Admin / Owner | Sends test email and checks SMTP connection health. |
| `POST` | `/invoice` | Admin / Accountant | Sends itemized commercial invoice to client with secure PDF/Web link. |

---

*Last Updated: 2026-08-31 • Monsur Ali Travels ERP v2.0 Architecture*
