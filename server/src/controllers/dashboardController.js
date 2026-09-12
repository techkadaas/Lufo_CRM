import { Store } from '../services/storeService.js';
import { getDBStatus } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { timeRange, startDate, endDate } = req.query;
    const analytics = await Store.getDashboardAnalytics({ timeRange, startDate, endDate });
    res.json({
      success: true,
      data: {
        ...analytics,
        dbConnected: getDBStatus(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
