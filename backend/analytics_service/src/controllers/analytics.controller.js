'use strict';

const service = require('../services/analytics.service.js');

// ================================================================
// USER ANALYTICS
// ================================================================

function requireUserId(req, res) {
  const userId = req.headers['x-user-id'];
  if (userId == null || userId === "") {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return String(userId);
}

const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await service.getUserAnalytics(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllUserAnalytics = async (req, res) => {
  try {
    const data = await service.getAllUserAnalytics();

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    console.log('=== userId:', userId);
    console.log("=== data nhận được:", JSON.stringify(data, null, 2));

    if (data.total_income === undefined || typeof data.total_income !== 'number') {
      return res.status(400).json({ success: false, message: 'total_income is required and must be a number' });
    }
    if (data.total_expense === undefined || typeof data.total_expense !== 'number') {
      return res.status(400).json({ success: false, message: 'total_expense is required and must be a number' });
    }
    if (!data.current_month?.year || !data.current_month?.month) {
      return res.status(400).json({ success: false, message: 'current_month.year and current_month.month are required' });
    }

    const result = await service.createUserAnalytics(userId, data);
    return res.status(201).json({ success: true, message: 'User analytics created successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserAnalytics = async (req, res) => {
  try {
    const userId = "4f4b144d-e3f8-4e6b-9e32-408030a85698";
    const data = req.body;

    const result = await service.updateUserAnalytics(userId, data);
    return res.status(200).json({ success: true, message: 'User analytics updated successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await service.deleteUserAnalytics(userId);
    return res.status(200).json({ success: true, message: 'User analytics deleted successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ================================================================
// ANOMALY LOGS
// ================================================================

const getAnomalyLogs = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getAnomalyLogs(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAnomalyLogById = async (req, res) => {
  try {
    const { logId } = req.params;
    const data = await service.getAnomalyLogById(logId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getUnreadAnomalyLogs = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getUnreadAnomalyLogs(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const countUnreadAnomalyLogs = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const count = await service.countUnreadAnomalyLogs(userId);
    return res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createAnomalyLog = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = req.body;

    if (!data.type || !data.severity || !data.description) {
      return res.status(400).json({ success: false, message: 'type, severity, description are required' });
    }

    const result = await service.createAnomalyLog(userId, data);
    return res.status(201).json({ success: true, message: 'Anomaly log created successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateAnomalyLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const data = req.body;

    const result = await service.updateAnomalyLog(logId, data);
    return res.status(200).json({ success: true, message: 'Anomaly log updated successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const markAllAnomalyLogsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.markAllAnomalyLogsRead(userId);
    return res.status(200).json({ success: true, message: 'All anomaly logs marked as read', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const dismissAnomalyLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const result = await service.dismissAnomalyLog(logId);
    return res.status(200).json({ success: true, message: 'Anomaly log dismissed', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteAnomalyLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const result = await service.deleteAnomalyLog(logId);
    return res.status(200).json({ success: true, message: 'Anomaly log deleted successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteAllAnomalyLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.deleteAllAnomalyLogs(userId);
    return res.status(200).json({ success: true, message: 'All anomaly logs deleted', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// CATEGORY SUMMARY
// ================================================================

const getCategorySummary = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getCategorySummary(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCategorySummaryByMonth = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month query params are required' });
    }

    const data = await service.getCategorySummaryByMonth(userId, year, month);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCategorySummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await service.getCategorySummaryById(id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getOverBudgetCategories = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getOverBudgetCategories(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createCategorySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.category_id || !data.category_name || !data.year || !data.month) {
      return res.status(400).json({ success: false, message: 'category_id, category_name, year, month are required' });
    }

    const result = await service.createCategorySummary(userId, data);
    return res.status(201).json({ success: true, message: 'Category summary created successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const upsertCategorySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.category_id || !data.year || !data.month) {
      return res.status(400).json({ success: false, message: 'category_id, year, month are required' });
    }

    const result = await service.upsertCategorySummary(userId, data);
    return res.status(200).json({ success: true, message: 'Category summary upserted successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateCategorySummary = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await service.updateCategorySummary(id, data);
    return res.status(200).json({ success: true, message: 'Category summary updated successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteCategorySummary = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.deleteCategorySummary(id);
    return res.status(200).json({ success: true, message: 'Category summary deleted successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteAllCategorySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.deleteAllCategorySummary(userId);
    return res.status(200).json({ success: true, message: 'All category summaries deleted', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// DASHBOARD CACHE
// ================================================================

const getDashboardCache = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getDashboardCache(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDashboardCachebyAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const data = await service.getDashboardCachebyAccount(accountId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const upsertDashboardCache = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = req.body;

    if (!data || !data.account_id || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const result = await service.upsertDashboardCache(userId, data);
    return res.status(200).json({ success: true, message: 'Dashboard cache upserted successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const invalidateDashboardCache = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const result = await service.invalidateDashboardCache(userId);
    return res.status(200).json({ success: true, message: 'Dashboard cache invalidated', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// MONTHLY REPORT
// ================================================================

const getMonthlyReport = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const data = await service.getMonthlyReport(userId);

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getMonthlyReportByMonth = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month query params are required' });
    }

    const data = await service.getMonthlyReportByMonth(userId, year, month);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getRecentMonthlyReports = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const limit = Number(req.query.limit) || 6;
    const data = await service.getRecentMonthlyReports(userId, limit);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMonthlyReportById = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getMonthlyReportById(id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const createMonthlyReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.year || !data.month || !data.summary) {
      return res.status(400).json({ success: false, message: 'year, month, summary are required' });
    }

    const result = await service.createMonthlyReport(userId, data);
    return res.status(201).json({ success: true, message: 'Monthly report created successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const upsertMonthlyReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.year || !data.month) {
      return res.status(400).json({ success: false, message: 'year and month are required' });
    }

    const result = await service.upsertMonthlyReport(userId, data);
    return res.status(200).json({ success: true, message: 'Monthly report upserted successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateMonthlyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await service.updateMonthlyReport(id, data);
    return res.status(200).json({ success: true, message: 'Monthly report updated successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteMonthlyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.deleteMonthlyReport(id);
    return res.status(200).json({ success: true, message: 'Monthly report deleted successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteAllMonthlyReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.deleteAllMonthlyReports(userId);
    return res.status(200).json({ success: true, message: 'All monthly reports deleted', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// SPENDING TREND
// ================================================================

const getSpendingTrend = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const data = await service.getSpendingTrend(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSpendingTrendByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = requireUserId(req, res);
    if (!userId) return;

    const data = await service.getSpendingTrendByCategory(userId, categoryId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getSpendingTrendById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await service.getSpendingTrendById(id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const createSpendingTrend = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.category_id || !data.category_name || !data.monthly_data) {
      return res.status(400).json({ success: false, message: 'category_id, category_name, monthly_data are required' });
    }

    const result = await service.createSpendingTrend(userId, data);
    return res.status(201).json({ success: true, message: 'Spending trend created successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const upsertSpendingTrend = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.category_id || !data.category_name) {
      return res.status(400).json({ success: false, message: 'category_id and category_name are required' });
    }

    const result = await service.upsertSpendingTrend(userId, data);
    return res.status(200).json({ success: true, message: 'Spending trend upserted successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateSpendingTrend = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await service.updateSpendingTrend(id, data);
    return res.status(200).json({ success: true, message: 'Spending trend updated successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteSpendingTrend = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.deleteSpendingTrend(id);
    return res.status(200).json({ success: true, message: 'Spending trend deleted successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteAllSpendingTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.deleteAllSpendingTrends(userId);
    return res.status(200).json({ success: true, message: 'All spending trends deleted', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// TRANSACTION
// ================================================================

const getTransactions = async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const limit = Number(req.query.limit) || 20;
    const skip = Number(req.query.skip) || 0;
    const data = await service.getTransactions(userId, { limit, skip });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTransactionByTransId = async (req, res) => {
  try {
    const { transId } = req.params;
    const data = await service.getTransactionByTransId(transId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getTransactionsByDateRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'from and to query params are required' });
    }

    const data = await service.getTransactionsByDateRange(userId, from, to);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTransactionsByCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    const data = await service.getTransactionsByCategory(userId, categoryId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    if (!data.trans_id || data.amount === undefined || !data.transaction_type || !data.date) {
      return res.status(400).json({ success: false, message: 'trans_id, amount, transaction_type, date are required' });
    }

    const result = await service.createTransaction(userId, data);
    return res.status(201).json({ success: true, message: 'Transaction created successfully', data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { transId } = req.params;
    const data = req.body;

    const result = await service.updateTransaction(transId, data);
    return res.status(200).json({ success: true, message: 'Transaction updated successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { transId } = req.params;
    const result = await service.deleteTransaction(transId);
    return res.status(200).json({ success: true, message: 'Transaction deleted successfully', data: result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = {
  // User Analytics
  getUserAnalytics,
  getAllUserAnalytics,
  createUserAnalytics,
  updateUserAnalytics,
  deleteUserAnalytics,
  // Anomaly Logs
  getAnomalyLogs,
  getAnomalyLogById,
  getUnreadAnomalyLogs,
  countUnreadAnomalyLogs,
  createAnomalyLog,
  updateAnomalyLog,
  markAllAnomalyLogsRead,
  dismissAnomalyLog,
  deleteAnomalyLog,
  deleteAllAnomalyLogs,
  // Category Summary
  getCategorySummary,
  getCategorySummaryByMonth,
  getCategorySummaryById,
  getOverBudgetCategories,
  createCategorySummary,
  upsertCategorySummary,
  updateCategorySummary,
  deleteCategorySummary,
  deleteAllCategorySummary,
  // Dashboard Cache
  getDashboardCache,
  getDashboardCachebyAccount,
  upsertDashboardCache,
  invalidateDashboardCache,
  // Monthly Report
  getMonthlyReport,
  getMonthlyReportByMonth,
  getRecentMonthlyReports,
  getMonthlyReportById,
  createMonthlyReport,
  upsertMonthlyReport,
  updateMonthlyReport,
  deleteMonthlyReport,
  deleteAllMonthlyReports,
  // Spending Trend
  getSpendingTrend,
  getSpendingTrendByCategory,
  getSpendingTrendById,
  createSpendingTrend,
  upsertSpendingTrend,
  updateSpendingTrend,
  deleteSpendingTrend,
  deleteAllSpendingTrends,
  // Transaction
  getTransactions,
  getTransactionByTransId,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

// const service = require('../services/analytics.service.js');

// const getUserAnomalyLogs = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const data = await service.getUserAnomalyLogs(userId);

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// const getUserCategorySummary = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const data = await service.getUserCategorySummary(userId);

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// const getUserMonthlyReport = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const data = await service.getUserMonthlyReport(userId);

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// const getUserDashboardCache = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const data = await service.getUserDashboardCache(userId);

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// const getUserSpendingTrend = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const data = await service.getUserSpendingTrend(userId);

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// const getUserAnalytics = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const data = await service.getUserAnalytics(userId);

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// const getAllUserAnalytics = async (req, res) => {
//   try {
//     const data = await service.getAllUserAnalytics();

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     return res.status(404).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// // ====================== CREATE ======================

// // 1. Create User Analytics
// const createUserAnalytics = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const data = req.body;

//     // Validation cơ bản
//     if (data.total_income === undefined || typeof data.total_income !== 'number') {
//       return res.status(400).json({ success: false, message: 'total_income is required and must be number' });
//     }
//     if (data.total_expense === undefined || typeof data.total_expense !== 'number') {
//       return res.status(400).json({ success: false, message: 'total_expense is required and must be number  ' });
//     }
//     if (!data.current_month || !data.current_month.year || !data.current_month.month) {
//       return res.status(400).json({ success: false, message: 'current_month (year & month) is required' });
//     }


//     const result = await service.createUserAnalytics(userId, data);

//     return res.status(201).json({
//       success: true,
//       message: 'User analytics created successfully',
//       data: result
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 2. Create Anomaly Log
// const createAnomalyLog = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const data = req.body;

//     console.log('=== userId:', userId);
//     console.log("=== data nhận được:", JSON.stringify(data, null, 2));

//     if (!data.type || !data.severity || !data.description) {
//       return res.status(400).json({ success: false, message: 'type, severity, description are required' });
//     }

//     const result = await service.createAnomalyLog(userId, data);

//     return res.status(201).json({
//       success: true,
//       message: 'Anomaly log created successfully',
//       data: result
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 3. Create Category Summary
// const createCategorySummary = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const data = req.body;

//     // console.log('=== userId:', userId);
//     // console.log("=== data nhận được:", JSON.stringify(data, null, 2));

//     if (!data.category_id || !data.category_name || !data.year || !data.month) {
//       return res.status(400).json({ success: false, message: 'category_id, category_name, year, month are required' });
//     }

//     const result = await service.createCategorySummary(userId, data);

//     return res.status(201).json({
//       success: true,
//       message: 'Category summary created successfully',
//       data: result
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 4. Create Dashboard Cache
// const createDashboardCache = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const data = req.body;

//     if (!data.summary || !data.top_categories) {
//       return res.status(400).json({ success: false, message: 'summary and top_categories are required' });
//     }

//     const result = await service.createDashboardCache(userId, data);

//     return res.status(201).json({
//       success: true,
//       message: 'Dashboard cache created successfully',
//       data: result
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 5. Create Monthly Report
// const createMonthlyReport = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const data = req.body;

//     if (!data.year || !data.month || !data.summary) {
//       return res.status(400).json({ success: false, message: 'year, month, summary are required' });
//     }

//     const result = await service.createMonthlyReport(userId, data);

//     return res.status(201).json({
//       success: true,
//       message: 'Monthly report created successfully',
//       data: result
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 6. Create Spending Trend
// const createSpendingTrend = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const data = req.body;

//     if (!data.category_id || !data.category_name || !data.monthly_data) {
//       return res.status(400).json({ success: false, message: 'category_id, category_name, monthly_data are required' });
//     }

//     const result = await service.createSpendingTrend(userId, data);

//     return res.status(201).json({
//       success: true,
//       message: 'Spending trend created successfully',
//       data: result
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// module.exports = {
//   getUserAnomalyLogs,
//   getUserCategorySummary,
//   getUserMonthlyReport,
//   getUserDashboardCache,
//   getUserSpendingTrend,
//   getUserAnalytics,
//   getAllUserAnalytics,
//   createUserAnalytics,
//   createAnomalyLog,
//   createCategorySummary,
//   createDashboardCache,
//   createMonthlyReport,
//   createSpendingTrend


// };