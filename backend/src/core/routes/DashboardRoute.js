import express from 'express';
import { dailyOrders } from '../controllers/DashboardController.js';

const router = express.Router();

router.get('/orders/daily', dailyOrders);

export default router;
