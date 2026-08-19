# Backend Version 2 Change Logs (BR-01 to BR-20)

This document tracks the incremental migration and implementation of the Next-Gen Backend for Monsur Ali Travels ERP using **Prisma ORM**, **PostgreSQL**, **Zod**, and **JSDoc**.

> **Architecture Rules:**
> 1. Latest log entries are always placed at the **TOP** (reverse chronological order).
> 2. All 20 task checkpoints are strictly tracked from `BR-01` to `BR-20`.
> 3. Existing MongoDB `backend/` remains completely untouched.

---

### BR-13: Indian Visa Application Module (Validation, Service, Controller, Route)
- **Date**: 2026-08-20
- **Scope**: Indian Visa submissions, `IVISA-...` tracking generator, stage history audit trail, customer auto-sync
- **Description**:
  - Implemented `server/src/validations/visa.validation.js` with Zod schemas for visa creation, stage transitions (`pending`, `submitted`, `accepted`, `rejected`, `delivered`), and search queries.
  - Implemented `server/src/services/IndianVisaService.js` with:
    - Auto-generation of unique tracking codes (`IVISA-XXXXXXXXXX`).
    - Central customer auto-sync and ledger billing via `CustomerSyncService`.
    - Stage transition history logs with timestamps and administrative notes.
  - Implemented `server/src/controllers/IndianVisaController.js` and `server/src/routes/IndianVisaRoute.js`.
- **Files Modified/Created**:
  - `server/src/validations/visa.validation.js`
  - `server/src/services/IndianVisaService.js`
  - `server/src/controllers/IndianVisaController.js`
  - `server/src/routes/IndianVisaRoute.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-12: Case Management (SA) Module (Validation, Service, Controller, Route)
- **Date**: 2026-08-20
- **Scope**: Generic Case Management, 5-stage lifecycle state machine, 3-step payment milestones, auto customer linking
- **Description**:
  - Implemented `server/src/validations/case.validation.js` with Zod schemas for case creation, 3-stage payment milestone updates (`step1_advance`, `step2_offerApproval`, `step3_delivery`), and status transitions.
  - Implemented `server/src/services/CaseFileService.js` with:
    - Auto customer profile creation and linking via `CustomerSyncService`.
    - Dynamic calculation of `totalPaidAmount`, `dueAmount`, and `isFullyPaid`.
    - Document checklist JSONB tracking (`photo2x2`, `electricityBill`, `nidCopy`, `landDocuments`).
  - Implemented `server/src/controllers/CaseFileController.js` and `server/src/routes/CaseFileRoute.js`.
- **Files Modified/Created**:
  - `server/src/validations/case.validation.js`
  - `server/src/services/CaseFileService.js`
  - `server/src/controllers/CaseFileController.js`
  - `server/src/routes/CaseFileRoute.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-11: Money Receipt & Payment Token Module (Validation, Service, Controller, Route)
- **Date**: 2026-08-20
- **Scope**: Payment tokens, accountant cash confirmation & seal, bank turnover tracking, financial KPIs
- **Description**:
  - Implemented `server/src/validations/receipt.validation.js` with Zod schemas for token generation, confirmation seal, cancellation, bank deposit, and date-range filters.
  - Implemented `server/src/services/MoneyReceiptService.js` with:
    - Auto customer matching by passport/phone if `customerId` is omitted.
    - Status transitions (`pending` → `confirmed` → `cancelled`).
    - Dynamic customer ledger recomputation upon confirmation (`totalPaidAmount` & `totalDueAmount`).
    - Financial KPI aggregator (`/api/v1/receipts/summary`).
    - Bank deposit handover toggle (`/api/v1/receipts/:id/bank-deposit`).
  - Implemented `server/src/controllers/MoneyReceiptController.js` and `server/src/routes/MoneyReceiptRoute.js`.
- **Files Modified/Created**:
  - `server/src/validations/receipt.validation.js`
  - `server/src/services/MoneyReceiptService.js`
  - `server/src/controllers/MoneyReceiptController.js`
  - `server/src/routes/MoneyReceiptRoute.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-10: Central Customer Module (Validation, Service, Controller, Route)
- **Date**: 2026-08-20
- **Scope**: Central Customer profiles, 8-service relation aggregator, lookup autocomplete, financial summary
- **Description**:
  - Implemented `server/src/validations/customer.validation.js` with Zod schemas for customer creation, partial updates, pagination, and autocomplete lookup.
  - Implemented `server/src/services/CustomerService.js` supporting:
    - Multi-field search (fullName, phone, passportNumber, nidNumber, customerCode, fatherName).
    - Single customer profile fetching with linked relation history across 8 services (`cases`, `visaSubmissions`, `passportSubmissions`, `applications`, `invoices`, `receipts`, `agreements`, `candidateCases`).
    - Autocomplete lookup endpoint (`/api/v1/customers/lookup?query=...`).
  - Implemented `server/src/controllers/CustomerController.js` and `server/src/routes/CustomerRoute.js`.
- **Files Modified/Created**:
  - `server/src/validations/customer.validation.js`
  - `server/src/services/CustomerService.js`
  - `server/src/controllers/CustomerController.js`
  - `server/src/routes/CustomerRoute.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-09: Customer Auto-Sync & Relational Linker Service
