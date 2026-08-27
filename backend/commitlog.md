# Commit Log / Change Log

## [2026-08-27]
- **Dashboard Version**: `v0.4.2`

### 1. Client Dashboard Overview, Task Management & Real-Time Notifications (NC01 - NC07)
- **NC07 - Permanent Factory & Mock Asset Elimination**:
  - Permanently deleted all `components/factory/`, `pages/Factory.jsx`, `components/admin/`, `components/agency/`, `Navbar.jsx`, and `client/api/` mock simulators.
  - Removed factory keys from all translation locale files (`en.json`, `bn.json`).
  - Purged factory references from `TopBreadcrumbBar.jsx` and `useAppStore.js`.
- **NC06 - Full Mock Data & Legacy Portal Purge**:
  - Eliminated mock notification lists (`usePortalStore.js`).
  - Purged mock members, payments, and users fallbacks from client query hooks.
  - Removed legacy unused portal routes (`Factory`, `Agency`, `Admin`) from client application bundle.
- **NC05 - Purge Dummy Content & Clean English UI**:
  - Removed `SAMPLE_TASKS` fallback; strictly bound overview to `/api/v1/client/tasks/my-tasks`.
  - Removed redundant "Start" action button (tasks only require "Mark Done" / "Details").
  - Standardized overview and task modals to clean, consistent English.
- **NC04 - WebSocket Live Notification Fix & Popover**:
  - Integrated `useSocketNotification.js` into Client Dashboard Header.
  - Added interactive real-time notification popover dropdown with live toast banners.
- **NC03 - Pure Monochrome Grayscale System**:
  - Eliminated tinted/muddy grays in favor of pure shades of black (`#000000`, `#09090b`, `#18181b`, `#fcfcfc`, `#ffffff`).
  - High-contrast badge tokens for Light and Dark modes.
- **NC02 - Overview Landing Page & Task Management**:
  - Implemented `/dashboard/overview` as the default landing route with interactive KPI metrics.
  - Created high-density `TasksOverviewList.jsx` and `TaskDetailModal.jsx` for assigned staff tasks.
- **NC01 - Menu Streamlining**:
  - Removed obsolete `Agency` group (`Clients & Billing` -> `Client Files`, `All Clients`) from `clientSidebarMenu.json`.

### 1. Dynamic QR Code API & Agency Branding Engine (MB22 & MD99)
- **Backend Dynamic QR Generation API**:
  - Implemented `/api/v1/qr` supporting dynamic payload generation in `png`, `svg`, `dataurl`, and `json` formats.
  - Implemented `/api/v1/qr/agency` serving fast cached agency identity from `information.json` with vCard and human-readable text modes.
  - Implemented `/api/v1/qr/invoice/:id` providing instant invoice verification barcodes.
  - Created reusable `qrHelper.js` with brand color palette (`#0f172a` Slate Navy) and memory caching.
- **Invoice QR Code Integration**:
  - Updated `invoice.model.js` with `qrCode` persistent Data URL storage.
  - Integrated automatic QR code generation into `InvoiceController.js` upon creation, update, and retrieval.
- **Dashboard Invoice Canvas & Print Ready QR Stamp**:
  - Integrated official QR Code verification stamp between Customer Signature and Official Seal on `InvoicePreview.jsx`.
  - Updated `InvoiceBuilder.jsx` to preserve QR payload on database saves.

## [2026-08-06]

### 1. Dashboard Product API & Metadata Fixes
- **Dashboard API Endpoint Alignment**:
  - Updated `dashboard/hooks/core/use-products.ts` so product search/filter queries use `POST /api/v1/products/search` instead of `POST /api/v1/products` (which was triggering product creation).
  - Resolved backend metadata key mapping for `total_products`, `total_pages`, and `current_page` to ensure pagination and total item counts calculate properly.

## [2026-08-05]

### 1. Products API & Filters Refactoring
- **API Endpoint Conversion**:
  - Converted the search/filter API from `POST /search` to `GET /api/v1/products` to adhere to REST best practices.
  - Implemented standard URL Query parameter parsing for filters (category, brand, min_price, max_price, sort).
- **Backend Refactoring**:
  - Updated `ProductsController.js` and `productUtils.js` to parse URL params efficiently.
  - Standardized the API response format to `{ success, message, meta, data }`.
  - Fixed a query leak where `min_price` and `max_price` were directly being passed to MongoDB.
- **Frontend Refactoring**:
  - Migrated `api.js` `fetchProducts` to exclusively use `GET` and properly map `res.meta.total_products`.
  - Fixed an infinite re-render loop in `Shop.jsx` causing the `PriceRangeSlider` to lock up or continuously fetch by wrapping `handlePriceRangeChange` in `useCallback` with stable URL parameter mapping.
- **Database Optimization**:
  - Added new indexes for `categories` and `createdAt` in `product.model.js` to improve query performance.

## [2026-07-26]

### 1. Order API Updates
- **Payload & Validation Adjustment**:
  - Updated order helper validation ([orderHelper.js](file:///e:/AAAAAAA/backend/src/helper/orderHelper.js)) and schema ([order.model.js](file:///e:/AAAAAAA/backend/src/models/order.model.js)) so `fullName`, `phone`, `email`, `address`, and `district` are strictly required while `city`, `thana`, and `zip` are optional (defaults to empty string).

### 2. Product Image WebP Migration Script
- **Script Creation & Execution**:
  - Created [`scripts/migrate-images-to-webp.js`](file:///e:/AAAAAAA/backend/scripts/migrate-images-to-webp.js) to automate scanning products, matching image source files from `uploads/`, converting them to resized `.webp` format, and updating DB paths to clean `/uploads/...` URLs.
  - Implemented fuzzy and timestamp-stripping matching logic to map DB filenames (e.g. `*-1784973480266.webp`) to actual disk images.

### 3. Upload Middleware Refactoring
- **Dynamic Date-Based Pathing**:
  - Updated [`src/middlewares/upload.middleware.js`](file:///e:/AAAAAAA/backend/src/middlewares/upload.middleware.js) to use dynamic date folder storage (`uploads/products/YYMMDD`).
  - Commented out legacy batch storage logic.
  - Fixed duplicate `upload` export and missing `multerUpload` instance errors.

### 4. Git Ignore Configuration
- Updated [`.gitignore`](file:///e:/AAAAAAA/backend/.gitignore) to exclude local uploaded files (`uploads*`).
