# Monsur Ali Travels ERP — Database Architecture & Entity-Relationship Design

> **Last Updated:** 2026-08-17 | **Version:** 0.4.0 | **Stack:** Node.js + Express + MongoDB (Mongoose) + React (Vite)

---

## ১. সিস্টেম ওভারভিউ (System Overview)

মনসুর আলী ট্রাভেলস ইআরপি হচ্ছে একটি **Single-Tenant**, **Monorepo** ভিত্তিক ফুল-স্ট্যাক ERP সিস্টেম।

| Layer | Technology | Directory |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Tailwind CSS + shadcn/ui | `dashboard/` |
| **Backend** | Node.js + Express.js + Mongoose ODM | `backend/` |
| **Database** | MongoDB 7.x (Docker) | Container: `monsuralitravels-mongodb-live` |
| **Proxy** | Nginx + Cloudflare SSL | `nginx-prod.conf` |
| **Deploy** | Docker Compose + Systemd | `docker-compose.prod.yml` |

---

## ২. এন্টিটি-রিলেশনশিপ ডায়াগ্রাম (Entity-Relationship Flow)

`Customer` হচ্ছে **কেন্দ্রীয় সত্ত্বা (Single Source of Truth)**। একজন কাস্টমার একাধিক সার্ভিস গ্রহণ করতে পারেন।

```
                            ┌─────────────────────────────────────────┐
                            │            CUSTOMER (কেন্দ্রীয়)          │
                            │  _id, customerCode (CUST-XXXXXX)        │
                            │  fullName, phone, passportNumber, NID   │
                            │  fatherName, motherName, guardian, etc. │
                            │  attachments: { photo, passport, NID }  │
                            │  ledger: { billed, paid, due }          │
                            └────────────────────┬────────────────────┘
                                                 │ 1:N (One-to-Many)
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         │                   │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐ ┌────────────────┐
│ CustomerGuardian │ │ IndianVisa       │ │ Passport       │ │ CandidateCase    │ │ Invoice        │
│ Application      │ │ Submission       │ │ Submission     │ │ File (Agency)    │ │ & Billing      │
│ (customerId Ref) │ │ (customerId Ref) │ │(customerId Ref)│ │ (customerId Ref) │ │(customerId Ref)│
└──────────────────┘ └──────────────────┘ └────────────────┘ └──────────────────┘ └────────────────┘
```

---

## ৩. MongoDB কালেকশন ম্যাপ (Collection Registry)

| # | Collection Name | Model Name | Tracking ID | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `customers` | `Customer` | `CUST-XXXXXX` | কেন্দ্রীয় কাস্টমার প্রোফাইল ও লেজার |
| 2 | `customerguardians` | `CustomerGuardian` | `CGA-XX-XXXXXX` | কাস্টমার ও গার্ডিয়ান আবেদন ফর্ম |
| 3 | `indianvisasubmissions` | `IndianVisaSubmission` | `IVISA-XXXXXXXXXX` | ইন্ডিয়ান ভিসা আবেদন ট্র্যাকিং |
| 4 | `passport-submissions` | `PassportSubmission` | `PASS-XXXXXXXXXX` | পাসপোর্ট সাবমিশন ট্র্যাকিং |
| 5 | `candidatecasefiles` | `CandidateCaseFile` | `MP-YYYY-XXXX` | ম্যানপাওয়ার ক্যান্ডিডেট কেস ফাইল |
| 6 | `employment-agreement` | `EmploymentAgreement` | `AGR-XXXXXXXX` | চাকরির চুক্তিপত্র |
| 7 | `salary-slips` | `SalarySlip` | `SLIP-XXXXXXXXXX` | মাসিক স্যালারি স্লিপ |
| 8 | `invoices` | `Invoice` | `I-XXXXXXXXXX` | বিলিং ও ইনভয়েস |
| 9 | `users` | `User` | — | সিস্টেম ইউজার (Admin, Owner, Agent, Staff) |

---

## ৪. Central Customer Schema বিস্তারিত (`customers`)

### আইডেন্টিফায়ার
- `_id` (MongoDB ObjectId)
- `did` (Decentralized ID — `crypto.randomBytes(8).toString("hex")`)
- `customerCode` (ইউনিক — `CUST-100001` ... `CUST-999999`)

### বায়োমেট্রিক ও পার্সোনাল ডাটা
`fullName`, `nidNumber`, `passportNumber`, `passportExpiryDate`, `birthDate`, `gender`, `bloodGroup`, `maritalStatus`

### যোগাযোগ ও ঠিকানা
`phone`, `altPhone`, `email`, `presentAddress`, `permanentAddress`, `district`, `policeStation`, `postCode`

### পারিবারিক তথ্য
`fatherName`, `motherName`, `spouseName`

### অভিভাবকের তথ্য (Embedded Sub-Document)
```
guardian: {
  name, relationship, phone, nidNumber,
  fatherName, motherName, email, address
}
```

### ফাইল রিপোজিটরি (Embedded Sub-Document)
```
attachments: {
  photo,           // 2x2 ছবি URL/Base64
  passportScan,    // পাসপোর্ট স্ক্যান
  nidScan,         // NID স্ক্যান
  birthCertScan,   // জন্ম সনদ
  otherDocuments: [{ name, fileType, fileUrl, uploadedAt }]
}
```

### রিলেশনাল রেফারেন্স (Array of ObjectIds)
| Field | Reference Model | Relation |
| :--- | :--- | :--- |
| `applications[]` | `CustomerGuardianApplication` | 1:N |
| `visaSubmissions[]` | `IndianVisaSubmission` | 1:N |
| `passportSubmissions[]` | `PassportSubmission` | 1:N |
| `candidateCases[]` | `CandidateCaseFile` | 1:N |
| `agreements[]` | `EmploymentAgreement` | 1:N |
| `invoices[]` | `Invoice` | 1:N |