- **Date**: 2026-08-20
- **Scope**: Cross-service customer intelligence, automated matching and ledger synchronization
- **Description**:
  - Implemented `server/src/services/CustomerSyncService.js` to automatically find or create Central Customer profiles across any form submission (Indian Visa, Passport, Case Management, Guardian Applications, Agreements).
  - Automatically matches existing customers by `passportNumber` (case-insensitive), `nidNumber`, or `phone`.
  - Merges missing bio details (parents, present address, photos, scans) without overwriting existing data.
  - Automatically increments customer's `totalBilledAmount`, `totalPaidAmount`, and recomputes `totalDueAmount`.
- **Files Modified/Created**:
  - `server/src/services/CustomerSyncService.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-08: User Management Module (Validation, Service, Controller, Route)
- **Date**: 2026-08-20
- **Scope**: User administration, role management, pagination, soft delete
- **Description**:
  - Implemented `server/src/validations/user.validation.js` with Zod schemas for user creation, partial updates, and paginated search filters.
  - Implemented `server/src/services/UserService.js` providing full user CRUD with soft delete, multi-field search (name, email, phone, department, designation), and role filters.
  - Implemented `server/src/controllers/UserController.js` and `server/src/routes/UserRoute.js` restricting user management to `Owner` and `Admin` roles.
- **Files Modified/Created**:
  - `server/src/validations/user.validation.js`
  - `server/src/services/UserService.js`
  - `server/src/controllers/UserController.js`
  - `server/src/routes/UserRoute.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-07: Auth Module (Validation, Service, Controller, Route)
- **Date**: 2026-08-20
- **Scope**: User authentication, registration, password management, profile introspection
- **Description**:
  - Implemented `server/src/validations/auth.validation.js` with Zod schemas for login, registration, and password change.
  - Implemented `server/src/services/AuthService.js` with bcrypt password verification, lastLogin updating, and JWT token generation.
  - Implemented `server/src/controllers/AuthController.js` and `server/src/routes/AuthRoute.js` providing:
    - `POST /api/v1/auth/login`
    - `POST /api/v1/auth/register`
    - `GET /api/v1/auth/me` (Protected)
    - `POST /api/v1/auth/change-password` (Protected)
- **Files Modified/Created**:
  - `server/src/validations/auth.validation.js`
  - `server/src/services/AuthService.js`
  - `server/src/controllers/AuthController.js`
  - `server/src/routes/AuthRoute.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-06: Authentication Middlewares & Password Security Utilities
- **Date**: 2026-08-20
- **Scope**: Bcrypt hashing, JWT token lifecycle, Bearer token authentication, Role-based authorization
- **Description**:
  - Implemented `server/src/utils/password.js` with `hashPassword` (bcrypt salt work factor 10) and `comparePassword`.
  - Implemented `server/src/utils/jwt.js` with `signJwt` and `verifyJwt` incorporating typed `JwtPayload`.
  - Implemented `server/src/middlewares/auth.middleware.js`:
    - `authenticateToken`: Validates Bearer token header, verifies expiration, queries active user from PostgreSQL, and attaches `req.user`.
    - `requireRoles`: Multi-role access guard (e.g. `requireRoles('Owner', 'Admin', 'Manager')`).
- **Files Modified/Created**:
  - `server/src/utils/password.js`
  - `server/src/utils/jwt.js`
  - `server/src/middlewares/auth.middleware.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-05: Core Middlewares: Zod Validation & Global Error Handler
- **Date**: 2026-08-20
- **Scope**: Request validation pipeline, Prisma exception mapping, centralized HTTP error handler
- **Description**:
  - Implemented `server/src/middlewares/validate.middleware.js` using Zod schemas to validate `req.body`, `req.query`, and `req.params`, returning structured `400 Bad Request` validation field errors.
  - Implemented `server/src/middlewares/error.middleware.js` providing:
    - Zod error translation into clean JSON error arrays.
    - Prisma error code handling (`P2002` duplicate unique key → 409 Conflict, `P2025` record not found → 404, `P2003` foreign key error → 400).
    - JWT token expiry and signature error handling.
    - `notFoundHandler` for undefined route endpoints.
