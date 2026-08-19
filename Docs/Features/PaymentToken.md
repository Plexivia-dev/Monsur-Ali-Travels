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
