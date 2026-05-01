// ============================================================
// index.model.js
// Re-exports all Mongoose models for finance_db
// Usage:
//   const { Transaction, UserAnalytics, ... } = require("./models");
// ============================================================

const AnomalyLog      = require("./anomalyLog.model");
const CategorySummary = require("./categorySummary.model");
const DashboardCache  = require("./dashboardCache.model");
const MonthlyReport   = require("./monthlyReport.model");
const SpendingTrend   = require("./spendingTrend.model");
const Transaction     = require("./transaction.model");
const UserAnalytics   = require("./userAnalytics.model");

module.exports = {
  AnomalyLog,
  CategorySummary,
  DashboardCache,
  MonthlyReport,
  SpendingTrend,
  Transaction,
  UserAnalytics,
};
