'use strict';

const express = require('express');
const router = express.Router();

const {   
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

} = require('../controllers/analytics.controller');


// USER ANALYTICS
// GET    /                          → all user analytics
// GET    /user_analytics/:userId → get by userId
// POST   /user_analytics/:userId → create
// PUT    /user_analytics/:userId → update
// DELETE /user_analytics/:userId → delete
// ================================================================
router.get('/', getAllUserAnalytics);
 
router.get('/user_analytics/:userId',    getUserAnalytics);
// router.post('/user_analytics/:userId',   createUserAnalytics);
// router.put('/user_analytics/:userId',    updateUserAnalytics);
router.put('/user_analytics',    updateUserAnalytics);

// router.delete('/user_analytics/:userId', deleteUserAnalytics);
 
// ================================================================
// ANOMALY LOGS
// GET    /anomaly_logs/:userId           → all logs for account
// GET    /anomaly_logs/:userId/unread    → unread logs
// GET    /anomaly_logs/:userId/unread/count → count unread
// GET    /anomaly_logs/detail/:logId        → get single log by _id
// POST   /anomaly_logs/:userId           → create
// PUT    /anomaly_logs/detail/:logId        → update
// PATCH  /anomaly_logs/:userId/read_all  → mark all read
// PATCH  /anomaly_logs/detail/:logId/dismiss → dismiss single
// DELETE /anomaly_logs/detail/:logId        → delete single
// DELETE /anomaly_logs/:userId           → delete all for account
// ================================================================
router.get('/anomaly_logs/:userId/unread/count', countUnreadAnomalyLogs);
router.get('/anomaly_logs/:userId/unread',       getUnreadAnomalyLogs);
router.get('/anomaly_logs/:userId',              getAnomalyLogs);
router.get('/anomaly_logs/detail/:logId',           getAnomalyLogById);
 
// router.post('/anomaly_logs/:userId', createAnomalyLog);
 
// router.put('/anomaly_logs/detail/:logId', updateAnomalyLog);
 
// router.patch('/anomaly_logs/:userId/read_all',    markAllAnomalyLogsRead);
// router.patch('/anomaly_logs/detail/:logId/dismiss',  dismissAnomalyLog);
 
// router.delete('/anomaly_logs/detail/:logId', deleteAnomalyLog);
// router.delete('/anomaly_logs/:userId',    deleteAllAnomalyLogs);
 
// ================================================================
// CATEGORY SUMMARY
// GET    /category_summary/:userId              → all for account
// GET    /category_summary/:userId/by_month     → ?year=&month=
// GET    /category_summary/:userId/over_budget  → over budget list
// GET    /category_summary/detail/:id              → single by _id
// POST   /category_summary/:userId              → create
// PUT    /category_summary/:userId/upsert       → upsert by (account,category,year,month)
// PUT    /category_summary/detail/:id              → update by _id
// DELETE /category_summary/detail/:id              → delete single
// DELETE /category_summary/:userId              → delete all for account
// ================================================================
router.get('/category_summary/:userId/by_month',    getCategorySummaryByMonth);
router.get('/category_summary/:userId/over_budget', getOverBudgetCategories);
router.get('/category_summary/:userId',             getCategorySummary);
router.get('/category_summary/detail/:id',             getCategorySummaryById);
 
// router.post('/category_summary/:userId', createCategorySummary);
 
router.put('/category_summary/:userId/upsert', upsertCategorySummary);
// router.put('/category_summary/detail/:id',        updateCategorySummary);
 
// router.delete('/category_summary/detail/:id', deleteCategorySummary);
// router.delete('/category_summary/:userId', deleteAllCategorySummary);
 
// ================================================================
// DASHBOARD CACHE
// GET    /dashboard_cache/:userId → get cache (null if expired)
// PUT    /dashboard_cache/:userId → upsert cache
// DELETE /dashboard_cache/:userId → invalidate cache
// ================================================================
router.get('/dashboard_cache/account/:accountId',    getDashboardCachebyAccount);
router.get('/dashboard_cache/:userId',    getDashboardCache);

router.put('/dashboard_cache/:userId',    upsertDashboardCache);
// router.delete('/dashboard_cache/:userId', invalidateDashboardCache);
 
