import { Router } from 'express';
import authRouter from './AuthRoute.js';
import userRouter from './UserRoute.js';
import customerRouter from './CustomerRoute.js';
import receiptRouter from './MoneyReceiptRoute.js';
import caseRouter from './CaseFileRoute.js';
import visaRouter from './IndianVisaRoute.js';
import passportRouter from './PassportRoute.js';
import guardianAppRouter from './CustomerGuardianRoute.js';
import invoiceRouter from './InvoiceRoute.js';
import agreementRouter from './AgreementRoute.js';
import payrollRouter from './PayrollRoute.js';
import uploadRouter from './UploadRoute.js';
import dashboardRouter from './DashboardRoute.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    version: '2.0.0',
    timestamp: new Date(),
  });
});

// Mount module routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/receipts', receiptRouter);
apiRouter.use('/money-receipts', receiptRouter);
apiRouter.use('/cases', caseRouter);
apiRouter.use('/indian-visa', visaRouter);
apiRouter.use('/passports', passportRouter);
apiRouter.use('/guardian-applications', guardianAppRouter);
apiRouter.use('/invoices', invoiceRouter);
apiRouter.use('/agreements', agreementRouter);
apiRouter.use('/payroll', payrollRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/dashboard', dashboardRouter);

export default apiRouter;
