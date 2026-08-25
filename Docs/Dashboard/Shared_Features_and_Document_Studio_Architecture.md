# Monsur Ali Travels — Shared Features & Document Studio Architecture Documentation

> **Version:** 2.0.0  
> **Target Systems:** Client Dashboard (`/dashboard/*`) & Admin Dashboard (`/admin/*`)  
> **Module Path:** `dashboard/src/shared/features/document-studio` (and `src/shared/featured/`)  
> **Status:** Production Ready & Verified  

---

## 1. Executive Summary & Architectural Vision

The **Monsur Ali Travels ERP** utilizes a **Modular Shared Features Architecture**. Instead of duplicating frontend and backend code across separate portals (such as the Frontdesk/Client Portal and the Admin Portal), business features are built as **self-contained, reusable feature modules** inside `dashboard/src/shared/features/`.

### Core Architectural Principles
1. **Single Source of Truth**: Business logic, forms, print previews, sample data sets, and schema validations reside in one shared module.
2. **Context-Aware Presentation**: The shared feature automatically adapts whether it is running inside the Client portal (using `usePortalStore` and `/dashboard/docs/*`) or the Admin portal (using `react-router-dom` and `/admin/docs/*`).
3. **Instant Portability**: Integrating a feature into any dashboard requires only a 1-line import.
4. **Unified API & Security**: Shared features utilize the unified `apiClient` (`axios` with automatic Bearer Token attachment, 401 token refresh queueing, and global toast error handling).

---

## 2. Directory & Component Structure

```
dashboard/src/shared/
  ├── features/
  │   ├── document-studio/
  │   │   ├── components/                 # 12 Document Generator Modules
  │   │   │   ├── agreement/              # Employment Agreement
  │   │   │   ├── customer-form/          # Customer & Guardian Application
  │   │   │   ├── indian-visa/            # Indian Visa Application & Port Slip
  │   │   │   ├── passport/               # Passport Custody Voucher Slip
  │   │   │   ├── idcard/                 # Dual-sided Employee Identity Card
  │   │   │   ├── payroll/                # Monthly Salary Slip
  │   │   │   ├── invoice/                # Tax Invoice & Client Billing
  │   │   │   ├── receipt/                # Money Receipt Voucher
  │   │   │   ├── cash-voucher/           # Office Petty Cash & Disbursement
  │   │   │   ├── certificate-experience/ # Work Experience Certificate
  │   │   │   ├── certificate-character/  # Character & Conduct Certificate
  │   │   │   ├── certificate-marriage/   # Marital Status Verification Letter
  │   │   │   ├── certificate/            # Generic Certificate Builder
  │   │   │   ├── resume/                 # Professional Resume Generator
  │   │   │   └── common/                 # Alert Modal, Export, Paper Canvas
  │   │   ├── configs/
  │   │   │   └── documentGenerators.js    # Generator definitions, icons, categories & metadata
  │   │   ├── pages/
  │   │   │   └── DocumentStudioPage.jsx    # Universal Document Studio page (Client & Admin compatible)
  │   │   └── index.js                    # Public API / barrel exports
  │   └── index.js                        # Master features export
  ├── featured/                           # Re-export Alias
  │   ├── document-studio/
  │   │   └── index.js
  │   └── index.js
```

---

## 3. The 12 Document Generators Specification

| # | Generator Identifier | English Title | Bengali Title | Category | Badge | Primary Features |
|---|---|---|---|---|---|---|
| 1 | `agreement` | Employment Agreement | নিয়োগ চুক্তিপত্র | Contracts & Legal | Legal Contract | Bilingual (Bangla & English) standard overseas agency contract |
| 2 | `customer-form` | Customer & Guardian Form | কাস্টমার ও অভিভাবক ফরম | Contracts & Forms | Application Form | Applicant profile, guardian guarantee, tracking number, WhatsApp share |
| 3 | `indian-visa` | Indian Visa Submission File | ইন্ডিয়ান ভিসা ফাইল | Visa & Passport | Visa File | Applicant details, port selection, appointment slip, barcode |
| 4 | `passport-sub` | Passport Submission Slip | পাসপোর্ট জমা রশিদ | Visa & Passport | Custody Slip | Handover voucher, barcode, passport validity tracker |
| 5 | `idcard` | Employee ID Card | কর্মচারী আইডি কার্ড | HR & Identity | Identity Card | Front & back card, QR code, blood group, designation |
| 6 | `payroll` | Monthly Salary Slip | মাসিক বেতন স্লিপ | HR & Payroll | Payroll Slip | Allowances, deductions, attendance reconciliation, net pay |
| 7 | `invoice` | Invoice Billing | ইনভয়েস ও বিলিং | Accounts & Billing | Tax Invoice | Itemized charges, VAT/tax, discount, payment status |
| 8 | `money-receipt` | Money Receipt Voucher | মানি রিসিট ভাউচার | Accounts & Receipts | Official Receipt | Taka in words, payment method, authorized signatures |
| 9 | `cash-voucher` | Cash Money Voucher | ক্যাশ মানি ভাউচার | Accounts & Vouchers | Cash Voucher | Petty cash, debit/credit disbursement printout |
| 10 | `experience-certificate` | Experience Certificate | অভিজ্ঞতা সনদপত্র | Certificates | Certificate | Corporate work tenure and release certificate letter |
| 11 | `character-certificate` | Character Certificate | চারিত্রিক সনদপত্র | Certificates | Certificate | Formal conduct, character & moral standing testimonial |
| 12 | `marriage-certificate` | Marriage Certificate | বিবাহ সনদপত্র | Certificates | Certificate | Official marital status verification for embassy/visa |