- **Files Modified/Created**:
  - `server/src/middlewares/validate.middleware.js`
  - `server/src/middlewares/error.middleware.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-04: Prisma Client Singleton & Soft-Delete / Logging Extensions
- **Date**: 2026-08-20
- **Scope**: Database Client lifecycle, query extension hooks, soft-delete safety
- **Description**:
  - Implemented `server/src/config/prisma.js` creating a singleton Prisma client instance.
  - Implemented Prisma `$extends` query middleware hooks that automatically enforce `{ isActive: true }` on all `findMany`, `findFirst`, and `count` operations.
  - Intercepted `delete` queries system-wide to execute soft-delete (`isActive: false`) updates instead of destructive hard deletes.
  - Added query logging in development mode and `testDatabaseConnection()` helper for health checks and server boot.
- **Files Modified/Created**:
  - `server/src/config/prisma.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-03: Prisma PostgreSQL Schema Definition & Setup
- **Date**: 2026-08-20
- **Scope**: PostgreSQL database modeling, enums, relations, decimal precisions, and compound indexes
- **Description**:
  - Implemented `server/prisma/schema.prisma` mapping the complete relational schema with 11 core models:
    - `User`: User roles enum, security credentials, audit relation linkages.
    - `Customer`: Central customer single-source-of-truth with 8 relational foreign keys, bio fields, JSONB attachments, and Decimal ledger fields (`totalBilledAmount`, `totalPaidAmount`, `totalDueAmount`).
    - `MoneyReceipt`: Payment tokens with manager/accountant relations, bank turnover status, and BDT currency tracking.
    - `CaseFile`: Universal case management with 5 lifecycle stages enum, 3-stage payment milestone decimals, and checklist JSONB.
    - `IndianVisaSubmission`, `PassportSubmission`, `CustomerGuardianApplication`, `CandidateCaseFile`, `Invoice`, `EmploymentAgreement`, `SalarySlip`.
  - Defined 8 native PostgreSQL enums (`UserRole`, `Gender`, `CustomerStatus`, `CustomerType`, `ReceiptStatus`, `PaymentMethod`, `CaseStatus`, `VisaStage`).
  - Added compound B-tree indexes for fast queries across tracking codes, customer names, passport numbers, and lifecycle statuses.
- **Files Modified/Created**:
  - `server/prisma/schema.prisma`
  - `Docs/Backend/Backend_Version_2.md`

### BR-02: Environment Config & Uniform API Response / Tracking Utilities
- **Date**: 2026-08-20
- **Scope**: Zod environment validation, DID generation, tracking number engine, standardized HTTP responses
- **Description**:
  - Implemented `server/src/config/env.js` with strict Zod parsing for environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `UPLOAD_PATH`) and exported JSDoc type definitions.
  - Implemented `server/src/utils/generateDid.js` creating 16-character decentralized crypto identifiers (`did`).
  - Implemented `server/src/utils/trackingNumbers.js` generating standard business IDs: `CUST-XXXXXX`, `MR-YYMMDD-XXXX`, `CS-YYYY-XXXX`, `IVISA-XXXXXXXXXX`, `PASS-XXXXXXXXXX`, `CGA-XX-XXXXXX`, `AGR-XXXXXXXX`, `SLIP-XXXXXXXXXX`, and `I-XXXXXXXXXX`.
  - Implemented `server/src/utils/apiResponse.js` with `sendSuccess`, `sendError`, and `getPaginationMeta` helpers enforcing uniform `{ success, status, message, data, pagination }` payloads.
- **Files Modified/Created**:
  - `server/src/config/env.js`
  - `server/src/utils/generateDid.js`
  - `server/src/utils/trackingNumbers.js`
  - `server/src/utils/apiResponse.js`
  - `Docs/Backend/Backend_Version_2.md`

### BR-01: Project Scaffold & Configuration Setup
- **Date**: 2026-08-20
- **Scope**: Project initialization, JSDoc configuration, dependency manifest
- **Description**:
  - Initialized `server/package.json` with Node.js ES Modules (`"type": "module"`), Express, Prisma, Zod, bcryptjs, jsonwebtoken, helmet, cors, morgan, multer, and sharp.
  - Configured `server/jsconfig.json` with `checkJs: true` and modular path aliases (`@/*`, `@config/*`, `@controllers/*`, `@services/*`, `@validations/*`, `@middlewares/*`, `@utils/*`, `@routes/*`) for strict IDE type-checking without TypeScript compilation overhead.
  - Created `server/.env.example` with PostgreSQL connection string, JWT secrets, upload paths, and CORS settings.
  - Created `server/.gitignore` for local storage, logs, and sensitive environment files.
- **Files Modified/Created**:
  - `server/package.json`
  - `server/jsconfig.json`
  - `server/.env.example`
  - `server/.gitignore`
  - `Docs/Backend/Backend_Version_2.md`
