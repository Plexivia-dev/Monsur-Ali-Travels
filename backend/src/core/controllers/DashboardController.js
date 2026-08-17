import { OrderModel } from '../models/order.model.js';

export const dailyOrders = async (req, res, next) => {
  try {
    const days = Math.max(1, parseInt(req.query.days || '30', 10));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(today);
    from.setDate(from.getDate() - (days - 1));

    const pipeline = [
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ];

    const agg = await OrderModel.aggregate(pipeline);
    const countsByDate = Object.fromEntries(agg.map((r) => [r._id, r.count]));

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: countsByDate[key] || 0 });
    }

    return res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export default { dailyOrders };
