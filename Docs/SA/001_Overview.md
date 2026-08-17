# Case Management System (SA) — Architecture, Plan & Implementation Overview

This document outlines the architecture, strategic plan, and technical implementation of the **Generic Case Management Module (SA)** for **Monsur Ali Travels ERP**.

---

## ১. আর্কিটেকচার ও মূল লক্ষ্য (Architecture & Core Vision)

### সমস্যা ও দূরদর্শী সমাধান:
* **সমস্যা:** নির্দিষ্ট দেশভিত্তিক (যেমন শুধু গ্রিস বা মেসিডোনিয়া) হার্ডকোডেড পাথ ভেক্টর বানালে ভবিষ্যতে নতুন দেশ (যেমন পোল্যান্ড, ইতালি, রোমানিয়া) বা ভিন্ন ভিসার ক্ষেত্রে সিস্টেম ভেঙে পড়ে।
* **সমাধান:** **.NET-Style Generic REST Repository & Query Builder Pattern**:
  - সমস্ত কেস (গ্রিস, মেসিডোনিয়া, ইন্ডিয়ান বিএসএফ বা ভবিষ্যতের যেকোনো দেশ) একটি সার্বজনীন `CaseFile` কালেকশনে সংরক্ষিত হবে।
  - কোনো ইউআরএল পাথ ভেক্টর (`/cases/greece`) হার্ডকোড থাকবে না; সমস্ত ফিল্টারিং **Query Parameters** (`?caseType=greece&status=ENTRY`) দিয়ে নিয়ন্ত্রিত হবে।

```
                                  ┌─────────────────────────────────────────┐
                                  │            CENTRAL CUSTOMER             │
                                  │   _id, name, phone, passportNumber      │
                                  └────────────────────┬────────────────────┘
                                                       │ 1:N (One-to-Many)
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │            CORE CASE FILE               │
                                  │  - caseNumber (CS-2026-XXXXX)           │
                                  │  - customerId (Ref: Customer)           │
                                  │  - caseType: greece | n-macedonia | bsf │
                                  │  - status (5 Universal Steps)           │
                                  │  - checklist (Photos, Bills, NID, Land) │
                                  │  - paymentLedger (3 Milestones + Due)   │
                                  │  - extraData: {} (Future-proof custom)  │
                                  └─────────────────────────────────────────┘
```

---

## ২. মূল প্ল্যান ও স্পেসিফিকেশন (Core Plan & Specifications)

### ক. সার্বজনীন ৫টি লাইফসাইকেল স্ট্যাটাস (Lifecycle Steps)
1. **`ENTRY`**: পাসপোর্ট রিসিভ ও সিস্টেমে এন্ট্রি।
2. **`PROCESSING`**: উকিল / লয়ার ফাইলটি হাতে নিয়ে প্রসেসিং শুরু করা।
3. **`APPROVED_OFFER_LETTER`**: ওয়ার্ক পারমিট / অফার লেটার অনুমোদন পাওয়া।
4. **`SUBMITTED_EMBASSY_BSF`**: বিএসএফ বা এম্বাসিতে ফাইল জমা সম্পন্ন।
5. **`COMPLETED_DELIVERED`**: পাসপোর্ট ও ভিসা ক্লায়েন্টকে ডেলিভারি সম্পন্ন (ফাইল ক্লোজড)।

### খ. ৪টি রিকোয়ারমেন্ট চেকলিস্ট ও কল রিমাইন্ডার
- `photo2x2`: ২x২ ল্যাব ছবি জমা হয়েছে কিনা।
- `electricityBill`: সাম্প্রতিক কারেন্ট বিলের কপি।
- `nidCopy`: এনআইডি কার্ডের কপি।
- `landDocuments`: জমির কাগজপত্রের কপি।
- `followUpCallRequired`: কোনো ডকুমেন্ট বাকি থাকলে হেল্পডেস্কে কল রিমাইন্ডার ফ্ল্যাগ।

### গ. ৩ ধাপের পেমেন্ট ও কোম্পানির বকেয়া (Due Ledger)
- **ধাপ ১:** ফাইল সাবমিশন অ্যাডভান্স (`step1_advance`).
- **ধাপ ২:** অফার লেটার / পারমিট অনুমোদন পেমেন্ট (`step2_offerApproval`).
- **ধাপ ৩:** ফাইনাল ভিসা ও পাসপোর্ট ডেলিভারি পেমেন্ট (`step3_delivery`).
- **বকেয়া ট্র্যাকিং (`dueAmount`):** মোট বকেয়া টাকার হিসাব এক নজরে ড্যাশবোর্ডে প্রদর্শনের জন্য নির্দিষ্ট ফিল্ড ও সামারি এগ্রিগেশন।

