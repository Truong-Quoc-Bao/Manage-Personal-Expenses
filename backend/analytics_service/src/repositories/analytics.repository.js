'use strict';

const user_analytics  = require('../model/userAnalytics.model.js');
const anomaly_logs = require('../model/anomalyLog.model.js');
const category_summary = require('../model/categorySummary.model.js');
const dashboard_cache  = require('../model/dashboardCache.model.js');
const monthly_reports  = require('../model/monthlyReport.model.js');
const spending_trends  = require('../model/spendingTrend.model.js');
const accounts  = require('../model/account.model.js');
const transaction  = require('../model/transaction.model.js');



const repo = {

  // ================================================================
  // ACCOUNT
  // ================================================================
  findAccountByAccountId: async (accountId) => {
    return await accounts.findOne({ account_id: accountId }).lean();
  },
 
  // ================================================================
  // USER ANALYTICS
  // ================================================================
  findUserAnalyticsByAccountId: async (accountId) => {
    return await user_analytics.findOne({ account_id: accountId }).lean();
  },
 
  findAllUserAnalytics: async () => {
    return await user_analytics.find().lean();
  },
 
  createUserAnalytics: async (data) => {
    return await user_analytics.create(data);
  },
 
  updateUserAnalyticsByAccountId: async (accountId, updateData) => {
    return await user_analytics.findOneAndUpdate(
      { account_id: accountId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  },
 
  deleteUserAnalyticsByAccountId: async (accountId) => {
    return await user_analytics.findOneAndDelete({ account_id: accountId }).lean();
  },
 
  // ================================================================
  // ANOMALY LOGS
  // ================================================================
  findAnomalyLogsByAccountId: async (accountId) => {
    return await anomaly_logs.find({ account_id: accountId })
      .sort({ detected_at: -1 })
      .lean();
  },
 
  findAnomalyLogById: async (logId) => {
    return await anomaly_logs.findById(logId).lean();
  },
 
  findUnreadAnomalyLogsByAccountId: async (accountId) => {
    return await anomaly_logs.find({
      account_id: accountId,
      is_read: false,
      is_dismissed: false,
    })
      .sort({ detected_at: -1 })
      .lean();
  },
 
  countUnreadAnomalyLogs: async (accountId) => {
    return await anomaly_logs.countDocuments({
      account_id: accountId,
      is_read: false,
      is_dismissed: false,
    });
  },
 
  createAnomalyLog: async (data) => {
    return await anomaly_logs.create(data);
  },
 
  updateAnomalyLogById: async (logId, updateData) => {
    return await anomaly_logs.findByIdAndUpdate(
      logId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  },
 
  markAllAnomalyLogsRead: async (accountId) => {
    return await anomaly_logs.updateMany(
      { account_id: accountId, is_read: false },
      { $set: { is_read: true } }
    );
  },
 
  dismissAnomalyLogById: async (logId) => {
    return await anomaly_logs.findByIdAndUpdate(
      logId,
      { $set: { is_dismissed: true, is_read: true } },
      { new: true }
    ).lean();
  },
 
  deleteAnomalyLogById: async (logId) => {
    return await anomaly_logs.findByIdAndDelete(logId).lean();
  },
 
  deleteAllAnomalyLogsByAccountId: async (accountId) => {
    return await anomaly_logs.deleteMany({ account_id: accountId });
  },
 
  // ================================================================
  // CATEGORY SUMMARY
  // ================================================================
  findCategorySummaryByAccountId: async (accountId) => {
    return await category_summary.find({ account_id: accountId })
      .sort({ year: -1, month: -1 })
      .lean();
  },
 
  findCategorySummaryByAccountMonth: async (accountId, year, month) => {
    return await category_summary.find({ account_id: accountId, year, month })
      .sort({ total_amount: -1 })
      .lean();
  },
 
  findCategorySummaryById: async (id) => {
    return await category_summary.findById(id).lean();
  },
 
  findOverBudgetByAccountId: async (accountId) => {
    return await category_summary.find({ account_id: accountId, is_over_budget: true })
      .sort({ year: -1, month: -1 })
      .lean();
  },
 
  createCategorySummary: async (data) => {
    return await category_summary.create(data);
  },
 
  upsertCategorySummary: async (accountId, categoryId, year, month, data) => {
    return await category_summary.findOneAndUpdate(
      { account_id: accountId, category_id: categoryId, year, month },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },
 
  updateCategorySummaryById: async (id, updateData) => {
    return await category_summary.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  },
 
  deleteCategorySummaryById: async (id) => {
    return await category_summary.findByIdAndDelete(id).lean();
  },
 
  deleteAllCategorySummaryByAccountId: async (accountId) => {
    return await category_summary.deleteMany({ account_id: accountId });
  },
 
  createManyCategorySummary: async (dataArray) => {
    return await category_summary.insertMany(dataArray);
  },
 
  // ================================================================
  // DASHBOARD CACHE
  // ================================================================
  findDashboardCacheByAccountId: async (accountId) => {
    return await dashboard_cache.findOne({
      account_id: accountId,
      // expires_at: { $gt: new Date() },
    }).lean();
  },
 
  upsertDashboardCache: async (accountId, data, ttlMs = 15 * 60 * 1000) => {
    const expires_at = new Date(Date.now() + ttlMs);
    return await dashboard_cache.findOneAndUpdate(
      { account_id: accountId },
      { $set: { ...data, expires_at } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },
 
  invalidateDashboardCache: async (accountId) => {
    return await dashboard_cache.deleteOne({ account_id: accountId });
  },
 
  // ================================================================
  // MONTHLY REPORT
  // ================================================================
  findMonthlyReportByAccountId: async (accountId) => {
    return await monthly_reports.find({ account_id: accountId })
      .sort({ year: -1, month: -1 })
      .lean();
  },
 
  findMonthlyReportByAccountMonth: async (accountId, year, month) => {
    return await monthly_reports.findOne({ account_id: accountId, year, month }).lean();
  },
 
  findRecentMonthlyReports: async (accountId, limit = 6) => {
    return await monthly_reports.find({ account_id: accountId })
      .sort({ year: -1, month: -1 })
      .limit(limit)
      .lean();
  },
 
  findMonthlyReportById: async (id) => {
    return await monthly_reports.findById(id).lean();
  },
 
  createMonthlyReport: async (data) => {
    return await monthly_reports.create(data);
  },
 
  upsertMonthlyReport: async (accountId, year, month, data) => {
    return await monthly_reports.findOneAndUpdate(
      { account_id: accountId, year, month },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },
 
  updateMonthlyReportById: async (id, updateData) => {
    return await monthly_reports.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  },
 
  deleteMonthlyReportById: async (id) => {
    return await monthly_reports.findByIdAndDelete(id).lean();
  },
 
  deleteAllMonthlyReportsByAccountId: async (accountId) => {
    return await monthly_reports.deleteMany({ account_id: accountId });
  },
 
  createManyMonthlyReport: async (dataArray) => {
    return await monthly_reports.insertMany(dataArray);
  },
 
  // ================================================================
  // SPENDING TREND
  // ================================================================
  findSpendingTrendByAccountId: async (accountId) => {
    return await spending_trends.find({ account_id: accountId })
      .sort({ category_type: 1, category_name: 1 })
      .lean();
  },
 
  findSpendingTrendByAccountAndCategory: async (accountId, categoryId) => {
    return await spending_trends.findOne({ account_id: accountId, category_id: categoryId }).lean();
  },
 
  findSpendingTrendById: async (id) => {
    return await spending_trends.findById(id).lean();
  },
 
  createSpendingTrend: async (data) => {
    return await spending_trends.create(data);
  },
 
  upsertSpendingTrend: async (accountId, categoryId, data) => {
    return await spending_trends.findOneAndUpdate(
      { account_id: accountId, category_id: categoryId },
      { $set: { ...data, updated_at: new Date() } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },
 
  updateSpendingTrendById: async (id, updateData) => {
    return await spending_trends.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  },
 
  deleteSpendingTrendById: async (id) => {
    return await spending_trends.findByIdAndDelete(id).lean();
  },
 
  deleteAllSpendingTrendsByAccountId: async (accountId) => {
    return await spending_trends.deleteMany({ account_id: accountId });
  },
 
  // ================================================================
  // TRANSACTION
  // ================================================================
  findTransactionsByAccountId: async (accountId, { limit = 20, skip = 0 } = {}) => {
    return await transaction.find({ account_id: accountId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },
 
  findTransactionByTransId: async (transId) => {
    return await transaction.findOne({ trans_id: transId }).lean();
  },
 
  findTransactionsByAccountAndDateRange: async (accountId, from, to) => {
    return await transaction.find({
      account_id: accountId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: -1 })
      .lean();
  },
 
  findTransactionsByAccountAndCategory: async (accountId, categoryId) => {
    return await transaction.find({ account_id: accountId, category_id: categoryId })
      .sort({ date: -1 })
      .lean();
  },
 
  createTransaction: async (data) => {
    return await transaction.create(data);
  },
 
  updateTransactionByTransId: async (transId, updateData) => {
    return await transaction.findOneAndUpdate(
      { trans_id: transId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  },
 
  deleteTransactionByTransId: async (transId) => {
    return await transaction.findOneAndDelete({ trans_id: transId }).lean();
  },


  
  // findUserAnomalyLogsByUserId: async (userId) => {
  //   return await anomaly_logs.find({ user_id: userId }).lean();
  // },

  // findUserCategorySummaryByUserId: async (userId) => {
  //   return await category_summary.find({ user_id: userId }).lean();
  // },

  // findUserDashboardCacheByUserId: async (userId) => {
  //   return await dashboard_cache.find({ user_id: userId }).lean();
  // },

  // findUserMonthlyReportByUserId: async (userId) => {
  //   return await monthly_reports.find({ user_id: userId }).lean();
  // },

  // findUserSpendingTrendByUserId: async (userId) => {
  //   return await spending_trends.find({ user_id: userId }).lean();
  // },

  // findUserAnalyticsByUserId: async (userId) => {
  //   return await user_analytics.findOne({ user_id: userId }).lean();
  // },
  // // Lấy tất cả (optional)
  // findAll: async () => {
  //   return await user_analytics.find().lean();
  // },

  // createUserAnalytics: async (userId, formattedData) => {
  //   return await user_analytics.create({ ...formattedData, user_id: userId });
  // },

  // createAnomalyLog: async (userId, formattedData) => {
  //   return await anomaly_logs.create({ ...formattedData, user_id: userId });
  // },

  // createCategorySummary: async (userId, formattedData) => {
  //       console.log('=== userId:', userId);
  //   console.log("=== data repository nhận được:", JSON.stringify(formattedData, null, 2));

  //   return await category_summary.create({ ...formattedData, user_id: userId });
  // },

  // createDashboardCache: async (userId, formattedData) => {
  //   return await dashboard_cache.create({ ...formattedData, user_id: userId });
  // },

  // createMonthlyReport: async (userId, formattedData) => {
  //   return await monthly_reports.create({ ...formattedData, user_id: userId });
  // },

  // // createSpendingTrend: async (userId, formattedData) => {
  // //   return await spending_trends.create({ ...formattedData, user_id: userId });
  // // },

  // createSpendingTrend: async (userId, formattedData) => {
  //   console.log('=== Spending Trend - Upsert for user:', userId);
  //   console.log("=== data repository nhận được:", JSON.stringify(formattedData, null, 2));

  //   return await spending_trends.findOneAndUpdate(
  //     { 
  //       user_id: userId, 
  //       category_id: formattedData.category_id 
  //     },
  //     { 
  //       ...formattedData,
  //       user_id: userId,
  //       last_updated: new Date()
  //     },
  //     { 
  //       upsert: true, 
  //       new: true,
  //       runValidators: true 
  //     }
  //   );
  // },

  // // Tạo nhiều bản ghi cùng lúc (optional)
  // createManyCategorySummary: async (dataArray) => {
  //   return await category_summary.insertMany(dataArray);
  // },

  // createManyMonthlyReport: async (dataArray) => {
  //   return await monthly_reports.insertMany(dataArray);
  // }
};


module.exports = repo;