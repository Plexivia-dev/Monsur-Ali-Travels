# Monsur Ali Travels ERP — Database Architecture & Customer Module Plan

---

## ১. ডাটাবেজ ডিজাইন ও আর্কিটেকচার প্ল্যান (Database Entity-Relationship & Flow)

মনসুর আলী ট্রাভেলস ইআরপি-তে **Customer** হচ্ছে কেন্দ্রীয় সত্ত্বা (Single Source of Truth)। ডাটাবেজের পারফরম্যান্স অপ্টিমাইজেশন ও জটিল হিসাব-নিকাশের নির্ভুলতা নিশ্চিত করতে MongoDB-র পরিবর্তে **Prisma ORM-এর মাধ্যমে SQL রিলেশনাল ডাটাবেজ (PostgreSQL / MySQL)** ব্যবহার করা হচ্ছে। একজন কাস্টমার একাধিক সার্ভিস গ্রহণ করতে পারেন (যেমন: ভিসা প্রসেসিং, পাসপোর্ট নবায়ন, ম্যানপাওয়ার কেস বা ইনভয়েস)। এই সম্পর্কযুক্ত রিলেশনাল আর্কিটেকচার নিচে তুলে ধরা হলো:

```
                            ┌─────────────────────────────────────────┐
                            │            CUSTOMER (কেন্দ্রীয়)          │
                            │  id (Primary Key), customerCode (Unique)│
                            │  fullName, phone, passportNumber, NID   │
                            │  fatherName, motherName, guardian, etc. │
                            │  attachments: { photo, passport, NID }  │
                            │  ledger: { billed, paid, due }          │
                            └────────────────────┬────────────────────┘
                                                 │ 1:N (One-to-Many Relation)
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

## ২. টেবিল স্কিমা বিস্তারিত (Prisma Schema Design)

### ১. Central `Customer` Table (`Customer`)
* **আইডেন্টিফায়ার:** `id` (String/Int, Primary Key), `customerCode` (`CUST-100001` ইউনিক ইনডেক্স)।
* **বায়োমেট্রিক ও পার্সোনাল ডাটা:** `fullName`, `nidNumber`, `passportNumber`, `passportExpiryDate`, `birthDate`, `gender`, `bloodGroup`, `maritalStatus`।
* **যোগাযোগ ও ঠিকানা:** `phone`, `altPhone`, `email`, `presentAddress`, `permanentAddress`, `district`, `policeStation`।
* **অভিভাবকের তথ্য:** `guardian: { name, relationship, phone, nidNumber, address }` (বা রিলেশনাল টেবিল/JSON কলাম)।
* **ফাইল রিপোজিটরি:** `attachments: { photo, passportScan, nidScan, otherDocuments: [] }` (JSON বা রিলেশনাল স্টোরেজ)।
* **রিলেশনাল রেফারেন্স (Prisma Relation Fields):**
  - `applications`: `CustomerGuardianApplication[]` (১:N রিলেশন)
  - `visaSubmissions`: `IndianVisaSubmission[]` (১:N রিলেশন)
  - `passportSubmissions`: `PassportSubmission[]` (১:N রিলেশন)
  - `candidateCases`: `CandidateCaseFile[]` (১:N রিলেশন)
  - `agreements`: `EmploymentAgreement[]` (১:N রিলেশন)
  - `invoices`: `Invoice[]` (১:N রিলেশন)
* **লেজার সামারি:** `totalBilledAmount`, `totalPaidAmount`, `totalDueAmount`, `status` (`Active` / `Lead` / `Inactive` / `Blacklisted`)।

---

## ৩. কাস্টমার রাউট ডিজাইন (`/api/v1/customers`)

| মেথড | এন্ডপয়েন্ট | বিবরণ | রেসপন্স টাইপ |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/customers/lookup?query=...` | পাসপোর্ট, ফোন বা NID দিয়ে লাইভ সার্চ ও ফর্ম অটো-কমপ্লিট | কাস্টমার অবজেক্টের শর্ট ডাটা |
| **GET** | `/api/v1/customers` | পেজিনেশন, মাল্টি-ফিল্ড সার্চ এবং পপুলেটেড রিলেশনসহ তালিকা | `{ data: [...], pagination: {...} }` |
| **POST** | `/api/v1/customers` | সরাসরি নতুন কাস্টমার প্রোফাইল তৈরি | `{ status: 'success', data: {...} }` |
| **GET** | `/api/v1/customers/:id` | কাস্টমারের প্রোফাইল ও লিংকড সব ফাইল ও লেজার হিস্ট্রি | সম্পূর্ণ পপুলেটেড কাস্টমার প্রোফাইল |
| **PUT** | `/api/v1/customers/:id` | কাস্টমার প্রোফাইলের যেকোনো তথ্য আপডেট | আপডেট হওয়া কাস্টমার অবজেক্ট |
| **DELETE**| `/api/v1/customers/:id` | কাস্টমার প্রোফাইল মুছে ফেলা | কনফার্মেশন মেসেজ |

