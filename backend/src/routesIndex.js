import { Router } from "express";

// Authentication & Core ERP User Routes
import authRouter from "./routes/AuthRoute.js";
import usersRouter from "./routes/UsersRoute.js";
import candidateRouter from "./routes/CandidateRoute.js";

// Document Studio & Data List Routes
import agreementRouter from "./routes/AgreementRoute.js";
import indianVisaRouter from "./routes/IndianVisaRoute.js";
import passportRouter from "./routes/PassportSubmissionRoute.js";
import payrollRouter from "./routes/PayrollRoute.js";
import invoiceRouter from "./routes/InvoiceRoute.js";
import docsRouter from "./routes/DocsRoute.js";

// Utilities & System
import emailRouter from "./routes/EmailRoute.js";
import dashboardRouter from "./routes/DashboardRoute.js";
import systemRouter from "./routes/SystemRoute.js";

const coreRouter = Router();

// Authentication & Users
coreRouter.use("/auth", authRouter);
coreRouter.use("/users", usersRouter);
coreRouter.use("/candidates", candidateRouter);

// Document Records & Data Lists (Direct top-level endpoints)
coreRouter.use("/agreements", agreementRouter);
coreRouter.use("/indian-visas", indianVisaRouter);
coreRouter.use("/passports", passportRouter);
coreRouter.use("/payrolls", payrollRouter);
coreRouter.use("/invoices", invoiceRouter);

// Backward-compatible Document Studio routes (/docs/*)
coreRouter.use("/docs", docsRouter);

// ERP Dashboard & System
coreRouter.use("/dashboard", dashboardRouter);
coreRouter.use("/sendEmail", emailRouter);
coreRouter.use("/system", systemRouter);

export default coreRouter;
