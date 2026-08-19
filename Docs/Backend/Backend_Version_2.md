# Backend Version 2 Change Logs (BR-01 to BR-20)

This document tracks the incremental migration and implementation of the Next-Gen Backend for Monsur Ali Travels ERP using **Prisma ORM**, **PostgreSQL**, **Zod**, and **JSDoc**.

> **Architecture Rules:**
> 1. Latest log entries are always placed at the **TOP** (reverse chronological order).
> 2. All 20 task checkpoints are strictly tracked from `BR-01` to `BR-20`.
> 3. Existing MongoDB `backend/` remains completely untouched.

---

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