### লেজার সামারি
`totalBilledAmount`, `totalPaidAmount`, `totalDueAmount`

### স্ট্যাটাস
`status`: `Active` | `Lead` | `Inactive` | `Blacklisted` | `Archived`
`customerType`: `Individual` | `Corporate` | `Agent_Referred` | `VIP`

---

## ৫. REST API এন্ডপয়েন্ট ম্যাপ

### Customer APIs (`/api/v1/customers`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/customers` | পেজিনেশন, সার্চ, ফিল্টার ও পপুলেটেড রিলেশনসহ তালিকা |
| `GET` | `/api/v1/customers/lookup?query=...` | পাসপোর্ট/ফোন/NID দিয়ে দ্রুত অটো-কমপ্লিট সার্চ |
| `POST` | `/api/v1/customers` | নতুন কাস্টমার প্রোফাইল তৈরি |
| `GET` | `/api/v1/customers/:id` | ফুল প্রোফাইল ভিউ (সব রিলেশন পপুলেটেড) |
| `PUT` | `/api/v1/customers/:id` | কাস্টমার প্রোফাইল আপডেট |
| `DELETE` | `/api/v1/customers/:id` | কাস্টমার মুছে ফেলা |

### Document APIs

| Module | Base Endpoint | Tracking Prefix |
| :--- | :--- | :--- |
| Customer Guardian App | `/api/v1/docs/customer-guardians` | `CGA-XX-XXXXXX` |
| Indian Visa | `/api/v1/indian-visas` | `IVISA-XXXXXXXXXX` |
| Passport | `/api/v1/passports` | `PASS-XXXXXXXXXX` |
| Candidate Case | `/api/v1/candidates` | `MP-YYYY-XXXX` |
| Agreement | `/api/v1/agreements` | `AGR-XXXXXXXX` |
| Payroll | `/api/v1/payrolls` | `SLIP-XXXXXXXXXX` |
| Invoice | `/api/v1/invoices` | `I-XXXXXXXXXX` |

---

## ৬. অটো-সিঙ্ক আর্কিটেকচার (`customerSyncHelper.js`)

```
┌────────────────────────────┐
│   Document Form Submit     │  (Visa / Passport / Guardian App / Invoice)
│   POST /api/v1/docs/...    │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  syncCustomerProfile()     │  ← Passport / NID / Phone দিয়ে Customer খোঁজে
│  helper/customerSyncHelper │
└───────────┬────────────────┘
            │
      ┌─────┴─────┐
      │            │
      ▼            ▼
  পাওয়া গেছে   পাওয়া যায়নি
      │            │
      ▼            ▼
  আপডেট করে    নতুন Customer
  রিলেশন পুশ   তৈরি করে লিঙ্ক
  লেজার আপডেট  করে দেয়
```

**ফলাফল:** পুরো সিস্টেমে কোনো ডাটা ডুপ্লিকেশন নেই। একজন কাস্টমারের সমস্ত ট্রাভেল হিস্ট্রি, ফাইল, ও পেমেন্ট **এক জায়গা** থেকে স্বয়ংক্রিয়ভাবে নিয়ন্ত্রণ হয়।

---

## ৭. ব্যাকএন্ড ফাইল স্ট্রাকচার

```
backend/src/
├── config/          # env.js, config.core.json, logger.js
├── controllers/
│   ├── CustomerController.js          # Central Customer CRUD + Lookup
│   ├── CustomerGuardianController.js  # Guardian Application CRUD + Sync
│   ├── CandidateController.js         # Candidate Case File CRUD
│   ├── AgreementController.js         # Employment Agreement CRUD
│   ├── IndianVisaController.js        # Indian Visa CRUD + Stage Processing
│   ├── InvoiceController.js           # Invoice & Billing CRUD
│   ├── PassportSubmissionController.js # Passport Submission CRUD
│   ├── PayrollController.js           # Salary Slip CRUD
│   └── DashboardController.js         # ERP Overview Analytics
├── helper/
│   └── customerSyncHelper.js          # Auto-sync customer relations
├── middlewares/
│   └── commonUpload.middleware.js     # Multi-format file upload (YYMMDD routing)
├── models/
│   ├── customer.model.js              # Central Customer Schema
│   ├── customerGuardianApplication.model.js
│   ├── candidateCaseFile.model.js
│   ├── employmentAgreement.model.js
│   ├── indianVisaSubmission.model.js
│   ├── passportSubmission.model.js
│   ├── salarySlip.model.js
│   ├── invoice.model.js
│   └── user.model.js
├── routes/
│   ├── CustomerRoute.js               # /customers (CRUD + /lookup)
│   ├── CandidateRoute.js              # /candidates
│   ├── AgreementRoute.js              # /agreements
│   ├── IndianVisaRoute.js             # /indian-visas
│   ├── PassportSubmissionRoute.js     # /passports
│   ├── PayrollRoute.js                # /payrolls
│   ├── InvoiceRoute.js                # /invoices
│   ├── DocsRoute.js                   # /docs/* (backward-compatible)
│   └── ...
├── routesIndex.js                     # Master route mounting
├── app.js                            # Express app configuration
└── database/index.js                 # MongoDB connection
```

---

## ৮. কোডবেজ কনভেনশন

### Tracking ID Generation Pattern
```
PREFIX + 2 Letters + 4 Digits + 1 Middle Letter + 3 Digits
Example: PASS-AB4829K513, IVISA-KR7291M042, I-CD5830N271
```

### Pagination Response Standard
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "totalCount": 42,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Model Export Pattern
```javascript
export const ModelName = mongoose.models.ModelName || mongoose.model("ModelName", schema);
```