---

## 4. How to Import and Use

### Option A: Complete Feature Page (with Hub Overview, Search, and Category Filtering)

```jsx
import { DocumentStudioPage } from '@/shared/features/document-studio';

export default function MyPage() {
  return <DocumentStudioPage />;
}
```

### Option B: Specific Individual Document Generator Form

```jsx
import {
  CustomerGuardian,
  EmploymentAgreement,
  IndianVisa,
  SalarySlip,
  Invoice,
  MoneyReceipt,
} from '@/shared/features/document-studio';

export default function SingleDocView() {
  return (
    <div>
      <CustomerGuardian
        initialData={existingCustomerData}
        onSavedSuccess={(savedDoc) => console.log('Saved:', savedDoc)}
      />
    </div>
  );
}
```

### Option C: Generator Metadata & Configs

```jsx
import {
  DOCUMENT_GENERATORS,
  CATEGORIES,
  getGeneratorById,
} from '@/shared/features/document-studio';

const docInfo = getGeneratorById('customer-form');
console.log(docInfo.title, docInfo.badge);
```

---

## 5. Portal Integration Details

### 1. Client Dashboard Integration
- **File:** `dashboard/src/client/pages/DocumentStudio.jsx`
- **Route:** `/dashboard/docs` (Hub Overview) & `/dashboard/docs/:generator` (e.g. `/dashboard/docs/customer-form`)
- **State Sync:** Synced with Zustand `usePortalStore` (`activePortal: 'docs'`, `activeSubmodule: 'customer-form'`).
- **Navbar Styling:** Top-left Back button in the navbar navigates directly back to `/dashboard/docs/overview`.

```jsx
import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { DocumentStudioPage } from '../../shared/features/document-studio';

export default function DocumentStudio() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);

  return (
    <DocumentStudioPage
      activeSubmodule={activeSubmodule}
      onSelectGenerator={(genId) => switchPortal('docs', genId)}
    />
  );
}
```

### 2. Admin Dashboard Integration
- **File:** `dashboard/src/admin/pages/DocumentStudioPage.jsx`
- **Routes in `admin/App.jsx`:**
  - `/admin/docs`
  - `/admin/docs/:generator`
  - `/admin/document-studio`
  - `/admin/document-studio/:generator`
- **Navigation in `AdminLayout.jsx`:** Document Studio icon and menu item appear in the Admin sidebar for direct 1-click access.

```jsx
import React from 'react';
import { DocumentStudioPage as SharedDocumentStudio } from '../../shared/features/document-studio';

export default function DocumentStudioPage() {
  return <SharedDocumentStudio />;
}
```

---

## 6. Strict A4 Print Engine Specifications

All document generator previews are optimized for **standard A4 portrait printing (210mm x 297mm)**:

1. **Print Stylesheet Isolation**: Non-printable elements (`header`, `aside`, buttons, inputs) are automatically hidden via `.no-print` and `@media print` rules.
2. **Exact Dimensions**: Printable cards use `.printable-a4-paper` with fixed dimensions:
   - Width: `210mm`
   - Height: `297mm`
   - Margins: `12mm 14mm`
   - Box-sizing: `border-box`
3. **Direct Print Trigger**: `window.print()` triggers browser print dialog with full CSS background color rendering (`-webkit-print-color-adjust: exact`).

---

## 7. Adding a New Feature Under `src/shared/features/`

To add a new modular feature (e.g. `client-onboarding` or `accounts-ledger`):

1. **Create Directory**:
   ```
   dashboard/src/shared/features/my-feature/
     ├── components/
     ├── configs/
     ├── pages/
     └── index.js
   ```
2. **Export Public API** in `index.js`:
   ```javascript
   export { MyFeaturePage, default } from './pages/MyFeaturePage';
   export * from './components';
   ```
3. **Register in Master Export** in `dashboard/src/shared/features/index.js`:
   ```javascript
   export * from './my-feature';
   ```
4. **Import in Client and Admin** whenever needed without rewriting code.

---

## 8. Build & Verification Commands

```bash
# Build Admin Dashboard
npm run build:admin

# Build Client Dashboard
npm run build:client

# Build All Portals
npm run build
```
