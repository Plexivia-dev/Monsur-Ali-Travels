# 📄 Monsur Ali Travels — Universal A4 PDF & Print Engine (Backup & Documentation)

> **Complete standalone backup of the high-precision A4 PDF print engine and document templates.**  
> Solves all modern web print bugs: Split-View Scale Trapping (`scale(0.88)`), Sidebar Margin Displacement, Blank Previews, and Bleed-Through of floating UI elements.

---

## 📁 Backup Folder Structure

```
pdf-print-engine-backup/
├── core/
│   ├── printEngine.js                # Universal isolated iframe print engine (printDocument)
│   ├── printStyles.css               # Global A4 print stylesheet & container resets
│   ├── PrintablePaper.jsx            # Standard A4 paper preview wrapper
│   └── StudioFloatingViewSwitcher.jsx# Floating view toggle bar (with .no-print)
├── templates/
│   ├── JobVerificationPreview.jsx    # 1-page bilingual (বাংলা/EN) Job Verification Form
│   ├── InvoicePreview.jsx            # 1-page A4 Invoice with QR verification & items table
│   ├── MoneyReceiptPreview.jsx       # 2-in-1 Dual Slip A4 Money Receipt (Client & Office)
│   ├── MoneyReceiptPrintSlip.jsx     # High-precision printable money receipt slip
│   ├── CashVoucherPreview.jsx        # Petty Cash Disbursement Voucher
│   ├── SalarySlipPreview.jsx         # Monthly Payroll / Salary Slip
│   ├── AgreementPreview.jsx          # Employment & Service Agreement Document
│   ├── IndianVisaPreview.jsx         # Indian Visa Application Sheet
│   ├── PassportSubmissionPreview.jsx # Passport Submission Token
│   ├── ClientGuardianPreview.jsx     # Client & Guardian Application Dossier
│   ├── ExperienceCertificatePreview.jsx # Work Experience Certificate
│   ├── CharacterCertificatePreview.jsx  # Character & Police Clearance Certificate
│   └── MarriageCertificatePreview.jsx   # Marriage & Relationship Certificate
└── README.md                         # This architecture guide & usage documentation
```

---

## 🔍 Root Cause of Web PDF Printing Bugs

### 1. The CSS Transform Scale Trapping Bug
In complex SPAs with Split-View or responsive scaling (e.g. `<div className="scale-[0.88] origin-top">` inside a `grid-cols-2` column), the CSS specification dictates that any element with `transform` creates a **new containing block**.
- This traps `position: fixed` and `position: absolute` inside the 50% scaled container.
- When `window.print()` is executed, the printed document is shrunken to ~50% page width with a huge empty right margin, and bottom footers are truncated.

### 2. DOM Pollution & Sidebar Offsets
- `window.print()` prints the entire active React DOM tree.
- Any parent layout margins (`pl-64`, `margin-left: 16rem`), header bars, or fixed sidebars displace the printed paper away from coordinate `(0, 0)`.

### 3. Floating UI Bleed-Through
- Floating widgets (like `StudioFloatingViewSwitcher`) can bleed through to the printed output if they lack explicit `.no-print` classes on their root container.

---

## 🚀 The Permanent Solution: Isolated Iframe Engine

Instead of executing `window.print()` on the complex React DOM:
1. `printDocument({ elementId: '...' })` locates the target printable canvas.
2. It deep-clones the canvas into a dynamically created, hidden `<iframe>`.
3. It copies all active stylesheets (Tailwind, typography, inline styles) into the iframe `<head>`.
4. It injects strict `@page { size: A4 portrait; margin: 0 !important; }` and container resets (`transform: none !important; width: 210mm !important;`).
5. It sets `document.title` to the formatted backend filename (e.g. `JVF-2608001_Job_Verification_Md_Rafiqul_Islam.pdf`).
6. It waits for `document.fonts.ready` and all image assets to load.
7. It triggers `iframe.contentWindow.print()` and cleans up the iframe afterwards.

---

## 💻 How to Use `printDocument` in Any Component

### Basic Usage:
```javascript
import { printDocument } from './core/printEngine';

// In your React component / handler:
const handlePrint = () => {
  printDocument({
    docId: data.verificationId,           // Unique backend ID
    docType: 'Job_Verification',         // Document type name
    clientName: data.clientInfo?.clientName, // Client/recipient name
    elementId: 'job-verification-canvas', // ID of target DOM canvas
  });
};
```

### Automatic Discovery:
If `elementId` is not explicitly passed, `printDocument` automatically scans for any active canvas ID:
- `#job-verification-canvas`
- `#printable-invoice-canvas`
- `#printable-receipt-canvas`
- `#salary-slip-canvas`
- `#employment-agreement-canvas`
- `#cash-voucher-canvas`
- `#printable-indian-visa-canvas`
- `#printable-passport-canvas`
- `.printable-a4-paper`

---

## 📐 Standard A4 Canvas Dimensions

For strict 1-page A4 precision, printable previews should use the following layout:

```jsx
<div
  id="your-document-canvas"
  className="printable-a4-paper w-[210mm] max-w-full min-h-[296mm] bg-white text-slate-900 px-6 py-5 flex flex-col justify-between font-sans shadow-xl border border-slate-300 relative box-border print:shadow-none print:border-0 print:m-0 print:p-0"
  style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', Arial, sans-serif" }}
>
  {/* TOP CONTENT (Header, Biller Info, Form Sections) */}
  <div className="w-full">
    ...
  </div>

  {/* BOTTOM PINNED CONTENT (Signatures, Seals, Footer Metadata) */}
  <div className="w-full pt-1">
    <div className="border-t-2 border-slate-900 pt-2">
      ...
    </div>
  </div>
</div>
```

---

© 2026 Monsur Ali Travels ERP. All rights reserved.
