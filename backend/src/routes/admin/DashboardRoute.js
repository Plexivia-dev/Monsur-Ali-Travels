import express from 'express';
import {
  dailyOrders,
  getKpiStats,
  getOrderStatusDistribution,
  getErpOverviewStats,
  getAccountingStats,
  getDashboardChartsData,
} from '../../controllers/admin/DashboardController.js';

const router = express.Router();

router.get('/overview', getErpOverviewStats);
router.get('/accounting', getAccountingStats);
router.get('/orders/daily', dailyOrders);
router.get('/charts', getDashboardChartsData);
router.get('/orders/status-distribution', getOrderStatusDistribution);
router.get('/kpi', getKpiStats);

export default router;
