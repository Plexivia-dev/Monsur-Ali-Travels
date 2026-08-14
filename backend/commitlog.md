# Commit Log / Change Log

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