---

## ৪. কন্ট্রোলার ও অটো-সিঙ্ক আর্কিটেকচার (Controller & Relational Sync Logic)

1. **`CustomerController`**:
   - `getAll`: `query.$or` দিয়ে নাম, ফোন, পাসপোর্ট ও NID-তে ম্যাচ সার্চ চালায় এবং Prisma-র `include` ফিচার ব্যবহার করে সম্পূর্ণ হিস্ট্রি একসাথে দেয়।
   - `getById`: নির্দিষ্ট কাস্টমারের সমস্ত ডকুমেন্টস, কেস ফাইল, এবং ইনভয়েস একত্র করে ফুল রিলেশনাল প্রোফাইল ভিউ রিটার্ন করে।
   - `lookup`: ডকুমেন্টস ফর্মে কাস্টমার টাইপ করার সময় ২-৩ ক্যারেক্টারে দ্রুত ম্যাচ খুঁজে অটো-ফিল করতে সাহায্য করে।

2. **`customerSyncHelper` (স্বয়ংক্রিয় রিলেশন লিংকার)**:
   - যখনই `CustomerGuardianApplication`, `IndianVisaSubmission`, অথবা `PassportSubmission` জমা পড়বে, হেল্পার স্বয়ংক্রিয়ভাবে পাসপোর্ট/NID/ফোন দিয়ে কাস্টমার খুঁজবে।
   - কাস্টমার উপস্থিত থাকলে নতুন ফাইলের আইডি ফরেন কি (`customerId`) হিসেবে সেট করে কাস্টমারের রিলেশন আপডেট করবে এবং লেজার ব্যালেন্স অটো-সিঙ্ক করবে।
   - কাস্টমার নতুন হলে স্বয়ংক্রিয়ভাবে মূল `Customer` টেবিলে প্রোফাইল তৈরি করে লিঙ্কড আইডি যুক্ত করে দেবে।

---

## ৫. রুট `Docs` ফোল্ডারের ডকুমেন্টেশন ও প্রজেক্ট স্ট্রাকচার

ভবিষ্যতে `server` ফোল্ডার ব্যবহারের পরিকল্পনা থাকলেও, এই মুহূর্তে সমস্ত ব্যাকএন্ড ডেভেলপমেন্ট **`backend`** ফোল্ডারের অধীনেই চলমান থাকবে। রুট `Docs` ডিরেক্টরি এবং ডেভেলপমেন্ট চেঞ্জলগ রেকর্ড করার বিন্যাস নিচে দেওয়া হলো:

```
Docs/
├── 00_Architecture.md         # সিস্টেম ও রিলেশনাল ডাটাবেজ মডেল ওভারভিউ (Prisma-PostgreSQL/MySQL)
├── 01_Git_architecture_guide.md # গিট ব্রাঞ্চ ও কমিট মেসেজ কনভেনশন
├── 09_Image-upload-pipeline.md  # সেন্ট্রাল আপলোড ও ফাইল স্টোরেজ আর্কিটেকচার
├── Backend/
│   └── MB01-100.md            # ব্যাকএন্ডের সমস্ত মডেল, কন্ট্রোলার ও রাউটের ভার্সন চেঞ্জলগ (MB15-MB17)
└── Dashboard/
     └── MD01-100.md            # ফ্রন্টএন্ড ফর্ম, প্রিভিউ ও ডাটা টেবিলের চেঞ্জলগ (MD92-MD94)
```

এই রিলেশনাল আর্কিটেকচারের ফলে পুরো মনসুর আলী ট্রাভেলস সিস্টেমে কোনো ডাটা ডুপ্লিকেট বা ইনকনসিস্টেন্ট হবে না এবং ডাটাবেজ লেভেলেই রেফারেন্সিয়াল ইন্টিগ্রিটি ও ট্রানজেকশনাল নিরাপত্তা বজায় থাকবে।