# Feature Documentation: Internal Money Receipt & Payment Token Flow

> **Module Code:** `TK` | **Target Branch:** `ticketFlow` | **Created:** 2026-08-19

---

## 📋 Feature Architecture & Operational Flow

```
[ম্যানেজার ডেস্ক] ─────────▶ [গ্রাহক টোকেন কপি] ─────────▶ [একাউন্টস ও ক্যাশ ডেস্ক]
(টোকেন তৈরি: MR-260819-XXXX)    (A4 ডাবল স্লিপ প্রিন্ট)        (টোকেন সার্চ + ক্যাশ গ্রহণ + সিলমোহর)
                                                                       │
                                                                       ▼
[ডকুমেন্ট হস্তান্তর সম্পন্ন] ◀── [সিলযুক্ত কপি গ্রাহক আনল] ◀──── [ক্যাশ সিল কনফার্ম]
```

---

## 📦 Implementation Chunks & Commit Logs

### TK-01: Backend Money Receipt Schema & Payment Token Lifecycle Model
- **Date**: 2026-08-19
- **Scope**: Backend Database Schema & Identifier Engine
- **Description**:
  - Implemented `moneyReceipt.model.js` supporting unique tracking number generation (`MR-YYMMDD-XXXX`, e.g. `MR-260819-4829`).
  - Added 16-character unique decentralized identifier (`did`).
  - Implemented client snapshot fields (`clientName`, `clientPhone`, `passportNumber`).
  - Added service type, purpose, amount, amountInWords, currency (BDT), and payment method.
  - Built 3-stage lifecycle status: `pending` (token created) → `confirmed` (cash received & sealed) → `cancelled`.
  - Added manager creator audit fields (`createdBy`, `createdByName`).
  - Added accountant confirmation audit fields (`confirmedBy`, `confirmedByName`, `confirmedAt`).
  - Added bank turnover tracking flags (`handedOverToBank`, `bankDepositRef`, `bankDepositDate`).
  - Integrated soft-delete (`isActive: { type: Boolean, default: true }`) and compound text search indexes.
- **Files Modified/Created**:
  - `backend/src/models/moneyReceipt.model.js`

---

### TK-02: Backend Money Receipt Controller & REST Endpoints
- **Date**: 2026-08-19
- **Scope**: Express Controller, Routing & Financial Aggregator
- **Description**:
  - Implemented `MoneyReceiptController.js` supporting:
    - Full server-side pagination (`page`, `limit`, `skip`, `totalCount`, `totalPages`, `hasNextPage`, `hasPrevPage`).
    - 8-field regex search across receiptNo, clientName, clientPhone, passportNumber, serviceType, purpose, createdByName, and confirmedByName.
    - Status filtering (`pending`, `confirmed`, `cancelled`), serviceType filtering, date range queries (`startDate`, `endDate`), and bank handover status.
    - Token generation by manager (`POST /api/v1/receipts`) with auto customer linking.
    - Accountant cash seal & confirmation (`PATCH /api/v1/receipts/:id/confirm`) with auto customer ledger sync (`totalPaidAmount` & `totalDueAmount` recomputation).
    - Token cancellation (`PATCH /api/v1/receipts/:id/cancel`).
    - Bank turnover handover tracking (`PATCH /api/v1/receipts/:id/bank-deposit`).
    - Aggregated financial summary (`GET /api/v1/receipts/summary`) returning today's cash collections, pending tokens, office cash balance, and deposited bank funds.
    - Fast autocomplete lookup (`GET /api/v1/receipts/lookup`).
    - Soft delete (`DELETE /api/v1/receipts/:id`).
  - Created `MoneyReceiptRoute.js` and mounted at `/receipts` and `/money-receipts` in `routesIndex.js`.
- **Files Modified/Created**:
  - `backend/src/controllers/MoneyReceiptController.js`
  - `backend/src/routes/MoneyReceiptRoute.js`
  - `backend/src/routesIndex.js`
