import { SystemLogModel } from '../../models/systemLog.model.js';

/**
 * GET /api/v1/admin/system/logs
 * Retrieves paginated, filterable system audit logs.
 */
export const getSystemLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const { role, type, targetCollection, action, userDid, search, from, to } = req.query;

    const query = { isActive: { $ne: false } };

    // 1. Role Filter
    if (role && role !== 'all') {
      query['actionDetails.role'] = role;
    }

    // 2. Log Type Filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // 3. Target Collection Filter
    if (targetCollection && targetCollection !== 'all') {
      query.targetCollection = targetCollection;
    }

    // 4. Action Filter
    if (action && action !== 'all') {
      query.action = action;
    }

    // 5. Specific User DID Filter
    if (userDid) {
      query['actionDetails.did'] = userDid;
    }

    // 6. Date Range Filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // 7. Full Text / Regex Search Filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'actionDetails.name': searchRegex },
        { targetCollection: searchRegex },
        { type: searchRegex },
        { action: searchRegex },
        { did: searchRegex },
      ];
    }

    const [logs, totalCount] = await Promise.all([
      SystemLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SystemLogModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return res.json({
      status: 'success',
      data: logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/system/logs/stats
 * Provides aggregation summary metrics for dashboard activity charts.
 */
export const getSystemLogStats = async (req, res, next) => {
  try {
    const [byRole, byType, totalCount] = await Promise.all([
      SystemLogModel.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: '$actionDetails.role', count: { $sum: 1 } } },
      ]),
      SystemLogModel.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      SystemLogModel.countDocuments({ isActive: { $ne: false } }),
    ]);

    return res.json({
      status: 'success',
      data: {
        totalLogs: totalCount,
        byRole: Object.fromEntries(byRole.map((r) => [r._id || 'Unknown', r.count])),
        byType: Object.fromEntries(byType.map((t) => [t._id || 'Unknown', t.count])),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { getSystemLogs, getSystemLogStats };
