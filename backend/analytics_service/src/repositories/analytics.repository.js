'use strict';

const user_analytics = require('../model/userAnalytics.model.js');
const anomaly_logs = require('../model/anomalyLog.model.js');
const category_summary = require('../model/categorySummary.model.js');
const dashboard_cache = require('../model/dashboardCache.model.js');
const monthly_reports = require('../model/monthlyReport.model.js');
const spending_trends = require('../model/spendingTrend.model.js');
const accounts = require('../model/account.model.js');
const transaction = require('../model/transaction.model.js');



const repo = {
 
  findAccountByuserId: async (userId) => {
    return await accounts.findOne({ user_id: userId }).lean();
  },
 
  findUserAnalyticsByuserId: async (userId) => {
    return await user_analytics.findOne({ user_id: userId }).lean();
  },

  findAllUserAnalytics: async () => {
    return await user_analytics.find().lean();
  },

  createUserAnalytics: async (data) => {
    return await user_analytics.create(data);
  },
 
  updateUserAnalyticsByuserId: async (userId, updateData, options = {}) => {
    return await user_analytics.findOneAndUpdate(
      { user_id: userId },
      updateData, // ❗ KHÔNG wrap $set nữa
      { new: true, runValidators: true, ...options }
    ).lean();
  },

  deleteUserAnalyticsByuserId: async (userId) => {
    return await user_analytics.findOneAndDelete({ user_id: userId }).lean();
  },
 
  findAnomalyLogsByuserId: async (userId) => {
    return await anomaly_logs.find({ user_id: userId })
      .sort({ detected_at: -1 })
      .lean();
  },

  findAnomalyLogById: async (logId) => {
    return await anomaly_logs.findById(logId).lean();
  },

  findUnreadAnomalyLogsByuserId: async (userId) => {
    return await anomaly_logs.find({
      user_id: userId,
      is_read: false,
      is_dismissed: false,
    })
      .sort({ detected_at: -1 })
      .lean();
  },

  countUnreadAnomalyLogs: async (userId) => {
    return await anomaly_logs.countDocuments({
      user_id: userId,
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

  markAllAnomalyLogsRead: async (userId) => {
    return await anomaly_logs.updateMany(
      { user_id: userId, is_read: false },
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

  deleteAllAnomalyLogsByuserId: async (userId) => {
    return await anomaly_logs.deleteMany({ user_id: userId });
  },

  findCategorySummaryByuserId: async (userId) => {
    return await category_summary.find({ user_id: userId })
      .sort({ year: -1, month: -1 })
      .lean();
  },

  findCategorySummaryByAccountMonth: async (userId, category_id, year, month) => {
    return await category_summary.find({ user_id: userId, category_id: category_id, year, month })
      .sort({ total_amount: -1 })
      .lean();
  },

  findCategorySummaryByAccountMonth2: async (userId, category_id, account_id, year, month) => {
    return await category_summary.find({ user_id: userId, category_id: category_id, account_id: account_id, year, month })
      .sort({ total_amount: -1 })
      .lean();
  },


  findCategoryById: async (userId, categoryId) => {
    return await category_summary.findOne({ user_id: userId, category_id: categoryId }).lean();
  },

  findCategorySummaryById: async (id) => {
    return await category_summary.findById(id).lean();
  },

  findOverBudgetByuserId: async (userId) => {
    return await category_summary.find({ user_id: userId, is_over_budget: true })
      .sort({ year: -1, month: -1 })
      .lean();
  },

  createCategorySummary: async (data) => {
    return await category_summary.create(data);
  },

  upsertCategorySummary: async (userId, categoryId, accountId, year, month, data) => {
    return await category_summary.findOneAndUpdate(
      { user_id: userId, category_id: categoryId, account_id: accountId, year, month },
      data,
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

  deleteAllCategorySummaryByuserId: async (userId) => {
    return await category_summary.deleteMany({ user_id: userId });
  },

  // Cleanup category_summary theo account_id (khi account bị xoá)
  deleteCategorySummaryByAccountId: async (accountId) => {
    return await category_summary.deleteMany({ account_id: accountId });
  },

  // Tìm tất cả category_summary của user trong (category_id, year, month) trên tất cả account
  findCategorySummariesByUserCategoryMonth: async (userId, categoryId, year, month) => {
    return await category_summary.find({
      user_id: userId,
      category_id: categoryId,
      year,
      month,
    }).lean();
  },

  createManyCategorySummary: async (dataArray) => {
    return await category_summary.insertMany(dataArray);
  },

  findDashboardCacheByuserId: async (userId) => {
    // Mỗi user có N dashboard_cache documents (unique theo account_id),
    // trả về ARRAY để frontend cộng dồn tổng số dư / thu / chi của tất cả ví.
    return await dashboard_cache
      .find({ user_id: userId })
      .sort({ account_id: 1 })
      .lean();
  },

  findDashboardCacheByAccountId: async (accountId) => {
    return await dashboard_cache.findOne({
      account_id: accountId,
      // expires_at: { $gt: new Date() },
    }).lean();
  },

  upsertDashboardCache: async (userId, data, ttlMs = 15 * 60 * 1000) => {
    const expires_at = new Date(Date.now() + ttlMs);
    return await dashboard_cache.findOneAndUpdate(
      { user_id: userId, account_id: data.account_id },
      { $set: { ...data, expires_at } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },

  invalidateDashboardCache: async (userId) => {
    // Xoá tất cả cache của user (mọi account_id), không chỉ 1 doc.
    return await dashboard_cache.deleteMany({ user_id: userId });
  },

  // Cập nhật field top_account_id đồng nhất cho tất cả dashboard_cache của user
  updateDashboardCacheTopAccount: async (userId, topAccountId) => {
    return await dashboard_cache.updateMany(
      { user_id: userId },
      { $set: { top_account_id: topAccountId } }
    );
  },

  // Cleanup dashboard_cache theo account_id (khi account bị xoá)
  deleteDashboardCacheByAccountId: async (accountId) => {
    return await dashboard_cache.deleteMany({ account_id: accountId });
  },

  findMonthlyReportByuserId: async (userId) => {
    return await monthly_reports.find({ user_id: userId })
      .sort({ year: -1, month: -1 })
      .lean();
  },

  findMonthlyReportByAccountMonth: async (userId, year, month) => {
    return await monthly_reports.findOne({ user_id: userId, year, month }).lean();
  },

  findRecentMonthlyReports: async (userId, limit = 6) => {
    return await monthly_reports.find({ user_id: userId })
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

  upsertMonthlyReport: async (userId, year, month, data) => {
    return await monthly_reports.findOneAndUpdate(
      { user_id: userId, year, month },
      data,          // ✅ không wrap thêm $set
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

  deleteAllMonthlyReportsByuserId: async (userId) => {
    return await monthly_reports.deleteMany({ user_id: userId });
  },

  createManyMonthlyReport: async (dataArray) => {
    return await monthly_reports.insertMany(dataArray);
  },

  findSpendingTrendByuserId: async (userId) => {
    return await spending_trends.find({ user_id: userId })
      .sort({ category_type: 1, category_name: 1 })
      .lean();
  },

  findSpendingTrendByAccountAndCategory: async (userId, categoryId) => {
    return await spending_trends.findOne({ user_id: userId, category_id: categoryId }).lean();
  },

  // Tìm theo unique index (account_id, category_id)
  findSpendingTrendByAccountCategory: async (accountId, categoryId) => {
    return await spending_trends.findOne({ account_id: accountId, category_id: categoryId }).lean();
  },

  findSpendingTrendById: async (id) => {
    return await spending_trends.findById(id).lean();
  },

  createSpendingTrend: async (data) => {
    return await spending_trends.create(data);
  },

  upsertSpendingTrend: async (userId, categoryId, data) => {
    return await spending_trends.findOneAndUpdate(
      { user_id: userId, category_id: categoryId },
      { $set: { ...data, updated_at: new Date() } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },

  // Upsert theo unique index (account_id, category_id); raw update payload (đã wrap $set)
  upsertSpendingTrendByAccountCategory: async (accountId, categoryId, updatePayload) => {
    return await spending_trends.findOneAndUpdate(
      { account_id: accountId, category_id: categoryId },
      updatePayload,
      { new: true, upsert: true, runValidators: true }
    ).lean();
  },

  // Cleanup spending_trends theo account_id (khi account bị xoá)
  deleteSpendingTrendsByAccountId: async (accountId) => {
    return await spending_trends.deleteMany({ account_id: accountId });
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

  deleteAllSpendingTrendsByuserId: async (userId) => {
    return await spending_trends.deleteMany({ user_id: userId });
  },

  findTransactionsByuserId: async (userId, { limit = 20, skip = 0 } = {}) => {
    return await transaction.find({ user_id: userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  findTransactionByTransId: async (transId) => {
    return await transaction.findOne({ trans_id: transId }).lean();
  },

  findTransactionsByAccountAndDateRange: async (userId, from, to) => {
    return await transaction.find({
      user_id: userId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: -1 })
      .lean();
  },

  findTransactionsByAccountAndCategory: async (userId, categoryId) => {
    return await transaction.find({ user_id: userId, category_id: categoryId })
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
};


module.exports = repo;