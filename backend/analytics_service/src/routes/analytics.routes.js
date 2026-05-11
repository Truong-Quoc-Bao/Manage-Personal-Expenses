'use strict';

const express = require('express');
const router = express.Router();

const {   
   getUserAnalytics,
  getAllUserAnalytics,
  createUserAnalytics,
  updateUserAnalytics,
  deleteUserAnalytics,
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
   getCategorySummary,
  getCategorySummaryByMonth,
  getCategorySummaryById,
  getOverBudgetCategories,
  createCategorySummary,
  upsertCategorySummary,
  updateCategorySummary,
  deleteCategorySummary,
  deleteAllCategorySummary,
   getDashboardCache,
  getDashboardCachebyAccount,
  upsertDashboardCache,
  invalidateDashboardCache,
   getMonthlyReport,
  getMonthlyReportByMonth,
  getRecentMonthlyReports,
  getMonthlyReportById,
  createMonthlyReport,
  upsertMonthlyReport,
  updateMonthlyReport,
  deleteMonthlyReport,
  deleteAllMonthlyReports,
   getSpendingTrend,
  getSpendingTrendByCategory,
  getSpendingTrendById,
  createSpendingTrend,
  upsertSpendingTrend,
  updateSpendingTrend,
  deleteSpendingTrend,
  deleteAllSpendingTrends,
   getTransactions,
  getTransactionByTransId,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,

} = require('../controllers/analytics.controller');


// ================================================================
router.get('/', getAllUserAnalytics);
 
router.get('/user_analytics/:userId',    getUserAnalytics);
router.put('/user_analytics',    updateUserAnalytics);


// ================================================================
router.get('/anomaly_logs/:userId/unread/count', countUnreadAnomalyLogs);
router.get('/anomaly_logs/:userId/unread',       getUnreadAnomalyLogs);
router.get('/anomaly_logs/:userId',              getAnomalyLogs);
router.get('/anomaly_logs/detail/:logId',           getAnomalyLogById);
 

// ================================================================
router.get('/category_summary/:userId/by_month',    getCategorySummaryByMonth);
router.get('/category_summary/:userId/over_budget', getOverBudgetCategories);
router.get('/category_summary/:userId',             getCategorySummary);
router.get('/category_summary/detail/:id',             getCategorySummaryById);
 
 
router.put('/category_summary/:userId/upsert', upsertCategorySummary);

// ================================================================
router.get('/dashboard_cache/account/:accountId',    getDashboardCachebyAccount);
router.get('/dashboard_cache/:userId',    getDashboardCache);

router.put('/dashboard_cache/:userId',    upsertDashboardCache);
 
// ================================================================
router.get('/monthly_reports/:userId/by_month', getMonthlyReportByMonth);
router.get('/monthly_reports/:userId/recent',   getRecentMonthlyReports); //lấy báo cáo theo những tháng trước   
router.get('/monthly_reports/:userId',          getMonthlyReport);
router.get('/monthly_reports/detail/:id',          getMonthlyReportById);
 
 
router.put('/monthly_reports/:userId/upsert', upsertMonthlyReport);


// ================================================================
router.get('/spending_trends/:userId',                       getSpendingTrend);
router.get('/spending_trends/:userId/category/:categoryId',  getSpendingTrendByCategory);
router.get('/spending_trends/detail/:id',                       getSpendingTrendById);
 

// ================================================================
router.get('/transactions/:userId/date_range',           getTransactionsByDateRange);
router.get('/transactions/:userId/category/:categoryId', getTransactionsByCategory);
router.get('/transactions/:userId',                      getTransactions);
router.get('/transactions/detail/:transId',                 getTransactionByTransId);
 

 
module.exports = router;

