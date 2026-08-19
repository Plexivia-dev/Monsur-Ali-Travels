import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const dashboardRouter = Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get('/overview', DashboardController.getOverview);

export default dashboardRouter;
