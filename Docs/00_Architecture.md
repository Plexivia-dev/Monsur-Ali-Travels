# Monsur Ali Travels ERP — System Architecture & Data Flow Design

> **Last Updated:** 2026-08-21 | **Version:** 1.0.0 | **Stack:** Node.js + Express (ESM) + MongoDB (Mongoose) + React (Vite)

---

## ১. সিস্টেম ওভারভিউ (System Overview)

মনসুর আলী ট্রাভেলস ইআরপি হচ্ছে একটি **Monorepo** ভিত্তিক ফুল-স্ট্যাক ERP সিস্টেম।

| Layer | Technology | Directory | Description |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** | React 19 + Vite + Tailwind v4 + Shadcn | `dashboard/admin` | ওনার ও এডমিনের মাস্টার কন্ট্রোল প্যানেল (Workflow, Accounts, Users) |
| **Client Dashboard**| React 18 + Vite + Tailwind v4 + Shadcn | `dashboard/client` | স্টাফদের অপারেশনাল পোর্টাল (My Tasks, Case Entry, Document Studio) |
| **Backend API** | Node.js + Express.js (ESM) | `backend/src/` | RESTful API (`/api/v1/admin` & `/api/v1/client`) |
| **Database** | MongoDB 7.x | Container / Atlas | NoSQL Engine strictly using `did` for all relations |
| **Proxy & SSL** | Nginx + Cloudflare | `nginx.conf` | Domain Routing & SSL Proxy |

---

## ২. কোর ডাটাবেজ আর্কিটেকচার ও কালেকশন ফ্লো (The Core Relationship Flow)

`Client` হচ্ছে **সেন্ট্রাল ট্রুথ (Single Source of Truth)**। 

```text
               ┌─────────────────────────────────────────┐
               │              CLIENT (did)               │
               │   (কেন্দ্রীয় ট্রুথ: নাম, ফোন, পাসপোর্ট) │
               └────────────────────┬────────────────────┘
                                    │ 1:N (did ──> clientDid)
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     DOCUMENT VAULT (did)        │           │         CASE FILE (did)         │
│  (ফাইল/স্ক্যান: clientDid Ref)  │           │   (মাষ্টার কেস: clientDid Ref)   │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 │ N:M (allowedDocumentDids)                   │ 1:N (did ──> caseDid)
                 ▼                                             ├─────────────────────────┐
┌─────────────────────────────────┐                            ▼                         ▼
│           TASK (did)            │              ┌───────────────────────────┐ ┌──────────────────┐
│  (স্টাফের কাজ: caseDid, Assigned)│              │ MONEY RECEIPT / INVOICE   │ │ STATUS HISTORY   │
└─────────────────────────────────┘              │  (পেমেন্ট: caseDid Ref)   │ │  (লগ টাইমলাইন)   │
                                                 └───────────────────────────┘ └──────────────────┘
```

---

## ৩. রিলেশনাল ফিল্ড ও বিজনেস লজিক ম্যাপ

### 3.1 Client & Case File Connection (`clients` & `casefiles`)
- **`Client.did` ──> `CaseFile.clientDid`**: প্রতিটি কেস ফাইল একজন ক্লায়েন্টের সাথে যুক্ত থাকে।
- **Snapshot Pattern:** `CaseFile` এ `applicantName` এবং `passportNumber` এর স্ন্যাপশট ফিল্ড থাকে যাতে ভারী `.populate()` ছাড়াই সার্চিং ও ফিল্টারিং দ্রুত হয়।

### 3.2 Task & Document Security Vault (`tasks` & `documentvaults`)
- **`CaseFile.did` ──> `Task.caseDid`**: একটি কেস ফাইলের অধীনে একাধিক টাস্ক/ওয়ার্কফ্লো স্টেপ থাকে।
- **Document Access Control:** `Task.allowedDocumentDids` অ্যারেইতে শুধুমাত্র নির্দিষ্ট ডকুমেন্টের `did` সংরক্ষণ করা হয়। Mongoose Virtual Populated `permittedDocs` এর মাধ্যমে স্টাফ শুধু তার অ্যাসাইনকৃত কাজের প্রয়োজনীয় নথি দেখতে পারে।

