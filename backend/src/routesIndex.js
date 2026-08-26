import { Router } from "express";

// --- SHARED ROUTES ---
import authRouter from "./routes/shared/AuthRoute.js";
import qrRouter from "./routes/shared/QrRoute.js";
import uploadRouter from "./routes/shared/UploadRoute.js";
import notificationRouter from "./routes/shared/NotificationRoute.js";
// import developerRouter from "./routes/shared/DeveloperRoute.js";

// --- ADMIN ROUTES ---
import dashboardRouter from "./routes/admin/DashboardRoute.js";
import systemRouter from "./routes/admin/SystemRoute.js";
import usersRouter from "./routes/admin/UsersRoute.js";
import settingsRouter from "./routes/admin/SettingsRoute.js";
import storageMaintenanceRouter from "./routes/admin/StorageMaintenanceRoute.js";

// --- CLIENT (STAFF) ROUTES ---
import clientRoute from "./routes/client/ClientRoute.js";
import caseFileRouter from "./routes/client/CaseFileRoute.js";
import agreementRouter from "./routes/client/AgreementRoute.js";
import indianVisaRouter from "./routes/client/IndianVisaRoute.js";
import passportRouter from "./routes/client/PassportSubmissionRoute.js";
import payrollRouter from "./routes/client/PayrollRoute.js";
import invoiceRouter from "./routes/client/InvoiceRoute.js";
import moneyReceiptRouter from "./routes/client/MoneyReceiptRoute.js";
import cashVoucherRouter from "./routes/CashVoucherRoute.js";
import docsRouter from "./routes/client/DocsRoute.js";
import emailRouter from "./routes/client/EmailRoute.js";

// --- MIDDLEWARES ---
import { authenticateToken, authorizeRoles } from "./middlewares/auth.middleware.js";
import { auditLog } from "./middlewares/auditLog.js";

const coreRouter = Router();

import accountsRouter from "./routes/shared/AccountsRoute.js";
import adminCaseRouter from "./routes/admin/AdminCaseRoute.js";
import taskRouter from "./routes/client/TaskRoute.js";

// ==========================================
// 1. SHARED ROUTES (Mounted directly at /api/v1/)
// ==========================================
coreRouter.use("/auth", authRouter);
coreRouter.use("/qr", qrRouter);
coreRouter.use("/qrcode", qrRouter);
coreRouter.use("/upload", uploadRouter);
coreRouter.use("/uploads", uploadRouter);
coreRouter.use("/notifications", notificationRouter);
coreRouter.use("/accounts", authenticateToken, auditLog, accountsRouter);
// coreRouter.use("/developer", developerRouter);

// ==========================================
// 2. ADMIN SCOPE (Mounted at /api/v1/admin/)
// ==========================================
const adminRouter = Router();

// Secure admin routes
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRoles("Admin", "Owner", "Superadmin"));
adminRouter.use(auditLog);

adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/system", systemRouter);
adminRouter.use("/users", usersRouter);
adminRouter.use("/clients", clientRoute);
adminRouter.use("/cases", adminCaseRouter);
adminRouter.use("/tasks", taskRouter);
adminRouter.use("/settings", settingsRouter);
adminRouter.use("/storage", storageMaintenanceRouter);
adminRouter.use("/accounts", accountsRouter);
adminRouter.use("/agreements", agreementRouter);
adminRouter.use("/indian-visas", indianVisaRouter);
adminRouter.use("/passports", passportRouter);
adminRouter.use("/payrolls", payrollRouter);
adminRouter.use("/invoices", invoiceRouter);
adminRouter.use("/receipts", moneyReceiptRouter);
adminRouter.use("/money-receipts", moneyReceiptRouter);
adminRouter.use("/cash-vouchers", cashVoucherRouter);
adminRouter.use("/docs", docsRouter);

coreRouter.use("/admin", adminRouter);

// ==========================================
// 3. CLIENT/STAFF SCOPE (Mounted at /api/v1/client/)
// ==========================================
const clientScopeRouter = Router();
clientScopeRouter.use(authenticateToken);
clientScopeRouter.use(auditLog);
clientScopeRouter.use("/accounts", accountsRouter);
clientScopeRouter.use("/tasks", taskRouter);
clientScopeRouter.use("/cases", caseFileRouter);
clientScopeRouter.use("/clients", clientRoute);
clientScopeRouter.use("/agreements", agreementRouter);
clientScopeRouter.use("/indian-visas", indianVisaRouter);
clientScopeRouter.use("/passports", passportRouter);
clientScopeRouter.use("/payrolls", payrollRouter);
clientScopeRouter.use("/invoices", invoiceRouter);
clientScopeRouter.use("/receipts", moneyReceiptRouter);
clientScopeRouter.use("/money-receipts", moneyReceiptRouter);
clientScopeRouter.use("/cash-vouchers", cashVoucherRouter);
clientScopeRouter.use("/docs", docsRouter);
clientScopeRouter.use("/sendEmail", emailRouter);

coreRouter.use("/client", clientScopeRouter);

export default coreRouter;
