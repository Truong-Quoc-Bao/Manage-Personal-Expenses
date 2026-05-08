'use strict';

const repo = require('../repositories/analytics.repository.js');

const service = {

  // ================================================================
  // USER ANALYTICS
  // ================================================================
  getUserAnalytics: async (userId) => {
    return await repo.findUserAnalyticsByuserId(userId);
  },

  getAllUserAnalytics: async () => {
    return await repo.findAllUserAnalytics();
  },

  createUserAnalytics: async (userId, data) => {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    const formattedData = {

      user_id: userId,
      display_name: data.display_name || null,
      total_income: Number(data.total_income) || 0,
      total_expense: Number(data.total_expense) || 0,
      current_balance: Number(data.current_balance) || 0,
      current_month: {
        year: Number(data.current_month?.year) || null,
        month: Number(data.current_month?.month) || null,
        income: Number(data.current_month?.income) || 0,
        expense: Number(data.current_month?.expense) || 0,
        savings: Number(data.current_month?.savings) || 0,
        savings_rate: Number(data.current_month?.savings_rate) || 0,
      },
      top_categories: data.top_categories || [],
      ai_insights: data.ai_insights || { generated: false, content: null, generated_at: null },
      budget_alert: data.budget_alert || { enabled: true, alerts: [], last_checked: null },
      goal_tracking: data.goal_tracking || { goals: [] },
      streak: data.streak || { saving_months: 0, unit: 'months' },
    };

    if (!formattedData.current_month.year || !formattedData.current_month.month) {
      throw new Error('current_month.year and current_month.month are required');
    }

    return await repo.createUserAnalytics(formattedData);
  },

  // flattenObject: function (obj, parent = '', res = {}) {
  //   for (let key in obj) {
  //     const value = obj[key];
  //     const newKey = parent ? `${parent}.${key}` : key;

  //     if (
  //       value &&
  //       typeof value === 'object' &&
  //       !Array.isArray(value) &&
  //       !(value instanceof Date)
  //     ) {
  //       this.flattenObject(value, newKey, res); // ✅ đúng
  //     } else if (Array.isArray(value)) {
  //       res[newKey] = value; // giữ nguyên array
  //     }
  //     else {
  //       res[newKey] = value;
  //     }
  //   }
  //   return res;
  // },
  flattenObject: function (obj, parent = '', res = {}) {
    for (let key in obj) {
      const value = obj[key];
      const newKey = parent ? `${parent}.${key}` : key;

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        this.flattenObject(value, newKey, res);
      } else {
        // ✅ array + primitive đều vào đây
        res[newKey] = value;
      }
    }
    return res;
  },

  // updateUserAnalytics: async function (userId, data) {
  //   if (!userId) throw new Error('userId is required');
  //   if (!data) throw new Error('Data is required');

  //   const blockedFields = ['_id', 'user_id', 'created_at', 'updated_at'];

  //   // ✅ validate month
  //   if (
  //     data.current_month?.month &&
  //     (data.current_month.month < 1 || data.current_month.month > 12)
  //   ) {
  //     throw new Error('Invalid month');
  //   }

  //   // =========================
  //   // 🚀 1. HANDLE GOAL UPDATE
  //   // =========================
  //   if (data.goal_update) {
  //     const { goal_id, update } = data.goal_update;

  //     if (!goal_id || !update) {
  //       throw new Error('goal_id and update are required');
  //     }

  //     const setData = {};

  //     for (const key in update) {
  //       setData[`goal_tracking.goals.$[elem].${key}`] = update[key];
  //     }

  //     return await repo.updateUserAnalyticsByuserId(
  //       userId,
  //       {
  //         $set: setData,
  //         $currentDate: { updated_at: true }
  //       },
  //       {
  //         arrayFilters: [{ 'elem.goal_id': goal_id }]
  //       }
  //     );
  //   }
  //   // =========================
  //   // 🧠 NORMAL UPDATE (OBJECT)
  //   // =========================

  //   const safeData = {};

  //   for (const key in data) {
  //     if (!blockedFields.includes(key)) {
  //       safeData[key] = data[key];
  //     }
  //   }

  //   const updateData = this.flattenObject(safeData);

  //   if (Object.keys(updateData).length === 0) {
  //     throw new Error('No valid fields to update');
  //   }

  //   // ❗ chặn nested hack
  //   for (const key in updateData) {
  //     if (key.includes('_id') || key.includes('created_at')) {
  //       throw new Error(`Forbidden field: ${key}`);
  //     }
  //   }

  //   return await repo.updateUserAnalyticsByuserId(userId, {
  //     $set: updateData,
  //     $currentDate: { updated_at: true }
  //   });
  // },

  updateUserAnalytics: async function (userId, data) {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    const blockedFields = ['_id', 'user_id', 'created_at', 'updated_at'];

    // validate month
    if (
      data.current_month?.month &&
      (data.current_month.month < 1 || data.current_month.month > 12)
    ) {
      throw new Error('Invalid month');
    }

    // =========================
    // 🚀 1. HANDLE GOAL UPDATE (partial)
    // =========================
    if (data.goal_update) {
      const { goal_id, update } = data.goal_update;

      if (!goal_id || !update) {
        throw new Error('goal_id and update are required');
      }

      const setData = {};

      for (const key in update) {
        setData[`goal_tracking.goals.$[elem].${key}`] = update[key];
      }

      return await repo.updateUserAnalyticsByuserId(
        userId,
        {
          $set: setData,
          $currentDate: { updated_at: true }
        },
        {
          arrayFilters: [{ 'elem.goal_id': goal_id }]
        }
      );
    }

    // =========================
    // 🚀 2. SPECIAL REPLACE FIELDS
    // =========================

    const specialSet = {};

    // replace account_id
    if (data.account_id) {
      if (!Array.isArray(data.account_id)) {
        throw new Error('account_id must be array');
      }
      specialSet['account_id'] = data.account_id;
    }

    // replace top_categories
    if (data.top_categories) {
      if (!Array.isArray(data.top_categories)) {
        throw new Error('top_categories must be array');
      }
      specialSet['top_categories'] = data.top_categories;
    }

    // replace whole goal_tracking.goals
    if (data.goal_tracking?.goals) {
      if (!Array.isArray(data.goal_tracking.goals)) {
        throw new Error('goals must be array');
      }
      specialSet['goal_tracking.goals'] = data.goal_tracking.goals;
    }

    // replace budget_alert
    if (data.budget_alert) {
      specialSet['budget_alert'] = data.budget_alert;
    }

    // =========================
    // 🧠 3. NORMAL UPDATE
    // =========================

    const safeData = {};

    for (const key in data) {
      if (
        !blockedFields.includes(key) &&
        !['account_id', 'top_categories', 'goal_tracking', 'budget_alert'].includes(key)
      ) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);

    // =========================
    // 🔒 VALIDATE
    // =========================

    const finalSet = {
      ...normalSet,
      ...specialSet
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    for (const key in finalSet) {
      if (key.includes('_id') || key.includes('created_at')) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }

    // =========================
    // 🚀 FINAL UPDATE
    // =========================

    return await repo.updateUserAnalyticsByuserId(userId, {
      $set: finalSet,
      $currentDate: { updated_at: true }
    });
  },


  deleteUserAnalytics: async (userId) => {
    if (!userId) throw new Error('userId is required');
    const result = await repo.deleteUserAnalyticsByuserId(userId);
    if (!result) throw new Error('User analytics not found');
    return result;
  },

  // ================================================================
  // ANOMALY LOGS
  // ================================================================
  getAnomalyLogs: async (userId) => {
    return await repo.findAnomalyLogsByuserId(userId);
  },

  getAnomalyLogById: async (logId) => {
    const result = await repo.findAnomalyLogById(logId);
    if (!result) throw new Error('Anomaly log not found');
    return result;
  },

  getUnreadAnomalyLogs: async (userId) => {
    return await repo.findUnreadAnomalyLogsByuserId(userId);
  },

  countUnreadAnomalyLogs: async (userId) => {
    return await repo.countUnreadAnomalyLogs(userId);
  },

  createAnomalyLog: async (userId, data) => {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    const VALID_TYPES = ['unusual_amount', 'unusual_frequency', 'category_spike', 'income_drop', 'recurring_missed'];
    const VALID_SEVERITIES = ['low', 'medium', 'high'];

    if (!data.type || !VALID_TYPES.includes(data.type)) {
      throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!data.severity || !VALID_SEVERITIES.includes(data.severity)) {
      throw new Error(`severity must be one of: ${VALID_SEVERITIES.join(', ')}`);
    }
    if (!data.description) throw new Error('description is required');

    const formattedData = {
      user_id: userId,
      type: data.type,
      severity: data.severity,
      description: data.description,
      transaction_id: data.transaction_id || null,
      category_id: data.category_id || null,
      amount_flagged: Number(data.amount_flagged) || null,
      expected_range: data.expected_range || { min: null, max: null },
      is_read: Boolean(data.is_read) || false,
      is_dismissed: Boolean(data.is_dismissed) || false,
      detected_at: data.detected_at ? new Date(data.detected_at) : new Date(),
    };

    return await repo.createAnomalyLog(formattedData);
  },

  updateAnomalyLog: async (logId, data) => {
    if (!logId) throw new Error('logId is required');
    if (!data) throw new Error('Data is required');

    const allowedFields = ['severity', 'description', 'is_read', 'is_dismissed', 'amount_flagged', 'expected_range'];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    const result = await repo.updateAnomalyLogById(logId, updateData);
    if (!result) throw new Error('Anomaly log not found');
    return result;
  },

  markAllAnomalyLogsRead: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.markAllAnomalyLogsRead(userId);
  },

  dismissAnomalyLog: async (logId) => {
    if (!logId) throw new Error('logId is required');
    const result = await repo.dismissAnomalyLogById(logId);
    if (!result) throw new Error('Anomaly log not found');
    return result;
  },

  deleteAnomalyLog: async (logId) => {
    if (!logId) throw new Error('logId is required');
    const result = await repo.deleteAnomalyLogById(logId);
    if (!result) throw new Error('Anomaly log not found');
    return result;
  },

  deleteAllAnomalyLogs: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.deleteAllAnomalyLogsByuserId(userId);
  },

  // ================================================================
  // CATEGORY SUMMARY
  // ================================================================
  getCategorySummary: async (userId) => {
    return await repo.findCategorySummaryByuserId(userId);
  },

  getCategorySummaryByMonth: async (userId, category_id, year, month) => {
    return await repo.findCategorySummaryByAccountMonth(userId, category_id, Number(year), Number(month));
  },

  getCategorySummaryById: async (id) => {
    const result = await repo.findCategorySummaryById(id);
    if (!result) throw new Error('Category summary not found');
    return result;
  },

  getOverBudgetCategories: async (userId) => {
    return await repo.findOverBudgetByuserId(userId);
  },

  createCategorySummary: async (userId, data) => {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    if (!data.category_id) throw new Error('category_id is required');
    if (!data.category_name) throw new Error('category_name is required');
    if (!data.year) throw new Error('year is required');
    if (!data.month) throw new Error('month is required');

    const formattedData = {
      user_id: userId,
      category_id: data.category_id,
      category_name: data.category_name,
      category_type: data.category_type || 'expense',
      year: Number(data.year),
      month: Number(data.month),
      total_amount: Number(data.total_amount) || 0,
      transaction_count: Number(data.transaction_count) || 0,
      budget_limit: Number(data.budget_limit) || 0,
      is_over_budget: Boolean(data.is_over_budget) || false,
      daily_breakdown: data.daily_breakdown || [],
    };

    return await repo.createCategorySummary(formattedData);
  },

  // upsertCategorySummary: async (userId, data) => {
  //   if (!userId) throw new Error('userId is required');

  //   if (!data.category_id) throw new Error('category_id is required');
  //   if (!data.year) throw new Error('year is required');
  //   if (!data.month) throw new Error('month is required');

  //   const formattedData = {
  //     user_id: userId,
  //     category_id: data.category_id,
  //     category_name: data.category_name || null,
  //     category_type: data.category_type || 'expense',
  //     year: Number(data.year),
  //     month: Number(data.month),
  //     total_amount: Number(data.total_amount) || 0,
  //     transaction_count: Number(data.transaction_count) || 0,
  //     budget_limit: Number(data.budget_limit) || 0,
  //     is_over_budget: Boolean(data.is_over_budget) || false,
  //     daily_breakdown: data.daily_breakdown || [],
  //   };

  //   return await repo.upsertCategorySummary(
  //     userId, data.category_id, Number(data.year), Number(data.month), formattedData
  //   );
  // },
  upsertCategorySummary: async function (userId, data) {
    if (!userId) throw new Error('userId is required');

    if (!data.category_id) throw new Error('category_id is required');
    if (!data.year) throw new Error('year is required');
    if (!data.month) throw new Error('month is required');

    const blockedFields = ['_id', 'user_id', 'created_at', 'updated_at'];

    // =========================
    // 🚀 1. SPECIAL FIELD (ARRAY)
    // =========================

    const specialSet = {};

    // replace daily_breakdown
    if (data.daily_breakdown) {
      if (!Array.isArray(data.daily_breakdown)) {
        throw new Error('daily_breakdown must be array');
      }

      specialSet['daily_breakdown'] = data.daily_breakdown;
    }

    // =========================
    // 🧠 2. NORMAL UPDATE
    // =========================

    const safeData = {};

    for (const key in data) {
      if (
        !blockedFields.includes(key) &&
        !['daily_breakdown'].includes(key)
      ) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);

    // =========================
    // 🔒 VALIDATE + FORMAT
    // =========================

    const finalSet = {
      ...normalSet,
      ...specialSet
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    for (const key in finalSet) {
      if (['_id', 'user_id', 'updated_at', 'created_at'].includes(key)) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }

    // convert number fields (optional nhưng nên có)
    if (finalSet.total_amount !== undefined) {
      finalSet.total_amount = Number(finalSet.total_amount);
    }

    if (finalSet.transaction_count !== undefined) {
      finalSet.transaction_count = Number(finalSet.transaction_count);
    }

    if (finalSet.budget_limit !== undefined) {
      finalSet.budget_limit = Number(finalSet.budget_limit);
    }

    if (finalSet.is_over_budget !== undefined) {
      finalSet.is_over_budget = Boolean(finalSet.is_over_budget);
    }

    // =========================
    // 🚀 FINAL UPDATE
    // =========================

    return await repo.upsertCategorySummary(
      userId,
      data.category_id,
      Number(data.year),
      Number(data.month),
      {
        $set: finalSet,
        $currentDate: { updated_at: true }
      }
    );
  },
  // updateCategorySummary: async (id, data) => {
  //   if (!id) throw new Error('id is required');
  //   if (!data) throw new Error('Data is required');

  //   const allowedFields = [
  //     'category_name', 'category_type', 'total_amount',
  //     'transaction_count', 'budget_limit', 'is_over_budget', 'daily_breakdown',
  //   ];
  //   const updateData = {};
  //   for (const key of allowedFields) {
  //     if (data[key] !== undefined) updateData[key] = data[key];
  //   }

  //   const result = await repo.updateCategorySummaryById(id, updateData);
  //   if (!result) throw new Error('Category summary not found');
  //   return result;
  // },

  deleteCategorySummary: async (id) => {
    if (!id) throw new Error('id is required');
    const result = await repo.deleteCategorySummaryById(id);
    if (!result) throw new Error('Category summary not found');
    return result;
  },

  deleteAllCategorySummary: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.deleteAllCategorySummaryByuserId(userId);
  },

  createManyCategorySummary: async (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('Data array is required and cannot be empty');
    }
    return await repo.createManyCategorySummary(dataArray);
  },

  // ================================================================
  // DASHBOARD CACHE
  // ================================================================
  getDashboardCache: async (userId) => {
    return await repo.findDashboardCacheByuserId(userId);
  },

  getDashboardCachebyAccount: async (accountId) => {
    return await repo.findDashboardCacheByAccountId(accountId);
  },

  upsertDashboardCache: async function (userId, data) {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    const TTL_MS = data.ttl_ms || 15 * 60 * 1000;

    const blockedFields = ['_id', 'user_id', 'expires_at'];

    // =========================
    // 🚀 1. SPECIAL REPLACE
    // =========================

    const specialSet = {};

    // replace whole array
    if (data.top_categories) {
      if (!Array.isArray(data.top_categories)) {
        throw new Error('top_categories must be array');
      }
      specialSet['top_categories'] = data.top_categories;
    }

    if (data.recent_transactions) {
      if (!Array.isArray(data.recent_transactions)) {
        throw new Error('recent_transactions must be array');
      }
      specialSet['recent_transactions'] = data.recent_transactions;
    }

    // replace object (NOT flatten)
    if (data.summary) {
      specialSet['summary'] = data.summary;
    }

    if (data.streak) {
      specialSet['streak'] = data.streak;
    }

    // optional field
    if (data.top_account_id) {
      specialSet['top_account_id'] = data.top_account_id;
    }

    // =========================
    // 🧠 2. NORMAL UPDATE (flatten)
    // =========================

    const safeData = {};

    for (const key in data) {
      if (
        !blockedFields.includes(key) &&
        ![
          'summary',
          'top_categories',
          'recent_transactions',
          'streak',
          'top_account_id',
          'ttl_ms'
        ].includes(key)
      ) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);

    // =========================
    // 🔒 VALIDATE
    // =========================

    const finalSet = {
      ...normalSet,
      ...specialSet
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    const forbiddenExactFields = ['_id', 'user_id', 'created_at'];

    for (const key in finalSet) {
      const rootKey = key.split('.')[0]; // xử lý nested

      if (forbiddenExactFields.includes(rootKey)) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }

    // =========================
    // 🚀 FINAL UPSERT
    // =========================

    return await repo.upsertDashboardCache(
      userId,
      finalSet,
      TTL_MS
    );
  },

  invalidateDashboardCache: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.invalidateDashboardCache(userId);
  },

  // ================================================================
  // MONTHLY REPORT
  // ================================================================
  getMonthlyReport: async (userId) => {
    return await repo.findMonthlyReportByuserId(userId);
  },

  getMonthlyReportByMonth: async (userId, year, month) => {
    const result = await repo.findMonthlyReportByAccountMonth(userId, Number(year), Number(month));
    if (!result) throw new Error('Monthly report not found');
    return result;
  },

  getRecentMonthlyReports: async (userId, limit = 6) => {
    return await repo.findRecentMonthlyReports(userId, limit);
  },

  getMonthlyReportById: async (id) => {
    const result = await repo.findMonthlyReportById(id);
    if (!result) throw new Error('Monthly report not found');
    return result;
  },

  createMonthlyReport: async (userId, data) => {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    if (!data.year) throw new Error('year is required');
    if (!data.month) throw new Error('month is required');
    if (!data.summary) throw new Error('summary is required');

    const formattedData = {
      user_id: userId,
      year: Number(data.year),
      month: Number(data.month),
      summary: data.summary || {},
      income_by_category: data.income_by_category || [],
      expense_by_category: data.expense_by_category || [],
      weekly_trend: data.weekly_trend || [],
      daily_cashflow: data.daily_cashflow || [],
      top_expenses: data.top_expenses || [],
      comparison: data.comparison || {},
      ai_report: data.ai_report || { generated: false, content: null, generated_at: null },
      status: data.status || 'draft',
      generated_at: data.generated_at ? new Date(data.generated_at) : null,
    };

    return await repo.createMonthlyReport(formattedData);
  },

  upsertMonthlyReport: async function (userId, data) {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    if (!data.year) throw new Error('year is required');
    if (!data.month) throw new Error('month is required');

    const blockedFields = ['_id', 'user_id', 'created_at', 'updated_at'];

    // =========================
    // 🚀 1. SPECIAL REPLACE
    // =========================

    const specialSet = {};

    // replace arrays
    const arrayFields = [
      'income_by_category',
      'expense_by_category',
      'weekly_trend',
      'daily_cashflow',
      'top_expenses'
    ];

    for (const field of arrayFields) {
      if (data[field]) {
        if (!Array.isArray(data[field])) {
          throw new Error(`${field} must be array`);
        }
        specialSet[field] = data[field];
      }
    }

    // replace object (NOT flatten)
    // if (data.summary) {
    //   specialSet['summary'] = data.summary;
    // }

    if (data.comparison) {
      specialSet['comparison'] = data.comparison;
    }

    // if (data.ai_report) {
    //   specialSet['ai_report'] = data.ai_report;
    // }

    // scalar fields
    // if (data.status) {
    //   specialSet['status'] = data.status;
    // }

    if (data.generated_at) {
      specialSet['generated_at'] = new Date(data.generated_at);
    }

    // =========================
    // 🧠 2. NORMAL UPDATE (flatten)
    // =========================

    const safeData = {};

    for (const key in data) {
      if (
        !blockedFields.includes(key) &&
        ![
          // 'summary',
          'income_by_category',
          'expense_by_category',
          'weekly_trend',
          'daily_cashflow',
          'top_expenses',
          'comparison',
          // 'ai_report',
          // 'status',
          'generated_at'
        ].includes(key)
      ) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);
    // =========================
    // 🔒 VALIDATE
    // =========================

    const finalSet = {
      ...normalSet,
      ...specialSet
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    for (const key in finalSet) {
      if (key.includes('_id') || key.includes('created_at')) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }

    // =========================
    // 🚀 FINAL UPSERT
    // =========================

    return await repo.upsertMonthlyReport(
      userId,
      Number(data.year),
      Number(data.month),
      finalSet
    );
  },

  // updateMonthlyReport: async (id, data) => {
  //   if (!id) throw new Error('id is required');
  //   if (!data) throw new Error('Data is required');

  //   const allowedFields = [
  //     'summary', 'income_by_category', 'expense_by_category',
  //     'weekly_trend', 'daily_cashflow', 'top_expenses',
  //     'comparison', 'ai_report', 'status', 'generated_at',
  //   ];
  //   const updateData = {};
  //   for (const key of allowedFields) {
  //     if (data[key] !== undefined) updateData[key] = data[key];
  //   }

  //   const result = await repo.updateMonthlyReportById(id, updateData);
  //   if (!result) throw new Error('Monthly report not found');
  //   return result;
  // },

  deleteMonthlyReport: async (id) => {
    if (!id) throw new Error('id is required');
    const result = await repo.deleteMonthlyReportById(id);
    if (!result) throw new Error('Monthly report not found');
    return result;
  },

  deleteAllMonthlyReports: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.deleteAllMonthlyReportsByuserId(userId);
  },

  createManyMonthlyReport: async (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('Data array is required and cannot be empty');
    }
    return await repo.createManyMonthlyReport(dataArray);
  },

  // ================================================================
  // SPENDING TREND
  // ================================================================
  getSpendingTrend: async (userId) => {
    return await repo.findSpendingTrendByuserId(userId);
  },

  getSpendingTrendByCategory: async (userId, categoryId) => {
    const result = await repo.findSpendingTrendByAccountAndCategory(userId, categoryId);
    if (!result) throw new Error('Spending trend not found');
    return result;
  },

  getSpendingTrendById: async (id) => {
    const result = await repo.findSpendingTrendById(id);
    if (!result) throw new Error('Spending trend not found');
    return result;
  },

  createSpendingTrend: async (userId, data) => {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    if (!data.category_id) throw new Error('category_id is required');
    if (!data.category_name) throw new Error('category_name is required');

    const formattedData = {
      user_id: userId,
      category_id: data.category_id,
      category_name: data.category_name,
      category_type: data.category_type || 'expense',
      monthly_data: data.monthly_data || [],
      stats: data.stats || {},
    };

    return await repo.createSpendingTrend(formattedData);
  },

  upsertSpendingTrend: async (userId, data) => {
    if (!userId) throw new Error('userId is required');

    if (!data.category_id) throw new Error('category_id is required');
    if (!data.category_name) throw new Error('category_name is required');

    const formattedData = {
      user_id: userId,
      category_id: data.category_id,
      category_name: data.category_name,
      category_type: data.category_type || 'expense',
      monthly_data: data.monthly_data || [],
      stats: data.stats || {},
    };

    return await repo.upsertSpendingTrend(userId, data.category_id, formattedData);
  },

  updateSpendingTrend: async (id, data) => {
    if (!id) throw new Error('id is required');
    if (!data) throw new Error('Data is required');

    const allowedFields = ['category_name', 'category_type', 'monthly_data', 'stats'];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    const result = await repo.updateSpendingTrendById(id, updateData);
    if (!result) throw new Error('Spending trend not found');
    return result;
  },

  deleteSpendingTrend: async (id) => {
    if (!id) throw new Error('id is required');
    const result = await repo.deleteSpendingTrendById(id);
    if (!result) throw new Error('Spending trend not found');
    return result;
  },

  deleteAllSpendingTrends: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.deleteAllSpendingTrendsByuserId(userId);
  },

  // ================================================================
  // TRANSACTION
  // ================================================================
  getTransactions: async (userId, { limit, skip } = {}) => {
    return await repo.findTransactionsByuserId(userId, { limit, skip });
  },

  getTransactionByTransId: async (transId) => {
    const result = await repo.findTransactionByTransId(transId);
    if (!result) throw new Error('Transaction not found');
    return result;
  },

  getTransactionsByDateRange: async (userId, from, to) => {
    if (!from || !to) throw new Error('from and to dates are required');
    return await repo.findTransactionsByAccountAndDateRange(userId, new Date(from), new Date(to));
  },

  getTransactionsByCategory: async (userId, categoryId) => {
    if (!categoryId) throw new Error('categoryId is required');
    return await repo.findTransactionsByAccountAndCategory(userId, categoryId);
  },

  createTransaction: async (userId, data) => {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    const VALID_TYPES = ['income', 'expense', 'saving', 'investment'];

    if (!data.trans_id) throw new Error('trans_id is required');
    if (data.amount === undefined) throw new Error('amount is required');
    if (!data.transaction_type || !VALID_TYPES.includes(data.transaction_type)) {
      throw new Error(`transaction_type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!data.date) throw new Error('date is required');

    const formattedData = {
      trans_id: data.trans_id,
      user_id: userId,
      category_id: data.category_id || null,
      amount: Number(data.amount),
      transaction_type: data.transaction_type,
      description: data.description || null,
      date: new Date(data.date),
      note: data.note || null,
    };

    return await repo.createTransaction(formattedData);
  },

  updateTransaction: async (transId, data) => {
    if (!transId) throw new Error('transId is required');
    if (!data) throw new Error('Data is required');

    const allowedFields = ['category_id', 'amount', 'transaction_type', 'description', 'date', 'note'];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    if (updateData.date) updateData.date = new Date(updateData.date);

    const result = await repo.updateTransactionByTransId(transId, updateData);
    if (!result) throw new Error('Transaction not found');
    return result;
  },

  deleteTransaction: async (transId) => {
    if (!transId) throw new Error('transId is required');
    const result = await repo.deleteTransactionByTransId(transId);
    if (!result) throw new Error('Transaction not found');
    return result;
  },
  //===================================================================================================
  // HELPER: tính week number (1-5) từ ngày trong tháng
  _getWeekNumber: (day) => {
    return Math.ceil(day / 7);
  },

  // HELPER: cập nhật user_analytics khi có transaction mới
  _updateUserAnalytics: async function (transaction) {
    const { user_id, amount, transaction_type, date } = transaction;
    const txDate = date ? new Date(date) : new Date();
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;
    const isExpense = transaction_type === 'Expense';
    const isIncome = transaction_type === 'Income';
    const amt = Number(amount);

    // Lấy user_analytics hiện tại, tự tạo nếu chưa có
    let ua = await repo.findUserAnalyticsByuserId(user_id);
    if (!ua) {
      console.log(`[_updateUserAnalytics] user_analytics not found, creating new for user_id: ${user_id}`);
      ua = await repo.createUserAnalytics({
        user_id,
        total_income: 0,
        total_expense: 0,
        current_balance: 0,
        current_month: {
          year: txYear,
          month: txMonth,
          income: 0,
          expense: 0,
          savings: 0,
          savings_rate: 0,
        },
        top_categories: [],
        ai_insights: { generated: false, content: null, generated_at: null },
        budget_alert: { enabled: true, alerts: [], last_checked: null },
        goal_tracking: { goals: [] },
        streak: { saving_months: 0, unit: 'months' },
      });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Tính total_income / total_expense / current_balance mới
    const newTotalIncome = isIncome ? (ua.total_income || 0) + amt : (ua.total_income || 0);
    const newTotalExpense = isExpense ? (ua.total_expense || 0) + amt : (ua.total_expense || 0);
    const newBalance = newTotalIncome - newTotalExpense;

    // Tính current_month (chỉ cập nhật nếu transaction thuộc tháng hiện tại)
    let currentMonthUpdate = { ...ua.current_month };
    if (txYear === currentYear && txMonth === currentMonth) {
      if (isIncome) currentMonthUpdate.income = (ua.current_month?.income || 0) + amt;
      if (isExpense) currentMonthUpdate.expense = (ua.current_month?.expense || 0) + amt;
      currentMonthUpdate.savings = (currentMonthUpdate.income || 0) - (currentMonthUpdate.expense || 0);
      currentMonthUpdate.savings_rate = currentMonthUpdate.income > 0
        ? parseFloat(((currentMonthUpdate.savings / currentMonthUpdate.income) * 100).toFixed(2))
        : 0;
    }

    // Cập nhật top_categories nếu là expense
    let topCategories = ua.top_categories ? [...ua.top_categories] : [];
    if (isExpense && transaction.category_id) {
      const idx = topCategories.findIndex(c => c.category_id === transaction.category_id);
      if (idx >= 0) {
        topCategories[idx] = {
          ...topCategories[idx],
          total_amount: (topCategories[idx].total_amount || 0) + amt
        };
      } else {
        topCategories.push({
          category_id: transaction.category_id,
          category_name: 'test',
          // category_name: transaction.category_name || '',
          total_amount: amt
        });
      }
      topCategories.sort((a, b) => b.total_amount - a.total_amount);
    }

    return await repo.updateUserAnalyticsByuserId(user_id, {
      $set: {
        total_income: newTotalIncome,
        total_expense: newTotalExpense,
        current_balance: newBalance,
        current_month: currentMonthUpdate,
        top_categories: topCategories,
      },
      $currentDate: { updated_at: true }
    });
  },

  // HELPER: cập nhật category_summary khi có transaction mới
  _updateCategorySummary: async function (transaction) {
    const { user_id, account_id, category_id, amount, transaction_type, date, trans_id } = transaction;

    console.log('[_updateCategorySummary] date:', date, 'type:', typeof date); // thêm dòng này

    if (!category_id) return null;

    const txDate = new Date(date);
    const year = txDate.getFullYear();
    const month = txDate.getMonth() + 1;
    const day = txDate.getDate();
    const amt = Number(amount);

    if (isNaN(amt)) {
      throw new Error('Invalid amount');
    }

    if (isNaN(year) || isNaN(month)) {
      console.error('[_updateCategorySummary] Invalid date, skipping. date:', date);
      return null;
    }


    console.log('[_updateCategorySummary] year:', year, 'month:', month); // thêm dòng này

    // Lấy category_summary hiện tại (upsert theo user_id + category_id + year + month)
    const existingArr = await repo.findCategorySummaryByAccountMonth2(user_id, category_id, account_id, year, month)
      .catch(() => null);
    const existing = existingArr?.[0] || null;

    if (existing) {
      // Cập nhật total_amount, transaction_count
      const newTotal = (existing.total_amount || 0) + amt;
      const newCount = (existing.transaction_count || 0) + 1;
      const budgetLimit = existing.budget_limit || 0;
      const isOverBudget = budgetLimit > 0 ? newTotal > budgetLimit : false;

      // Cập nhật daily_breakdown
      const breakdown = existing.daily_breakdown ? [...existing.daily_breakdown] : [];
      const dayIdx = breakdown.findIndex(d => d.day === day);
      if (dayIdx >= 0) {
        breakdown[dayIdx] = {
          ...breakdown[dayIdx],
          amount: breakdown[dayIdx].amount + amt,
          trans_id: [...(breakdown[dayIdx].trans_id || []), trans_id]
        };
      } else {
        breakdown.push({ day, amount: amt, trans_id: [trans_id] });
        breakdown.sort((a, b) => a.day - b.day);
      }

      return await repo.upsertCategorySummary(
        user_id,
        category_id,
        account_id,
        year,
        month,
        {
          $set: {
            total_amount: newTotal,
            transaction_count: newCount,
            is_over_budget: isOverBudget,
            daily_breakdown: breakdown,
          },
          $currentDate: { updated_at: true }
        }
      );
    } else {
      // Tạo mới
      const categoryInfo = await repo.findCategoryById(user_id, category_id).catch(() => null);
      const newDoc = {
        user_id,
        account_id: account_id || null,
        category_id,
        category_name: categoryInfo?.category_name || transaction.category_name || '',
        category_type: transaction_type === 'Income' ? 'income' : 'expense',
        year,
        month,
        total_amount: amt,
        transaction_count: 1,
        budget_limit: 0,
        is_over_budget: false,
        daily_breakdown: [{ day, amount: amt, trans_id: [trans_id] }],
      };
      return await repo.upsertCategorySummary(
        user_id,
        category_id,
        account_id,
        year,
        month,
        { $set: newDoc, $currentDate: { updated_at: true } }
      );
    }
  },

  // HELPER: cập nhật dashboard_cache
  _updateDashboardCache: async function (transaction) {
    const { user_id, account_id, trans_id, amount, transaction_type, description, date, category_id } = transaction;
    if (!account_id) return null;

    const amt = Number(amount);
    const isExpense = transaction_type === 'Expense';
    const isIncome = transaction_type === 'Income';

    // Lấy cache hiện tại theo user_id + account_id, tự tạo nếu chưa có
    let cache = await repo.findDashboardCacheByAccountId(account_id).catch(() => null);
    if (!cache) {
      console.log(`[_updateDashboardCache] dashboard_cache not found, creating new for account_id: ${account_id}`);
      cache = {
        user_id,
        account_id,
        summary: {
          current_balance: 0,
          monthly_income: 0,
          monthly_expense: 0,
          monthly_savings: 0,
          savings_rate: 0,
        },
        recent_transactions: [],
        streak: { saving_months: 0, unit: 'months' },
        top_account_id: account_id,
      };
    }

    const summary = { ...(cache.summary || {}) };
    if (isExpense) {
      summary.current_balance = (summary.current_balance || 0) - amt;
      summary.monthly_expense = (summary.monthly_expense || 0) + amt;
      summary.monthly_savings = (summary.monthly_income || 0) - summary.monthly_expense;
      summary.savings_rate = summary.monthly_income > 0
        ? parseFloat(((summary.monthly_savings / summary.monthly_income) * 100).toFixed(2))
        : 0;
    } else if (isIncome) {
      summary.current_balance = (summary.current_balance || 0) + amt;
      summary.monthly_income = (summary.monthly_income || 0) + amt;
      summary.monthly_savings = summary.monthly_income - (summary.monthly_expense || 0);
      summary.savings_rate = summary.monthly_income > 0
        ? parseFloat(((summary.monthly_savings / summary.monthly_income) * 100).toFixed(2))
        : 0;
    }

    // Cập nhật recent_transactions (prepend, giữ tối đa 5)
    const newTx = {
      trans_id,
      description: description || '',
      amount: amt,
      type: transaction_type.toLowerCase(),
      date: date ? date.toString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      category_id: category_id || null
    };
    const recent = [newTx, ...(cache.recent_transactions || [])].slice(0, 5);

    // TTL 15 phút từ bây giờ
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return await repo.upsertDashboardCache(
      user_id,
      {
        account_id,
        summary,
        recent_transactions: recent,
        streak: cache.streak,
        top_account_id: cache.top_account_id,
        expires_at: expiresAt,
      },
      15 * 60 * 1000
    );
  },

  // HELPER: cập nhật monthly_report
  _updateMonthlyReport: async function (transaction) {
    const { user_id, trans_id, amount, transaction_type, description, date, category_id } = transaction;
    if (!date) return null;

    const txDate = new Date(date);
    const year = txDate.getFullYear();

    const month = txDate.getMonth() + 1;

    const day = txDate.getDate();

    const amt = Number(amount);

    const isExpense = transaction_type === 'Expense';
    const isIncome = transaction_type === 'Income';

    const week = Math.ceil(day / 7);

    // Lấy monthly_report hiện tại, tự tạo nếu chưa có
    let report = await repo.findMonthlyReportByAccountMonth(user_id, year, month).catch(() => null);
    if (!report) {
      console.log(`[_updateMonthlyReport] monthly_report not found, creating new for user_id: ${user_id}, ${year}/${month}`);
      report = {
        user_id,
        year,
        month,
        summary: {
          total_income: 0,
          total_expense: 0,
          savings: 0,
          savings_rate: 0,
          transaction_count: 0,
        },
        income_by_category: [],
        expense_by_category: [],
        weekly_trend: [],
        daily_cashflow: [],
        top_expenses: [],
        status: 'generated',
      };
    }

    // --- summary ---
    const summary = { ...(report.summary || {}) };
    if (isIncome) {
      summary.total_income = (summary.total_income || 0) + amt;
    }
    if (isExpense) {
      summary.total_expense = (summary.total_expense || 0) + amt;
    }
    summary.savings = (summary.total_income || 0) - (summary.total_expense || 0);
    summary.savings_rate = summary.total_income > 0
      ? parseFloat(((summary.savings / summary.total_income) * 100).toFixed(2))
      : 0;
    summary.transaction_count = (summary.transaction_count || 0) + 1;

    // --- income_by_category / expense_by_category ---
    const targetCatArray = isIncome ? 'income_by_category' : 'expense_by_category';
    const catArray = report[targetCatArray] ? [...report[targetCatArray]] : [];
    if (category_id) {
      const catIdx = catArray.findIndex(c => c.category_id === category_id);
      if (catIdx >= 0) {
        catArray[catIdx] = { ...catArray[catIdx], amount: catArray[catIdx].amount + amt };
      } else {
        const categoryInfo = await repo.findCategoryById(category_id).catch(() => null);
        catArray.push({
          category_id,
          category_name: 'test',
          // category_name: categoryInfo?.category_name || transaction.category_name || '',
          amount: amt
        });
      }
    }

    // --- weekly_trend ---
    const weeklyTrend = report.weekly_trend ? [...report.weekly_trend] : [];
    const wIdx = weeklyTrend.findIndex(w => w.week === week);
    if (wIdx >= 0) {
      weeklyTrend[wIdx] = {
        ...weeklyTrend[wIdx],
        income: isIncome ? weeklyTrend[wIdx].income + amt : weeklyTrend[wIdx].income,
        expense: isExpense ? weeklyTrend[wIdx].expense + amt : weeklyTrend[wIdx].expense,
      };
    } else {
      weeklyTrend.push({
        week,
        income: isIncome ? amt : 0,
        expense: isExpense ? amt : 0,
      });
      weeklyTrend.sort((a, b) => a.week - b.week);
    }

    // --- daily_cashflow ---
    const dailyCashflow = report.daily_cashflow ? [...report.daily_cashflow] : [];
    const dIdx = dailyCashflow.findIndex(d => d.day === day);
    if (dIdx >= 0) {
      dailyCashflow[dIdx] = {
        ...dailyCashflow[dIdx],
        income: isIncome ? dailyCashflow[dIdx].income + amt : dailyCashflow[dIdx].income,
        expense: isExpense ? dailyCashflow[dIdx].expense + amt : dailyCashflow[dIdx].expense,
      };
    } else {
      dailyCashflow.push({
        day,
        income: isIncome ? amt : 0,
        expense: isExpense ? amt : 0,
      });
      dailyCashflow.sort((a, b) => a.day - b.day);
    }

    // --- top_expenses (chỉ expense, giữ top 5 theo amount) ---
    let topExpenses = report.top_expenses ? [...report.top_expenses] : [];
    if (isExpense && trans_id) {
      topExpenses.push({
        trans_id,
        description: description || '',
        amount: amt,
        category_id: category_id || null,
      });
      topExpenses.sort((a, b) => b.amount - a.amount);
      topExpenses = topExpenses.slice(0, 5);
    }

    return await repo.upsertMonthlyReport(
      user_id,
      year,
      month,
      {
        $set: {
          summary,
          [targetCatArray]: catArray,
          weekly_trend: weeklyTrend,
          daily_cashflow: dailyCashflow,
          top_expenses: topExpenses,
          status: 'generated',
        },
        $currentDate: { updated_at: true }
      }
    );
  },

  //===================================================================================================
  handleTransactionCreated: async function (message) {
    console.log(`[handleTransactionCreated] Received message:`, message);
    const transaction = message;
    const { account_id, trans_id, user_id } = transaction;

    console.log(`[handleTransactionCreated] Processing trans_id: ${trans_id}, user_id: ${user_id}`);
    console.log(`mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm user_id: ${user_id}`);
    try {

      // Cập nhật song song 4 collections
      const [uaResult, csResult, dcResult, mrResult] = await Promise.allSettled([
        this._updateUserAnalytics(transaction),
        this._updateCategorySummary(transaction),
        this._updateDashboardCache(transaction),
        this._updateMonthlyReport(transaction),
      ]);

      if (uaResult.status === 'rejected') console.error(`[handleTransactionCreated] user_analytics error:`, uaResult.reason);
      if (csResult?.status === 'rejected') console.error(`[handleTransactionCreated] category_summary error:`, csResult.reason);
      if (dcResult?.status === 'rejected') console.error(`[handleTransactionCreated] dashboard_cache error:`, dcResult.reason);
      if (mrResult?.status === 'rejected') console.error(`[handleTransactionCreated] monthly_report error:`, mrResult.reason);

      console.log(`[handleTransactionCreated] Done for trans_id: ${trans_id}`);
      return { account_id, trans_id };
    } catch (err) {
      console.error(`[handleTransactionCreated] Fatal error:`, err);
      return null;
    }
  },

  handleTransactionUpdated: async function (message) {
    // Message format từ RabbitMQ:
    // {
    //   trans_id, user_id,         ← từ message metadata
    //   account_id, category_id,
    //   amount,                    ← giá trị CŨ
    //   amount_update,             ← giá trị MỚI
    //   transaction_type,          ← type CŨ
    //   transaction_type_update,   ← type MỚI
    //   description, date, note
    // }
    const {
      trans_id, user_id, account_id,
      account_id_update,
      category_id,
      amount, amount_update,
      transaction_type, transaction_type_update,
      description, date, note,
    } = message;

    console.log(`[handleTransactionUpdated] Processing trans_id: ${trans_id}, user_id: ${user_id}`);

    try {
      // Tạo old_transaction (giá trị cũ để reverse)
      const oldTransaction = {
        trans_id,
        user_id,
        account_id,
        category_id,
        amount: Number(amount),
        transaction_type,
        description,
        date,
        note,
      };

      // Tạo new_transaction (giá trị mới để apply)
      const newTransaction = {
        trans_id,
        user_id,
        account_id: account_id_update ?? account_id,
        category_id,
        amount: Number(amount_update ?? amount),
        transaction_type: transaction_type_update ?? transaction_type,
        description,
        date,
        note,
      };

      // Tạo reverse transaction: đảo ngược effect của old
      // Income cũ → dùng Expense để trừ lại, Expense cũ → dùng Income để cộng lại
      const reverseTransaction = {
        ...oldTransaction,
        transaction_type: transaction_type === 'Income' ? 'Expense' : 'Income',
      };

      // Bước 1: Reverse old (sequential vì cần đúng thứ tự)
      const [uaReverse, csReverse, dcReverse, mrReverse] = await Promise.allSettled([
        this._updateUserAnalytics(reverseTransaction),
        this._updateCategorySummary(reverseTransaction),
        this._updateDashboardCache(reverseTransaction),
        this._updateMonthlyReport(reverseTransaction),
      ]);

      if (uaReverse.status === 'rejected') console.error(`[handleTransactionUpdated] uaReverse error:`, uaReverse.reason);
      if (csReverse.status === 'rejected') console.error(`[handleTransactionUpdated] csReverse error:`, csReverse.reason);
      if (dcReverse.status === 'rejected') console.error(`[handleTransactionUpdated] dcReverse error:`, dcReverse.reason);
      if (mrReverse.status === 'rejected') console.error(`[handleTransactionUpdated] mrReverse error:`, mrReverse.reason);

      // Bước 2: Apply new
      const [uaNew, csNew, dcNew, mrNew] = await Promise.allSettled([
        this._updateUserAnalytics(newTransaction),
        this._updateCategorySummary(newTransaction),
        this._updateDashboardCache(newTransaction),
        this._updateMonthlyReport(newTransaction),
      ]);

      if (uaNew.status === 'rejected') console.error(`[handleTransactionUpdated] uaNew error:`, uaNew.reason);
      if (csNew.status === 'rejected') console.error(`[handleTransactionUpdated] csNew error:`, csNew.reason);
      if (dcNew.status === 'rejected') console.error(`[handleTransactionUpdated] dcNew error:`, dcNew.reason);
      if (mrNew.status === 'rejected') console.error(`[handleTransactionUpdated] mrNew error:`, mrNew.reason);

      console.log(`[handleTransactionUpdated] Done for trans_id: ${trans_id}`);
      return { account_id, trans_id };
    } catch (err) {
      console.error(`[handleTransactionUpdated] Fatal error:`, err);
      return null;
    }
  },

  handleTransactionDeleted: async function (message) {
    // Message format từ RabbitMQ:
    // {
    //   trans_id, user_id,         ← từ message metadata
    //   account_id, category_id,
    //   amount, transaction_type,
    //   description, date, note
    // }
    const {
      trans_id, user_id, account_id,
      category_id, amount, transaction_type,
      description, date, note,
    } = message;

    console.log(`[handleTransactionDeleted] Processing trans_id: ${trans_id}, user_id: ${user_id}`);

    try {
      // Tạo reverse transaction: đảo ngược effect của transaction đã xóa
      const reverseTransaction = {
        trans_id,
        user_id,
        account_id,
        category_id,
        amount: Number(amount),
        transaction_type: transaction_type === 'Income' ? 'Expense' : 'Income',
        description,
        date,
        note,
      };

      // Reverse effect của transaction đã xóa trên 4 collections
      const [uaResult, csResult, dcResult, mrResult] = await Promise.allSettled([
        this._updateUserAnalytics(reverseTransaction),
        this._updateCategorySummary(reverseTransaction),
        this._updateDashboardCache(reverseTransaction),
        this._updateMonthlyReport(reverseTransaction),
      ]);

      if (uaResult.status === 'rejected') console.error(`[handleTransactionDeleted] user_analytics error:`, uaResult.reason);
      if (csResult.status === 'rejected') console.error(`[handleTransactionDeleted] category_summary error:`, csResult.reason);
      if (dcResult.status === 'rejected') console.error(`[handleTransactionDeleted] dashboard_cache error:`, dcResult.reason);
      if (mrResult.status === 'rejected') console.error(`[handleTransactionDeleted] monthly_report error:`, mrResult.reason);

      // Xóa transaction khỏi collection transaction (nếu có lưu)
      await repo.deleteTransactionByTransId(trans_id).catch(err =>
        console.error(`[handleTransactionDeleted] deleteTransaction error:`, err)
      );

      console.log(`[handleTransactionDeleted] Done for trans_id: ${trans_id}`);
      return { account_id, trans_id };
    } catch (err) {
      console.error(`[handleTransactionDeleted] Fatal error:`, err);
      return null;
    }
  }



};

module.exports = service;