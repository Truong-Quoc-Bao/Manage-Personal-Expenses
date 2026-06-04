'use strict';

const repo = require('../repositories/analytics.repository.js');

const service = {
  // getUserAnalytics: async (userId) => {
  //   return await repo.findUserAnalyticsByuserId(userId);
  // },

  getUserAnalytics: async (userId) => {
    let ua = await repo.findUserAnalyticsByuserId(userId);
    if (!ua) return null;

    // --- THÊM ĐOẠN NÀY ĐỂ TỰ NHẢY THÁNG ---
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (
      ua.current_month &&
      (ua.current_month.month !== currentMonth || ua.current_month.year !== currentYear)
    ) {
      const freshMonth = {
        year: currentYear,
        month: currentMonth,
        income: 0,
        expense: 0,
        savings: 0,
        savings_rate: 0,
      };
      // Lưu vào DB luôn
      await repo.updateUserAnalyticsByuserId(userId, { $set: { current_month: freshMonth } });
      ua.current_month = freshMonth; // Gán lại để trả về giao diện
    }
    // --------------------------------------

    return ua;
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

  flattenObject: function (obj, parent = '', res = {}) {
    for (let key in obj) {
      const value = obj[key];
      const newKey = parent ? `${parent}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        this.flattenObject(value, newKey, res);
      } else {
        // ✅ array + primitive đều vào đây
        res[newKey] = value;
      }
    }
    return res;
  },

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
          $currentDate: { updated_at: true },
        },
        {
          arrayFilters: [{ 'elem.goal_id': goal_id }],
        },
      );
    }

    const specialSet = {};

    // replace account_id
    if (data.account_id) {
      if (!Array.isArray(data.account_id)) {
        throw new Error('account_id must be array');
      }
      specialSet['account_id'] = data.account_id;
    }

    if (data.top_categories) {
      if (!Array.isArray(data.top_categories)) {
        throw new Error('top_categories must be array');
      }
      specialSet['top_categories'] = data.top_categories;
    }

    if (data.goal_tracking?.goals) {
      if (!Array.isArray(data.goal_tracking.goals)) {
        throw new Error('goals must be array');
      }
      specialSet['goal_tracking.goals'] = data.goal_tracking.goals;
    }

    if (data.budget_alert) {
      specialSet['budget_alert'] = data.budget_alert;
    }

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

    const finalSet = {
      ...normalSet,
      ...specialSet,
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    for (const key in finalSet) {
      if (key.includes('_id') || key.includes('created_at')) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }
    return await repo.updateUserAnalyticsByuserId(userId, {
      $set: finalSet,
      $currentDate: { updated_at: true },
    });
  },

  deleteUserAnalytics: async (userId) => {
    if (!userId) throw new Error('userId is required');
    const result = await repo.deleteUserAnalyticsByuserId(userId);
    if (!result) throw new Error('User analytics not found');
    return result;
  },

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

    const VALID_TYPES = [
      'unusual_amount',
      'unusual_frequency',
      'category_spike',
      'income_drop',
      'recurring_missed',
    ];
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

    const allowedFields = [
      'severity',
      'description',
      'is_read',
      'is_dismissed',
      'amount_flagged',
      'expected_range',
    ];
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

  getCategorySummary: async (userId) => {
    return await repo.findCategorySummaryByuserId(userId);
  },

  getCategorySummaryByMonth: async (userId, category_id, year, month) => {
    return await repo.findCategorySummaryByAccountMonth(
      userId,
      category_id,
      Number(year),
      Number(month),
    );
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

  upsertCategorySummary: async function (userId, data) {
    if (!userId) throw new Error('userId is required');

    if (!data.category_id) throw new Error('category_id is required');
    if (!data.year) throw new Error('year is required');
    if (!data.month) throw new Error('month is required');

    const blockedFields = ['_id', 'user_id', 'created_at', 'updated_at'];

    const specialSet = {};

    if (data.daily_breakdown) {
      if (!Array.isArray(data.daily_breakdown)) {
        throw new Error('daily_breakdown must be array');
      }

      specialSet['daily_breakdown'] = data.daily_breakdown;
    }

    const safeData = {};

    for (const key in data) {
      if (!blockedFields.includes(key) && !['daily_breakdown'].includes(key)) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);

    const finalSet = {
      ...normalSet,
      ...specialSet,
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    for (const key in finalSet) {
      if (['_id', 'user_id', 'updated_at', 'created_at'].includes(key)) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }

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

    return await repo.upsertCategorySummary(
      userId,
      data.category_id,
      Number(data.year),
      Number(data.month),
      {
        $set: finalSet,
        $currentDate: { updated_at: true },
      },
    );
  },

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

  getDashboardCache: async (userId) => {
    const list = await repo.findDashboardCacheByuserId(userId);
    const arr = Array.isArray(list) ? list : list ? [list] : [];
    console.log(`[getDashboardCache] user=${userId} -> ${arr.length} cache doc(s)`);
    return arr;
  },

  getDashboardCachebyAccount: async (accountId) => {
    return await repo.findDashboardCacheByAccountId(accountId);
  },

  upsertDashboardCache: async function (userId, data) {
    if (!userId) throw new Error('userId is required');
    if (!data) throw new Error('Data is required');

    const TTL_MS = data.ttl_ms || 15 * 60 * 1000;

    const blockedFields = ['_id', 'user_id', 'expires_at'];

    const specialSet = {};

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

    if (data.summary) {
      specialSet['summary'] = data.summary;
    }

    if (data.streak) {
      specialSet['streak'] = data.streak;
    }

    if (data.top_account_id) {
      specialSet['top_account_id'] = data.top_account_id;
    }

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
          'ttl_ms',
        ].includes(key)
      ) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);

    const finalSet = {
      ...normalSet,
      ...specialSet,
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

    return await repo.upsertDashboardCache(userId, finalSet, TTL_MS);
  },

  invalidateDashboardCache: async (userId) => {
    if (!userId) throw new Error('userId is required');
    return await repo.invalidateDashboardCache(userId);
  },

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

    const specialSet = {};

    // replace arrays
    const arrayFields = [
      'income_by_category',
      'expense_by_category',
      'weekly_trend',
      'daily_cashflow',
      'top_expenses',
    ];

    for (const field of arrayFields) {
      if (data[field]) {
        if (!Array.isArray(data[field])) {
          throw new Error(`${field} must be array`);
        }
        specialSet[field] = data[field];
      }
    }

    if (data.comparison) {
      specialSet['comparison'] = data.comparison;
    }

    if (data.generated_at) {
      specialSet['generated_at'] = new Date(data.generated_at);
    }

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
          'generated_at',
        ].includes(key)
      ) {
        safeData[key] = data[key];
      }
    }

    const normalSet = this.flattenObject(safeData);

    const finalSet = {
      ...normalSet,
      ...specialSet,
    };

    if (Object.keys(finalSet).length === 0) {
      throw new Error('No valid fields to update');
    }

    for (const key in finalSet) {
      if (key.includes('_id') || key.includes('created_at')) {
        throw new Error(`Forbidden field: ${key}`);
      }
    }

    return await repo.upsertMonthlyReport(userId, Number(data.year), Number(data.month), finalSet);
  },

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

    const allowedFields = [
      'category_id',
      'amount',
      'transaction_type',
      'description',
      'date',
      'note',
    ];
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

  _getWeekNumber: (day) => {
    return Math.ceil(day / 7);
  },

  _updateUserAnalytics: async function (transaction, sign = 1) {
    const { user_id, amount, transaction_type, date } = transaction;
    const txDate = date ? new Date(date) : new Date();
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;
    const isExpense = transaction_type === 'Expense';
    const isIncome = transaction_type === 'Income';
    const rawAmt = Number(amount);
    if (isNaN(rawAmt)) {
      console.error(`[_updateUserAnalytics] Invalid amount, skipping. amount:`, amount);
      return null;
    }
    const amt = rawAmt * sign;

    let ua = await repo.findUserAnalyticsByuserId(user_id);
    if (!ua) {
      if (sign < 0) {
        console.warn(
          `[_updateUserAnalytics] sign=-1 but no user_analytics for user_id: ${user_id} -> skip reverse`,
        );
        return null;
      }
      console.log(
        `[_updateUserAnalytics] user_analytics not found, creating new for user_id: ${user_id}`,
      );
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

    const newTotalIncome = isIncome
      ? Math.max(0, (ua.total_income || 0) + amt)
      : ua.total_income || 0;
    const newTotalExpense = isExpense
      ? Math.max(0, (ua.total_expense || 0) + amt)
      : ua.total_expense || 0;
    const newBalance = newTotalIncome - newTotalExpense;

    let currentMonthUpdate = { ...ua.current_month };

    if (currentMonthUpdate.month !== currentMonth || currentMonthUpdate.year !== currentYear) {
      currentMonthUpdate = {
        year: currentYear,
        month: currentMonth,
        income: 0,
        expense: 0,
        savings: 0,
        savings_rate: 0,
      };
    }

    if (txYear === currentYear && txMonth === currentMonth) {
      if (isIncome) {
        currentMonthUpdate.income = Math.max(0, (currentMonthUpdate.income || 0) + amt);
      }
      if (isExpense) {
        currentMonthUpdate.expense = Math.max(0, (currentMonthUpdate.expense || 0) + amt);
      }

      currentMonthUpdate.savings =
        (currentMonthUpdate.income || 0) - (currentMonthUpdate.expense || 0);
      currentMonthUpdate.savings_rate =
        currentMonthUpdate.income > 0
          ? parseFloat(((currentMonthUpdate.savings / currentMonthUpdate.income) * 100).toFixed(2))
          : 0;
    }

    let topCategories = ua.top_categories ? [...ua.top_categories] : [];
    if (isExpense && transaction.category_id) {
      const idx = topCategories.findIndex((c) => c.category_id === transaction.category_id);
      if (idx >= 0) {
        const newAmount = (topCategories[idx].total_amount || 0) + amt;
        if (newAmount <= 0) {
          topCategories.splice(idx, 1);
        } else {
          topCategories[idx] = { ...topCategories[idx], total_amount: newAmount };
        }
      } else if (sign > 0) {
        topCategories.push({
          category_id: transaction.category_id,
          category_name: transaction.category_name || '',
          total_amount: amt,
        });
      }
      topCategories.sort((a, b) => b.total_amount - a.total_amount);
    }

    const updated = await repo.updateUserAnalyticsByuserId(user_id, {
      $set: {
        total_income: newTotalIncome,
        total_expense: newTotalExpense,
        current_balance: newBalance,
        current_month: currentMonthUpdate,
        top_categories: topCategories,
      },
      $currentDate: { updated_at: true },
    });

    console.log(
      `[_updateUserAnalytics] sign=${sign} user=${user_id} type=${transaction_type} amt=${rawAmt} -> total_income=${updated?.total_income}, total_expense=${updated?.total_expense}, balance=${updated?.current_balance}`,
    );
    return updated;
  },

  _updateCategorySummary: async function (transaction, sign = 1) {
    const { user_id, account_id, category_id, amount, transaction_type, date, trans_id } =
      transaction;

    if (!category_id) {
      console.warn(
        `[_updateCategorySummary] sign=${sign} no category_id for trans_id=${trans_id}, skip`,
      );
      return null;
    }

    const txDate = new Date(date);
    const year = txDate.getFullYear();
    const month = txDate.getMonth() + 1;
    const day = txDate.getDate();
    const rawAmt = Number(amount);

    if (isNaN(rawAmt)) {
      console.error(`[_updateCategorySummary] Invalid amount, skipping. amount:`, amount);
      return null;
    }
    if (isNaN(year) || isNaN(month)) {
      console.error('[_updateCategorySummary] Invalid date, skipping. date:', date);
      return null;
    }

    const amt = rawAmt * sign;

    const existingArr = await repo
      .findCategorySummaryByAccountMonth2(user_id, category_id, account_id, year, month)
      .catch(() => null);
    const existing = existingArr?.[0] || null;

    if (existing) {
      const newTotal = Math.max(0, (existing.total_amount || 0) + amt);
      const newCount = Math.max(0, (existing.transaction_count || 0) + sign);
      const budgetLimit = existing.budget_limit || 0;
      const isOverBudget = budgetLimit > 0 ? newTotal > budgetLimit : false;

      const breakdown = existing.daily_breakdown
        ? existing.daily_breakdown.map((d) => ({ ...d, trans_id: [...(d.trans_id || [])] }))
        : [];
      const dayIdx = breakdown.findIndex((d) => d.day === day);
      if (sign > 0) {
        if (dayIdx >= 0) {
          breakdown[dayIdx] = {
            ...breakdown[dayIdx],
            amount: (breakdown[dayIdx].amount || 0) + amt,
            trans_id: [...(breakdown[dayIdx].trans_id || []), trans_id],
          };
        } else {
          breakdown.push({ day, amount: amt, trans_id: [trans_id] });
          breakdown.sort((a, b) => a.day - b.day);
        }
      } else if (dayIdx >= 0) {
        const newDayAmount = Math.max(0, (breakdown[dayIdx].amount || 0) + amt);
        const newTransIds = (breakdown[dayIdx].trans_id || []).filter((id) => id !== trans_id);
        if (newTransIds.length === 0 || newDayAmount === 0) {
          breakdown.splice(dayIdx, 1);
        } else {
          breakdown[dayIdx] = { ...breakdown[dayIdx], amount: newDayAmount, trans_id: newTransIds };
        }
      } else {
        console.warn(
          `[_updateCategorySummary] sign=-1 but day=${day} not found in breakdown for trans_id=${trans_id}`,
        );
      }

      const result = await repo.upsertCategorySummary(
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
          $currentDate: { updated_at: true },
        },
      );

      console.log(
        `[_updateCategorySummary] sign=${sign} cat=${category_id} ${year}/${month} -> total=${result?.total_amount}, count=${result?.transaction_count}, days=${result?.daily_breakdown?.length}`,
      );
      return result;
    }

    if (sign < 0) {
      console.warn(
        `[_updateCategorySummary] sign=-1 but no existing summary for cat=${category_id} ${year}/${month}, skip reverse`,
      );
      return null;
    }

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
    const created = await repo.upsertCategorySummary(
      user_id,
      category_id,
      account_id,
      year,
      month,
      { $set: newDoc, $currentDate: { updated_at: true } },
    );
    console.log(
      `[_updateCategorySummary] sign=${sign} CREATE cat=${category_id} ${year}/${month} -> total=${created?.total_amount}`,
    );
    return created;
  },

  _updateDashboardCache: async function (transaction, sign = 1) {
    const {
      user_id,
      account_id,
      trans_id,
      amount,
      transaction_type,
      description,
      date,
      category_id,
    } = transaction;
    if (!account_id) {
      console.warn(
        `[_updateDashboardCache] sign=${sign} no account_id for trans_id=${trans_id}, skip`,
      );
      return null;
    }

    const rawAmt = Number(amount);
    if (isNaN(rawAmt)) {
      console.error(`[_updateDashboardCache] Invalid amount, skipping. amount:`, amount);
      return null;
    }
    const amt = rawAmt * sign;
    const isExpense = transaction_type === 'Expense';
    const isIncome = transaction_type === 'Income';

    let cache = await repo.findDashboardCacheByAccountId(account_id).catch(() => null);
    let isNewCache = false;
    if (!cache) {
      if (sign < 0) {
        console.warn(
          `[_updateDashboardCache] sign=-1 but no cache for account_id=${account_id}, skip reverse`,
        );
        return null;
      }
      console.log(
        `[_updateDashboardCache] dashboard_cache not found, creating new for account_id: ${account_id}`,
      );
      isNewCache = true;
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
        top_categories: [],
        recent_transactions: [],
        streak: { saving_months: 0, unit: 'months' },
        top_account_id: null,
      };
    }

    const summary = { ...(cache.summary || {}) };
    if (isExpense) {
      summary.current_balance = (summary.current_balance || 0) - amt;
      summary.monthly_expense = Math.max(0, (summary.monthly_expense || 0) + amt);
    } else if (isIncome) {
      summary.current_balance = (summary.current_balance || 0) + amt;
      summary.monthly_income = Math.max(0, (summary.monthly_income || 0) + amt);
    }
    summary.monthly_savings = (summary.monthly_income || 0) - (summary.monthly_expense || 0);
    summary.savings_rate =
      summary.monthly_income > 0
        ? parseFloat(((summary.monthly_savings / summary.monthly_income) * 100).toFixed(2))
        : 0;

    // Recompute top_categories (expense-only, all-time cumulative)
    let topCategories = cache.top_categories ? cache.top_categories.map((c) => ({ ...c })) : [];
    if (isExpense && category_id) {
      const idx = topCategories.findIndex((c) => c.category_id === category_id);
      if (idx >= 0) {
        const newAmount = (topCategories[idx].total_amount || 0) + amt;
        if (newAmount <= 0) {
          topCategories.splice(idx, 1);
        } else {
          topCategories[idx] = { ...topCategories[idx], total_amount: newAmount };
        }
      } else if (sign > 0) {
        topCategories.push({
          category_id,
          category_name: transaction.category_name || '',
          total_amount: amt,
        });
      }
      topCategories.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
      topCategories = topCategories.slice(0, 10);
    }

    let recent;
    if (sign > 0) {
      const newTx = {
        trans_id,
        description: description || '',
        amount: rawAmt,
        type: transaction_type ? transaction_type.toLowerCase() : 'expense',
        date: date ? date.toString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        category_id: category_id || null,
      };
      recent = [
        newTx,
        ...(cache.recent_transactions || []).filter((t) => t.trans_id !== trans_id),
      ].slice(0, 5);
    } else {
      recent = (cache.recent_transactions || []).filter((t) => t.trans_id !== trans_id);
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const result = await repo.upsertDashboardCache(
      user_id,
      {
        account_id,
        summary,
        top_categories: topCategories,
        recent_transactions: recent,
        streak: cache.streak,
        top_account_id: cache.top_account_id,
        expires_at: expiresAt,
      },
      15 * 60 * 1000,
    );

    // Recompute top_account_id across all user's dashboard caches.
    // top_account_id = account có monthly_expense lớn nhất trong user.
    try {
      const allCaches = await repo.findDashboardCacheByuserId(user_id);
      if (Array.isArray(allCaches) && allCaches.length > 0) {
        let topAccountId = null;
        let maxExpense = -1;
        for (const c of allCaches) {
          const exp = Number(c?.summary?.monthly_expense || 0);
          if (exp > maxExpense) {
            maxExpense = exp;
            topAccountId = c.account_id;
          }
        }
        if (topAccountId) {
          await repo.updateDashboardCacheTopAccount(user_id, topAccountId);
          if (result) result.top_account_id = topAccountId;
        }
      }
    } catch (err) {
      console.warn(`[_updateDashboardCache] recompute top_account_id failed:`, err.message);
    }

    console.log(
      `[_updateDashboardCache] sign=${sign} account=${account_id} type=${transaction_type} amt=${rawAmt} -> balance=${
        result?.summary?.current_balance
      }, monthly_inc=${result?.summary?.monthly_income}, monthly_exp=${
        result?.summary?.monthly_expense
      }, recent=${result?.recent_transactions?.length}, top_cats=${
        result?.top_categories?.length
      }, top_account=${result?.top_account_id}${isNewCache ? ' (NEW)' : ''}`,
    );
    return result;
  },

  _updateMonthlyReport: async function (transaction, sign = 1) {
    const { user_id, trans_id, amount, transaction_type, description, date, category_id } =
      transaction;
    if (!date) {
      console.warn(`[_updateMonthlyReport] sign=${sign} no date for trans_id=${trans_id}, skip`);
      return null;
    }

    const txDate = new Date(date);
    const year = txDate.getFullYear();
    const month = txDate.getMonth() + 1;
    const day = txDate.getDate();

    const rawAmt = Number(amount);
    if (isNaN(rawAmt)) {
      console.error(`[_updateMonthlyReport] Invalid amount, skipping. amount:`, amount);
      return null;
    }
    if (isNaN(year) || isNaN(month)) {
      console.error('[_updateMonthlyReport] Invalid date, skipping. date:', date);
      return null;
    }
    const amt = rawAmt * sign;

    const isExpense = transaction_type === 'Expense';
    const isIncome = transaction_type === 'Income';

    const week = Math.ceil(day / 7);

    let report = await repo.findMonthlyReportByAccountMonth(user_id, year, month).catch(() => null);
    if (!report) {
      if (sign < 0) {
        console.warn(
          `[_updateMonthlyReport] sign=-1 but no report for user=${user_id} ${year}/${month}, skip reverse`,
        );
        return null;
      }
      console.log(
        `[_updateMonthlyReport] monthly_report not found, creating new for user_id: ${user_id}, ${year}/${month}`,
      );
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

    const summary = { ...(report.summary || {}) };
    if (isIncome) {
      summary.total_income = Math.max(0, (summary.total_income || 0) + amt);
    }
    if (isExpense) {
      summary.total_expense = Math.max(0, (summary.total_expense || 0) + amt);
    }
    summary.savings = (summary.total_income || 0) - (summary.total_expense || 0);
    summary.savings_rate =
      summary.total_income > 0
        ? parseFloat(((summary.savings / summary.total_income) * 100).toFixed(2))
        : 0;
    summary.transaction_count = Math.max(0, (summary.transaction_count || 0) + sign);

    const targetCatArray = isIncome ? 'income_by_category' : 'expense_by_category';
    const catArray = report[targetCatArray] ? [...report[targetCatArray]] : [];
    if (category_id) {
      const catIdx = catArray.findIndex((c) => c.category_id === category_id);
      if (catIdx >= 0) {
        const newAmount = (catArray[catIdx].amount || 0) + amt;
        if (newAmount <= 0) {
          catArray.splice(catIdx, 1);
        } else {
          catArray[catIdx] = { ...catArray[catIdx], amount: newAmount };
        }
      } else if (sign > 0) {
        const categoryInfo = await repo.findCategoryById(user_id, category_id).catch(() => null);
        catArray.push({
          category_id,
          category_name: transaction.category_name || categoryInfo?.category_name || 'Unknown',
          amount: amt,
        });
      }
    }

    const weeklyTrend = report.weekly_trend ? [...report.weekly_trend] : [];
    const wIdx = weeklyTrend.findIndex((w) => w.week === week);
    if (wIdx >= 0) {
      const newIncome = isIncome
        ? Math.max(0, (weeklyTrend[wIdx].income || 0) + amt)
        : weeklyTrend[wIdx].income || 0;
      const newExpense = isExpense
        ? Math.max(0, (weeklyTrend[wIdx].expense || 0) + amt)
        : weeklyTrend[wIdx].expense || 0;
      if (newIncome === 0 && newExpense === 0) {
        weeklyTrend.splice(wIdx, 1);
      } else {
        weeklyTrend[wIdx] = { ...weeklyTrend[wIdx], income: newIncome, expense: newExpense };
      }
    } else if (sign > 0) {
      weeklyTrend.push({
        week,
        income: isIncome ? amt : 0,
        expense: isExpense ? amt : 0,
      });
      weeklyTrend.sort((a, b) => a.week - b.week);
    }

    const dailyCashflow = report.daily_cashflow ? [...report.daily_cashflow] : [];
    const dIdx = dailyCashflow.findIndex((d) => d.day === day);
    if (dIdx >= 0) {
      const newIncome = isIncome
        ? Math.max(0, (dailyCashflow[dIdx].income || 0) + amt)
        : dailyCashflow[dIdx].income || 0;
      const newExpense = isExpense
        ? Math.max(0, (dailyCashflow[dIdx].expense || 0) + amt)
        : dailyCashflow[dIdx].expense || 0;
      if (newIncome === 0 && newExpense === 0) {
        dailyCashflow.splice(dIdx, 1);
      } else {
        dailyCashflow[dIdx] = { ...dailyCashflow[dIdx], income: newIncome, expense: newExpense };
      }
    } else if (sign > 0) {
      dailyCashflow.push({
        day,
        income: isIncome ? amt : 0,
        expense: isExpense ? amt : 0,
      });
      dailyCashflow.sort((a, b) => a.day - b.day);
    }

    let topExpenses = report.top_expenses ? [...report.top_expenses] : [];
    if (isExpense && trans_id) {
      if (sign > 0) {
        topExpenses = topExpenses.filter((t) => t.trans_id !== trans_id);
        topExpenses.push({
          trans_id,
          description: description || '',
          amount: rawAmt,
          category_id: category_id || null,
        });
        topExpenses.sort((a, b) => b.amount - a.amount);
        topExpenses = topExpenses.slice(0, 5);
      } else {
        topExpenses = topExpenses.filter((t) => t.trans_id !== trans_id);
      }
    }

    const result = await repo.upsertMonthlyReport(user_id, year, month, {
      $set: {
        summary,
        [targetCatArray]: catArray,
        weekly_trend: weeklyTrend,
        daily_cashflow: dailyCashflow,
        top_expenses: topExpenses,
        status: 'generated',
      },
      // Chỉ set khi insert mới, các update kế tiếp giữ nguyên timestamp tạo đầu tiên
      $setOnInsert: { generated_at: new Date() },
      $currentDate: { updated_at: true },
    });

    console.log(
      `[_updateMonthlyReport] sign=${sign} user=${user_id} ${year}/${month} type=${transaction_type} amt=${rawAmt} -> total_inc=${result?.summary?.total_income}, total_exp=${result?.summary?.total_expense}, count=${result?.summary?.transaction_count}, generated_at=${result?.generated_at}`,
    );
    return result;
  },

  /**
   * Cập nhật spending_trends theo (account_id, category_id).
   * Mỗi document chứa lịch sử chi/thu theo tháng -> dùng tính avg & xu hướng.
   */
  _updateSpendingTrend: async function (transaction, sign = 1) {
    const { user_id, account_id, category_id, amount, transaction_type, date, trans_id } =
      transaction;

    if (!category_id) {
      console.warn(
        `[_updateSpendingTrend] sign=${sign} no category_id for trans_id=${trans_id}, skip`,
      );
      return null;
    }
    if (!account_id) {
      console.warn(
        `[_updateSpendingTrend] sign=${sign} no account_id for trans_id=${trans_id}, skip`,
      );
      return null;
    }

    const txDate = new Date(date);
    const year = txDate.getFullYear();
    const month = txDate.getMonth() + 1;
    const rawAmt = Number(amount);

    if (isNaN(rawAmt)) {
      console.error(`[_updateSpendingTrend] Invalid amount, skipping. amount:`, amount);
      return null;
    }
    if (isNaN(year) || isNaN(month)) {
      console.error('[_updateSpendingTrend] Invalid date, skipping. date:', date);
      return null;
    }

    const amt = rawAmt * sign;
    const categoryTypeNormalized = transaction_type === 'Income' ? 'income' : 'expense';

    let trend = await repo
      .findSpendingTrendByAccountCategory(account_id, category_id)
      .catch(() => null);

    if (!trend) {
      if (sign < 0) {
        console.warn(
          `[_updateSpendingTrend] sign=-1 but no trend for account=${account_id} cat=${category_id}, skip reverse`,
        );
        return null;
      }
      trend = {
        user_id,
        account_id,
        category_id,
        category_name: transaction.category_name || '',
        category_type: categoryTypeNormalized,
        monthly_data: [],
        total_months: 0,
        total_transactions: 0,
        avg_monthly: 0,
        trend: 'stable',
      };
    }

    // Cập nhật monthly_data theo (year, month)
    const monthlyData = Array.isArray(trend.monthly_data)
      ? trend.monthly_data.map((m) => ({ ...m }))
      : [];
    const mIdx = monthlyData.findIndex((m) => m.year === year && m.month === month);
    if (mIdx >= 0) {
      const newAmt = Math.max(0, (monthlyData[mIdx].amount || 0) + amt);
      if (newAmt === 0) {
        monthlyData.splice(mIdx, 1);
      } else {
        monthlyData[mIdx] = { ...monthlyData[mIdx], amount: newAmt };
      }
    } else if (sign > 0) {
      monthlyData.push({ year, month, amount: amt });
      monthlyData.sort((a, b) => a.year - b.year || a.month - b.month);
    } else {
      console.warn(
        `[_updateSpendingTrend] sign=-1 but ${year}/${month} not in monthly_data for cat=${category_id}, skip`,
      );
    }

    const totalMonths = monthlyData.length;
    const totalAmount = monthlyData.reduce((s, m) => s + (m.amount || 0), 0);
    const avgMonthly = totalMonths > 0 ? Math.round(totalAmount / totalMonths) : 0;
    const newTotalTransactions = Math.max(0, (trend.total_transactions || 0) + sign);

    // Xác định xu hướng dựa trên tháng cuối so với tháng kế trước
    let direction = 'stable';
    if (monthlyData.length >= 2) {
      const last = monthlyData[monthlyData.length - 1].amount || 0;
      const prev = monthlyData[monthlyData.length - 2].amount || 0;
      if (last > prev * 1.1) direction = 'increasing';
      else if (last < prev * 0.9) direction = 'decreasing';
      else direction = 'stable';
    }

    const result = await repo.upsertSpendingTrendByAccountCategory(account_id, category_id, {
      $set: {
        user_id,
        account_id,
        category_id,
        category_name: trend.category_name,
        category_type: trend.category_type || categoryTypeNormalized,
        monthly_data: monthlyData,
        avg_monthly: avgMonthly,
        trend: direction,
        total_months: totalMonths,
        total_transactions: newTotalTransactions,
        updated_at: new Date(),
      },
    });

    console.log(
      `[_updateSpendingTrend] sign=${sign} user=${user_id} account=${account_id} cat=${category_id} -> months=${totalMonths}, total_tx=${newTotalTransactions}, avg=${avgMonthly}, trend=${direction}`,
    );
    return result;
  },

  /**
   * Tính lại user_analytics.budget_alert.alerts cho 1 (user, category) trong tháng hiện tại.
   * Tổng hợp dữ liệu từ category_summary (mọi account_id) của user trong (year, month) hiện tại.
   * - Nếu không có budget_limit > 0 -> xoá alert tương ứng (nếu có).
   * - Ngược lại upsert alert với percent_used / status.
   */
  _updateBudgetAlerts: async function (transaction) {
    const { user_id, category_id } = transaction;
    if (!user_id || !category_id) return null;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const summaries = await repo
      .findCategorySummariesByUserCategoryMonth(user_id, category_id, year, month)
      .catch(() => []);

    // Lấy budget_limit lớn nhất trong các account (budget thường set per-category, không per-account)
    const budgetLimit = (summaries || []).reduce(
      (mx, s) => Math.max(mx, Number(s?.budget_limit || 0)),
      0,
    );

    // Không có budget -> đảm bảo không còn alert cho category này
    if (!budgetLimit || budgetLimit <= 0) {
      const cleared = await repo.updateUserAnalyticsByuserId(user_id, {
        $pull: { 'budget_alert.alerts': { category_id } },
        $set: { 'budget_alert.last_checked': new Date() },
      });
      console.log(
        `[_updateBudgetAlerts] user=${user_id} cat=${category_id} no budget -> alert pulled`,
      );
      return cleared;
    }

    const currentSpent = (summaries || []).reduce((s, x) => s + Number(x?.total_amount || 0), 0);
    const categoryName =
      (summaries || []).map((s) => s?.category_name).find(Boolean) ||
      transaction.category_name ||
      '';
    const percentUsed =
      budgetLimit > 0 ? Math.round((currentSpent / budgetLimit) * 100 * 100) / 100 : 0;

    let status = 'ok';
    if (percentUsed > 100) status = 'exceeded';
    else if (percentUsed >= 99) status = 'critical';
    else if (percentUsed >= 70) status = 'warning';

    const newAlert = {
      category_id,
      category_name: categoryName,
      budget_limit: budgetLimit,
      current_spent: Math.max(0, currentSpent),
      percent_used: percentUsed,
      status,
      alerted_at: status !== 'ok' ? new Date() : null,
    };

    // Đảm bảo single-entry per category: pull trước, push sau (atomic 2-bước)
    await repo.updateUserAnalyticsByuserId(user_id, {
      $pull: { 'budget_alert.alerts': { category_id } },
    });

    const updated = await repo.updateUserAnalyticsByuserId(user_id, {
      $push: { 'budget_alert.alerts': newAlert },
      $set: { 'budget_alert.last_checked': new Date() },
    });

    console.log(
      `[_updateBudgetAlerts] user=${user_id} cat=${category_id} spent=${currentSpent}/${budgetLimit} (${percentUsed}%) -> ${status}`,
    );
    return updated;
  },

  handleTransactionCreated: async function (message) {
    console.log(`[handleTransactionCreated] Received message:`, message);
    const transaction = message;
    const { account_id, trans_id, user_id } = transaction;

    console.log(`[handleTransactionCreated] Processing trans_id: ${trans_id}, user_id: ${user_id}`);
    try {
      // Phase 1: cập nhật song song các collection chính
      const [uaResult, csResult, dcResult, mrResult, stResult] = await Promise.allSettled([
        this._updateUserAnalytics(transaction),
        this._updateCategorySummary(transaction),
        this._updateDashboardCache(transaction),
        this._updateMonthlyReport(transaction),
        this._updateSpendingTrend(transaction),
      ]);

      if (uaResult.status === 'rejected')
        console.error(`[handleTransactionCreated] user_analytics error:`, uaResult.reason);
      if (csResult?.status === 'rejected')
        console.error(`[handleTransactionCreated] category_summary error:`, csResult.reason);
      if (dcResult?.status === 'rejected')
        console.error(`[handleTransactionCreated] dashboard_cache error:`, dcResult.reason);
      if (mrResult?.status === 'rejected')
        console.error(`[handleTransactionCreated] monthly_report error:`, mrResult.reason);
      if (stResult?.status === 'rejected')
        console.error(`[handleTransactionCreated] spending_trends error:`, stResult.reason);

      // Phase 2: budget alerts (đọc category_summary vừa cập nhật ở phase 1)
      try {
        await this._updateBudgetAlerts(transaction);
      } catch (err) {
        console.error(`[handleTransactionCreated] budget_alerts error:`, err.message);
      }

      console.log(`[handleTransactionCreated] Done for trans_id: ${trans_id}`);
      return { account_id, trans_id };
    } catch (err) {
      console.error(`[handleTransactionCreated] Fatal error:`, err);
      return null;
    }
  },

  _logPhaseResults: function (prefix, results) {
    const names = [
      'user_analytics',
      'category_summary',
      'dashboard_cache',
      'monthly_report',
      'spending_trends',
    ];
    const report = { ok: 0, skipped: 0, failed: 0, details: {} };
    results.forEach((r, i) => {
      const name = names[i];
      if (r.status === 'fulfilled') {
        if (r.value && (r.value._id || r.value.user_id || r.value.account_id)) {
          report.ok++;
          report.details[name] = 'OK';
          console.log(`${prefix} ${name}: OK`);
        } else {
          report.skipped++;
          report.details[name] = 'SKIPPED';
          console.warn(`${prefix} ${name}: SKIPPED (no record returned)`);
        }
      } else {
        report.failed++;
        report.details[name] = `ERROR: ${r.reason?.message || r.reason}`;
        console.error(
          `${prefix} ${name}: ERROR ->`,
          r.reason?.message || r.reason,
          r.reason?.stack,
        );
      }
    });
    return report;
  },

  handleTransactionUpdated: async function (message) {
    const {
      trans_id,
      user_id,
      account_id,
      account_id_update,
      category_id,
      amount,
      amount_update,
      transaction_type,
      transaction_type_update,
      category_name,
      account_name,
      description,
      date,
      note,
    } = message;

    console.log(`[handleTransactionUpdated] Processing trans_id: ${trans_id}, user_id: ${user_id}`);
    console.log(
      `[handleTransactionUpdated] OLD -> account=${account_id}, amount=${amount}, type=${transaction_type}, category=${category_id}`,
    );
    console.log(
      `[handleTransactionUpdated] NEW -> account=${account_id_update ?? account_id}, amount=${
        amount_update ?? amount
      }, type=${transaction_type_update ?? transaction_type}, category=${category_id}`,
    );

    if (account_id_update && account_id_update !== account_id) {
      console.warn(
        `[handleTransactionUpdated] account_id changed (${account_id} -> ${account_id_update}). Reverse will hit OLD account, apply will hit NEW account.`,
      );
    }

    try {
      const oldTransaction = {
        trans_id,
        user_id,
        account_id,
        category_id,
        amount: Number(amount),
        transaction_type,
        category_name,
        account_name,
        description,
        date,
        note,
      };

      const newTransaction = {
        trans_id,
        user_id,
        account_id: account_id_update ?? account_id,
        category_id,
        amount: Number(amount_update ?? amount),
        transaction_type: transaction_type_update ?? transaction_type,
        category_name,
        account_name,
        description,
        date,
        note,
      };

      console.log(`[handleTransactionUpdated] === Phase 1: REVERSE old transaction (sign=-1) ===`);
      const reverseResults = await Promise.allSettled([
        this._updateUserAnalytics(oldTransaction, -1),
        this._updateCategorySummary(oldTransaction, -1),
        this._updateDashboardCache(oldTransaction, -1),
        this._updateMonthlyReport(oldTransaction, -1),
        this._updateSpendingTrend(oldTransaction, -1),
      ]);
      const reverseReport = this._logPhaseResults(
        `[handleTransactionUpdated][REVERSE]`,
        reverseResults,
      );

      console.log(`[handleTransactionUpdated] === Phase 2: APPLY new transaction (sign=+1) ===`);
      const applyResults = await Promise.allSettled([
        this._updateUserAnalytics(newTransaction, 1),
        this._updateCategorySummary(newTransaction, 1),
        this._updateDashboardCache(newTransaction, 1),
        this._updateMonthlyReport(newTransaction, 1),
        this._updateSpendingTrend(newTransaction, 1),
      ]);
      const applyReport = this._logPhaseResults(`[handleTransactionUpdated][APPLY]`, applyResults);

      // Phase 3: budget alerts (đọc category_summary đã được apply ở phase 2)
      try {
        await this._updateBudgetAlerts(newTransaction);
        // Nếu category thay đổi giữa old/new thì recompute cả category cũ
        if (
          oldTransaction.category_id &&
          oldTransaction.category_id !== newTransaction.category_id
        ) {
          await this._updateBudgetAlerts(oldTransaction);
        }
      } catch (err) {
        console.error(`[handleTransactionUpdated] budget_alerts error:`, err.message);
      }

      const allOk = reverseReport.failed === 0 && applyReport.failed === 0;
      const summary = `reverse(ok=${reverseReport.ok}, skip=${reverseReport.skipped}, fail=${reverseReport.failed}) apply(ok=${applyReport.ok}, skip=${applyReport.skipped}, fail=${applyReport.failed})`;
      console.log(
        `[handleTransactionUpdated] Done for trans_id: ${trans_id} | ${summary} | overall=${
          allOk ? 'OK' : 'PARTIAL/FAIL'
        }`,
      );

      if (!allOk) return null;
      return { account_id: account_id_update ?? account_id, trans_id, reverseReport, applyReport };
    } catch (err) {
      console.error(`[handleTransactionUpdated] Fatal error:`, err);
      return null;
    }
  },

  handleTransactionDeleted: async function (message) {
    const {
      trans_id,
      user_id,
      account_id,
      category_id,
      amount,
      transaction_type,
      category_name,
      account_name,
      description,
      date,
      note,
    } = message;

    console.log(`[handleTransactionDeleted] Processing trans_id: ${trans_id}, user_id: ${user_id}`);
    console.log(
      `[handleTransactionDeleted] account=${account_id}, amount=${amount}, type=${transaction_type}, category=${category_id}`,
    );

    try {
      const oldTransaction = {
        trans_id,
        user_id,
        account_id,
        category_id,
        amount: Number(amount),
        transaction_type,
        category_name,
        account_name,
        description,
        date,
        note,
      };

      console.log(`[handleTransactionDeleted] === REVERSE deleted transaction (sign=-1) ===`);
      const results = await Promise.allSettled([
        this._updateUserAnalytics(oldTransaction, -1),
        this._updateCategorySummary(oldTransaction, -1),
        this._updateDashboardCache(oldTransaction, -1),
        this._updateMonthlyReport(oldTransaction, -1),
        this._updateSpendingTrend(oldTransaction, -1),
      ]);
      const report = this._logPhaseResults(`[handleTransactionDeleted][REVERSE]`, results);

      // Recompute budget alerts cho category bị ảnh hưởng
      try {
        await this._updateBudgetAlerts(oldTransaction);
      } catch (err) {
        console.error(`[handleTransactionDeleted] budget_alerts error:`, err.message);
      }

      const delResult = await repo.deleteTransactionByTransId(trans_id).catch((err) => {
        console.error(`[handleTransactionDeleted] deleteTransaction error:`, err);
        return null;
      });
      if (delResult) {
        console.log(`[handleTransactionDeleted] local transaction record deleted: ${trans_id}`);
      } else {
        console.warn(
          `[handleTransactionDeleted] local transaction record not found or already deleted: ${trans_id}`,
        );
      }

      const allOk = report.failed === 0;
      const summary = `reverse(ok=${report.ok}, skip=${report.skipped}, fail=${report.failed})`;
      console.log(
        `[handleTransactionDeleted] Done for trans_id: ${trans_id} | ${summary} | overall=${
          allOk ? 'OK' : 'PARTIAL/FAIL'
        }`,
      );

      if (!allOk) return null;
      return { account_id, trans_id, report };
    } catch (err) {
      console.error(`[handleTransactionDeleted] Fatal error:`, err);
      return null;
    }
  },
};

module.exports = service;