---

## ৩. যা যা বাস্তবায়ন করা হয়েছে (What Has Been Implemented)

### ১. Core Mongoose Model: [`caseFile.model.js`](file:///f:/Monsur%20Ali%20Travels/backend/src/models/caseFile.model.js)
- ইউনিক কেস নম্বর জেনারেটর (`CS-2026-XXXX`).
- সেন্ট্রাল `Customer` মডেলের সাথে ওয়ান-টু-মেনি রিলেশন।
- ৫টি ইউনিভার্সাল স্ট্যাটাস এনুম (`ENTRY`, `PROCESSING`, `APPROVED_OFFER_LETTER`, `SUBMITTED_EMBASSY_BSF`, `COMPLETED_DELIVERED`, `REJECTED`, `ON_HOLD`).
- ৪টি চেকলিস্ট ও কল রিমাইন্ডার বুলিয়ান ফ্ল্যাগ।
- ৩-ধাপের পেমেন্ট, পেইড ক্যালকুলেশন এবং ম্যানুয়াল/অটো বকেয়া লেজার `pre-save` হুক।
- ফিউচার-প্রুফ `extraData: Schema.Types.Mixed` সাপোর্ট।

### ২. Generic .NET-Style Controller: [`caseFile.controller.js`](file:///f:/Monsur%20Ali%20Travels/backend/src/controllers/caseFile.controller.js)
- `buildGenericCaseQuery`: ডটনেট স্টাইলের সার্বজনীন কুয়েরি বিল্ডার:
  - `caseType` / `type`: সিঙ্গেল বা কমা-সেপারেটেড মাল্টিপল `$in` ফিল্টারিং (যেমন `?caseType=greece,n-macedonia`).
  - `status`: মাল্টিপল স্ট্যাটাস `$in` ফিল্টারিং (যেমন `?status=ENTRY,PROCESSING`).
  - `search` / `q`: পাসপোর্ট, নাম, ফোন, কেস নম্বর ও এনআইডি জুড়ে গ্লোবাল টেক্সট/রেজেক্স সার্চ।
  - `hasDue`, `dueMin`, `dueMax`: বকেয়া ফিল্টারিং।
  - `followUpOnly`: পেন্ডিং পেপারের কল রিমাইন্ডার ফিল্টারিং।
  - `startDate`, `endDate`: তারিখ অনুযায়ী ফিল্টারিং।
  - `sortBy`, `sortOrder`, `page`, `limit`, `fields` সিলেকশন ও পেজিনেশন মেটাডাটা।
- `getAllCases`: সার্বজনীন তালিকা ও পেজিনেশন।
- `lookupCase`: পাসপোর্ট/ফোন দিয়ে ইনস্ট্যান্ট ফাস্ট সার্চ।
- `getCaseById`: সম্পূর্ণ কেস ও কাস্টমার প্রোফাইল ডিটেইলস।
- `createCase`: নতুন কেস তৈরি ও সেন্ট্রাল কাস্টমার অটো-লিঙ্ক।
- `updateCase`: স্ট্যাটাস, চেকলিস্ট ও পেমেন্ট আপডেট।
- `deleteCase`: কেস মুছে ফেলা।
- `getDueSummary`: কোম্পানি ও দেশভিত্তিক মোট কেস, পেইড এবং ৩ কোটি টাকার মোট বকেয়া সামারি এগ্রিগেশন।
- `bulkImportCases`: ২৫০+ রানিং কেস ফাইলের বাল্ক ইমপোর্ট।

### ৩. ক্লিন রাউট রেজিস্ট্রেশন: [`CaseFileRoute.js`](file:///f:/Monsur%20Ali%20Travels/backend/src/routes/CaseFileRoute.js) & [`routesIndex.js`](file:///f:/Monsur%20Ali%20Travels/backend/src/routesIndex.js)
- `GET /api/v1/cases`: Universal Filter & Pagination
- `POST /api/v1/cases`: Create Case
- `GET /api/v1/cases/summary`: Company Due & Analytics
- `GET /api/v1/cases/lookup`: Instant Search
- `GET /api/v1/cases/:id`: Single Case
- `PUT /api/v1/cases/:id`: Update Case
- `DELETE /api/v1/cases/:id`: Delete Case
- `POST /api/v1/cases/bulk`: Bulk Import
- `Customer` মডেলে `cases: [{ type: Schema.Types.ObjectId, ref: 'CaseFile' }]` রিলেশন আপডেট সম্পন্ন।
