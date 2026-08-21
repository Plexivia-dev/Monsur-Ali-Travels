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

// --- CLIENT (STAFF) ROUTES ---
import candidateRouter from "./routes/client/CandidateRoute.js";
import clientRouterInstance from "./routes/client/ClientRoute.js";
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

// ==========================================
// 1. SHARED ROUTES (Mounted directly at /api/v1/)
// ==========================================
coreRouter.use("/auth", authRouter);
coreRouter.use("/qr", qrRouter);
coreRouter.use("/qrcode", qrRouter);
coreRouter.use("/upload", uploadRouter);
coreRouter.use("/notifications", notificationRouter);
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

coreRouter.use("/admin", adminRouter);

// ==========================================
// 3. CLIENT/STAFF SCOPE (Mounted at /api/v1/client/)
// ==========================================
const clientRouter = Router();
clientRouter.use("/cases", caseFileRouter);
clientRouter.use("/customers", clientRouterInstance);
clientRouter.use("/clients", clientRouterInstance);
clientRouter.use("/candidates", candidateRouter);
clientRouter.use("/agreements", agreementRouter);
clientRouter.use("/indian-visas", indianVisaRouter);
clientRouter.use("/passports", passportRouter);
clientRouter.use("/payrolls", payrollRouter);
clientRouter.use("/invoices", invoiceRouter);
clientRouter.use("/receipts", moneyReceiptRouter);
clientRouter.use("/money-receipts", moneyReceiptRouter);
clientRouter.use("/cash-vouchers", cashVoucherRouter);
clientRouter.use("/docs", docsRouter);
clientRouter.use("/sendEmail", emailRouter);

coreRouter.use("/client", clientRouter);

export default coreRouter;
