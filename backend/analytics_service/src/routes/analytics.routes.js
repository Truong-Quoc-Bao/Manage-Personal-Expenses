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
// GET    /user_analytics/:accountId → get by accountId
// POST   /user_analytics/:accountId → create
// PUT    /user_analytics/:accountId → update
// DELETE /user_analytics/:accountId → delete
// ================================================================
router.get('/', getAllUserAnalytics);
 
router.get('/user_analytics/:accountId',    getUserAnalytics);
router.post('/user_analytics/:accountId',   createUserAnalytics);
router.put('/user_analytics/:accountId',    updateUserAnalytics);
router.delete('/user_analytics/:accountId', deleteUserAnalytics);
 
// ================================================================
// ANOMALY LOGS
// GET    /anomaly_logs/:accountId           → all logs for account
// GET    /anomaly_logs/:accountId/unread    → unread logs
// GET    /anomaly_logs/:accountId/unread/count → count unread
// GET    /anomaly_logs/detail/:logId        → get single log by _id
// POST   /anomaly_logs/:accountId           → create
// PUT    /anomaly_logs/detail/:logId        → update
// PATCH  /anomaly_logs/:accountId/read_all  → mark all read
// PATCH  /anomaly_logs/detail/:logId/dismiss → dismiss single
// DELETE /anomaly_logs/detail/:logId        → delete single
// DELETE /anomaly_logs/:accountId           → delete all for account
// ================================================================
router.get('/anomaly_logs/:accountId',              getAnomalyLogs);
router.get('/anomaly_logs/:accountId/unread',       getUnreadAnomalyLogs);
router.get('/anomaly_logs/:accountId/unread/count', countUnreadAnomalyLogs);
router.get('/anomaly_logs/detail/:logId',           getAnomalyLogById);
 
router.post('/anomaly_logs/:accountId', createAnomalyLog);
 
router.put('/anomaly_logs/detail/:logId', updateAnomalyLog);
 
router.patch('/anomaly_logs/:accountId/read_all',    markAllAnomalyLogsRead);
router.patch('/anomaly_logs/detail/:logId/dismiss',  dismissAnomalyLog);
 
router.delete('/anomaly_logs/detail/:logId', deleteAnomalyLog);
router.delete('/anomaly_logs/:accountId',    deleteAllAnomalyLogs);
 
// ================================================================
// CATEGORY SUMMARY
// GET    /category_summary/:accountId              → all for account
// GET    /category_summary/:accountId/by_month     → ?year=&month=
// GET    /category_summary/:accountId/over_budget  → over budget list
// GET    /category_summary/detail/:id              → single by _id
// POST   /category_summary/:accountId              → create
// PUT    /category_summary/:accountId/upsert       → upsert by (account,category,year,month)
// PUT    /category_summary/detail/:id              → update by _id
// DELETE /category_summary/detail/:id              → delete single
// DELETE /category_summary/:accountId              → delete all for account
// ================================================================
router.get('/category_summary/:accountId',             getCategorySummary);
router.get('/category_summary/:accountId/by_month',    getCategorySummaryByMonth);
router.get('/category_summary/:accountId/over_budget', getOverBudgetCategories);
router.get('/category_summary/detail/:id',             getCategorySummaryById);
 
router.post('/category_summary/:accountId', createCategorySummary);
 
router.put('/category_summary/:accountId/upsert', upsertCategorySummary);
router.put('/category_summary/detail/:id',        updateCategorySummary);
 
router.delete('/category_summary/detail/:id', deleteCategorySummary);
router.delete('/category_summary/:accountId', deleteAllCategorySummary);
 
// ================================================================
// DASHBOARD CACHE
// GET    /dashboard_cache/:accountId → get cache (null if expired)
// PUT    /dashboard_cache/:accountId → upsert cache
// DELETE /dashboard_cache/:accountId → invalidate cache
// ================================================================
router.get('/dashboard_cache/:accountId',    getDashboardCache);
router.put('/dashboard_cache/:accountId',    upsertDashboardCache);
router.delete('/dashboard_cache/:accountId', invalidateDashboardCache);
 
// ================================================================
// MONTHLY REPORT
// GET    /monthly_reports/:accountId           → all reports
// GET    /monthly_reports/:accountId/by_month  → ?year=&month=
// GET    /monthly_reports/:accountId/recent    → ?limit=
// GET    /monthly_reports/detail/:id           → single by _id
// POST   /monthly_reports/:accountId           → create
// PUT    /monthly_reports/:accountId/upsert    → upsert by (account,year,month)
// PUT    /monthly_reports/detail/:id           → update by _id
// DELETE /monthly_reports/detail/:id           → delete single
// DELETE /monthly_reports/:accountId           → delete all for account
// ================================================================
router.get('/monthly_reports/:accountId',          getMonthlyReport);
router.get('/monthly_reports/:accountId/by_month', getMonthlyReportByMonth);
router.get('/monthly_reports/:accountId/recent',   getRecentMonthlyReports);
router.get('/monthly_reports/detail/:id',          getMonthlyReportById);
 
router.post('/monthly_reports/:accountId', createMonthlyReport);
 
router.put('/monthly_reports/:accountId/upsert', upsertMonthlyReport);
router.put('/monthly_reports/detail/:id',        updateMonthlyReport);
 
router.delete('/monthly_reports/detail/:id', deleteMonthlyReport);
router.delete('/monthly_reports/:accountId', deleteAllMonthlyReports);
 
// ================================================================
// SPENDING TREND
// GET    /spending_trends/:accountId                        → all for account
// GET    /spending_trends/:accountId/category/:categoryId  → by (account, category)
// GET    /spending_trends/detail/:id                       → single by _id
// POST   /spending_trends/:accountId                       → create
// PUT    /spending_trends/:accountId/upsert                → upsert by (account, category)
// PUT    /spending_trends/detail/:id                       → update by _id
// DELETE /spending_trends/detail/:id                       → delete single
// DELETE /spending_trends/:accountId                       → delete all for account
// ================================================================
router.get('/spending_trends/:accountId',                       getSpendingTrend);
router.get('/spending_trends/:accountId/category/:categoryId',  getSpendingTrendByCategory);
router.get('/spending_trends/detail/:id',                       getSpendingTrendById);
 
router.post('/spending_trends/:accountId', createSpendingTrend);
 
router.put('/spending_trends/:accountId/upsert', upsertSpendingTrend);
router.put('/spending_trends/detail/:id',        updateSpendingTrend);
 
router.delete('/spending_trends/detail/:id', deleteSpendingTrend);
router.delete('/spending_trends/:accountId', deleteAllSpendingTrends);
 
// ================================================================
// TRANSACTIONS
// GET    /transactions/:accountId                      → list (with ?limit=&skip=)
// GET    /transactions/:accountId/date_range           → ?from=&to=
// GET    /transactions/:accountId/category/:categoryId → by category
// GET    /transactions/detail/:transId                 → single by trans_id
// POST   /transactions/:accountId                      → create
// PUT    /transactions/detail/:transId                 → update
// DELETE /transactions/detail/:transId                 → delete
// ================================================================
router.get('/transactions/:accountId',                      getTransactions);
router.get('/transactions/:accountId/date_range',           getTransactionsByDateRange);
router.get('/transactions/:accountId/category/:categoryId', getTransactionsByCategory);
router.get('/transactions/detail/:transId',                 getTransactionByTransId);
 
router.post('/transactions/:accountId', createTransaction);
 
router.put('/transactions/detail/:transId', updateTransaction);
 
router.delete('/transactions/detail/:transId', deleteTransaction);
 
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