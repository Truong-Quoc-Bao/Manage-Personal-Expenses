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

  getCategorySummaryByMonth: async (userId, year, month) => {
    return await repo.findCategorySummaryByAccountMonth(userId, Number(year), Number(month));
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




};

module.exports = service;