### 3.3 Payment, Money Receipt & Ledger Connection (`moneyreceipts` & `invoices`)
- **`CaseFile.did` ──> `MoneyReceipt.caseDid` & `Client.did` ──> `MoneyReceipt.clientDid`**:
  যখন একাউন্টস বা ফ্রন্টডেস্ক ক্লায়েন্টের পেমেন্ট রিসিভ করে ইনভয়েস/মানি রিসিট ইস্যু করে (যেমন ২ লাখ টাকা দিল), তখন সেই পেমেন্ট অটোমেটিক্যালি `caseDid` ও `clientDid` রেফারেন্সসহ সংরক্ষণ হয়।
- **Real-Time Ledger Auto-Sync:**
  পেমেন্ট রিসিভ এনট্রি হওয়ার সাথে সাথে `CaseFile.paymentLedger` (Paid Amount, Due Amount) এবং `Client.financialSummary` অটোমেটিক আপডেট হয়ে যায়।

### 3.4 User & Employee Identity Mapping (`users` & `employees`)
- **`User` (Authentication Credentials):** সিস্টেম লগইন অ্যাকাউন্টের ফিল্ডসমূহ (`email`, `passwordHash`, `role`: `Owner` | `Admin` | `Manager` | `Staff`)।
- **`Employee` (HR Profile & Payroll):** স্টাফের বিস্তারিত বায়োডেটা, পদবী, জয়েনিং ডেট, মূল বেতন (`baseSalary`), স্যালারি পেমেন্ট হিস্ট্রি (`salaryHistory`), এবং এক্সেস লেভেল (`permissions`)।
- **`User.employeeDid` ──> `Employee.did`**: যেকোনো `Staff` ব্যবহারকারীর প্রোফাইল অবশ্যই `Employee` কালেকশনের `did` এর সাথে যুক্ত থাকবে।

---

## ৪. ব্যাকএন্ড ফোল্ডার ও এক্সেস স্কোপিং

```text
backend/src/
├── config/              # env.js, logger.js
├── controllers/
│   ├── admin/           # Admin/Owner Controllers (Case workflow approval, users, accounts)
│   ├── client/          # Staff Controllers (My Tasks, Case Entry, Document Studio)
│   └── shared/          # Shared Controllers (Auth, QR, Uploads, Notifications)
├── middlewares/
│   ├── auth.middleware.js # JWT & Role authorization (Owner, Admin, Manager, Staff)
│   └── auditLog.js      # SystemLog audit trail for Admin modifications
├── models/              # All 15 Mongoose Models with mandatory `did` field
├── routes/
│   ├── admin/           # Protected under /api/v1/admin/*
│   ├── client/          # Protected under /api/v1/client/*
│   └── shared/          # Mounted at /api/v1/*
├── routesIndex.js       # Master Router Mounting
└── app.js               # Express Bootstrapper
```

---

## 🔒 ৫. স্ট্রিক্ট আর্কিটেকচারাল রুলস (`@rules:DID`)

1. **`did` বাধ্যতামূলক:** মঙ্গোডিবির প্রতিটি কালেকশনে `did` ফিল্ড থাকবে এবং ব্যাকএন্ডের সমস্ত রিলেশন `did` দিয়েই গঠিত হবে। মঙ্গোডিবির ইন্টারনাল `_id` কোথায়ও কোডে বা রিলেশনে ব্যবহার করা নিষিদ্ধ।
2. **ESM Syntax Only:** কোডবেজে CommonJS `require()` নিষিদ্ধ, সম্পূর্ণ কোড `import`/`export` স্টাইলে লেখা থাকবে।
3. **Owner Role Security:** `Owner` রোল তৈরির কোনো এপিআই থাকবে না। ওনার প্রোফাইল সরাসরি সিডেড থাকবে।
4. **Audit Logging:** এডমিন প্যানেলে যেকোনো পরিবর্তন হলে তা অটোমেটিক্যালি `SystemLog` কালেকশনে রেজিস্টার্ড হবে।
