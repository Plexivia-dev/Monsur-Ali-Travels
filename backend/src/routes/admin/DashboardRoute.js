import express from 'express';
import { dailyOrders, getKpiStats, getOrderStatusDistribution, getErpOverviewStats } from '../../controllers/admin/DashboardController.js';

const router = express.Router();

router.get('/overview', getErpOverviewStats);
router.get('/orders/daily', dailyOrders);
router.get('/orders/status-distribution', getOrderStatusDistribution);
router.get('/kpi', getKpiStats);

export default router;