// ================================================================
// MONTHLY REPORT
// GET    /monthly_reports/:userId           → all reports
// GET    /monthly_reports/:userId/by_month  → ?year=&month=
// GET    /monthly_reports/:userId/recent    → ?limit=
// GET    /monthly_reports/detail/:id           → single by _id
// POST   /monthly_reports/:userId           → create
// PUT    /monthly_reports/:userId/upsert    → upsert by (account,year,month)
// PUT    /monthly_reports/detail/:id           → update by _id
// DELETE /monthly_reports/detail/:id           → delete single
// DELETE /monthly_reports/:userId           → delete all for account
// ================================================================
router.get('/monthly_reports/:userId/by_month', getMonthlyReportByMonth);
router.get('/monthly_reports/:userId/recent',   getRecentMonthlyReports); //lấy báo cáo theo những tháng trước   
router.get('/monthly_reports/:userId',          getMonthlyReport);
router.get('/monthly_reports/detail/:id',          getMonthlyReportById);
 
// router.post('/monthly_reports/:userId', createMonthlyReport);
 
router.put('/monthly_reports/:userId/upsert', upsertMonthlyReport);
// router.put('/monthly_reports/detail/:id',        updateMonthlyReport);
 
// router.delete('/monthly_reports/detail/:id', deleteMonthlyReport);
// router.delete('/monthly_reports/:userId', deleteAllMonthlyReports);
 
// ================================================================
// SPENDING TREND
// GET    /spending_trends/:userId                        → all for account
// GET    /spending_trends/:userId/category/:categoryId  → by (account, category)
// GET    /spending_trends/detail/:id                       → single by _id
// POST   /spending_trends/:userId                       → create
// PUT    /spending_trends/:userId/upsert                → upsert by (account, category)
// PUT    /spending_trends/detail/:id                       → update by _id
// DELETE /spending_trends/detail/:id                       → delete single
// DELETE /spending_trends/:userId                       → delete all for account
// ================================================================
router.get('/spending_trends/:userId',                       getSpendingTrend);
router.get('/spending_trends/:userId/category/:categoryId',  getSpendingTrendByCategory);
router.get('/spending_trends/detail/:id',                       getSpendingTrendById);
 
// router.post('/spending_trends/:userId', createSpendingTrend);
 
// router.put('/spending_trends/:userId/upsert', upsertSpendingTrend);
// router.put('/spending_trends/detail/:id',        updateSpendingTrend);
 
// router.delete('/spending_trends/detail/:id', deleteSpendingTrend);
// router.delete('/spending_trends/:userId', deleteAllSpendingTrends);
 
// ================================================================
// TRANSACTIONS
// GET    /transactions/:userId                      → list (with ?limit=&skip=)
// GET    /transactions/:userId/date_range           → ?from=&to=
// GET    /transactions/:userId/category/:categoryId → by category
// GET    /transactions/detail/:transId                 → single by trans_id
// POST   /transactions/:userId                      → create
// PUT    /transactions/detail/:transId                 → update
// DELETE /transactions/detail/:transId                 → delete
// ================================================================
router.get('/transactions/:userId/date_range',           getTransactionsByDateRange);
router.get('/transactions/:userId/category/:categoryId', getTransactionsByCategory);
router.get('/transactions/:userId',                      getTransactions);
router.get('/transactions/detail/:transId',                 getTransactionByTransId);
 
// router.post('/transactions/:userId', createTransaction);
 
// router.put('/transactions/detail/:transId', updateTransaction);
 
// router.delete('/transactions/detail/:transId', deleteTransaction);
 
module.exports = router;

// // GET /api/user-analytics/:userId
// router.get('/', getAllUserAnalytics);

// router.get('/anomaly_logs/:userId', getUserAnomalyLogs);
// router.get('/category_summary/:userId', getUserCategorySummary);
// router.get('/monthly_reports/:userId', getUserMonthlyReport);
// router.get('/dashboard_cache/:userId', getUserDashboardCache);
// router.get('/spending_trend/:userId', getUserSpendingTrend);
// router.get('/user_analytics/:userId', getUserAnalytics);

// router.post('/anomaly_logs/:userId', createAnomalyLog);
// router.post('/category_summary/:userId', createCategorySummary);
// router.post('/monthly_reports/:userId', createMonthlyReport);
// router.post('/dashboard_cache/:userId', createDashboardCache);
// router.post('/spending_trend/:userId', createSpendingTrend);
// router.post('/user_analytics/:userId', createUserAnalytics);


// module.exports = router;