'use strict';

const repo = require('../repositories/analytics.repository.js');

const service = {

   // ================================================================
  // USER ANALYTICS
  // ================================================================
  getUserAnalytics: async (accountId) => {
    return await repo.findUserAnalyticsByAccountId(accountId);
  },
 
  getAllUserAnalytics: async () => {
    return await repo.findAllUserAnalytics();
  },
 
  createUserAnalytics: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    const formattedData = {
      account_id:      accountId,
      
      user_id:         data.user_id|| null,
      display_name:    data.display_name || null,
      total_income:    Number(data.total_income)    || 0,
      total_expense:   Number(data.total_expense)   || 0,
      current_balance: Number(data.current_balance) || 0,
      current_month: {
        year:         Number(data.current_month?.year)         || null,
        month:        Number(data.current_month?.month)        || null,
        income:       Number(data.current_month?.income)       || 0,
        expense:      Number(data.current_month?.expense)      || 0,
        savings:      Number(data.current_month?.savings)      || 0,
        savings_rate: Number(data.current_month?.savings_rate) || 0,
      },
      top_categories: data.top_categories || [],
      ai_insights:    data.ai_insights    || { generated: false, content: null, generated_at: null },
      budget_alert:   data.budget_alert   || { enabled: true, alerts: [], last_checked: null },
      goal_tracking:  data.goal_tracking  || { goals: [] },
      streak:         data.streak         || { saving_months: 0, unit: 'months' },
    };
 
    if (!formattedData.current_month.year || !formattedData.current_month.month) {
      throw new Error('current_month.year and current_month.month are required');
    }
 
    return await repo.createUserAnalytics(formattedData);
  },
 
  updateUserAnalytics: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    const allowedFields = [
      'display_name', 'total_income', 'total_expense', 'current_balance',
      'current_month', 'top_categories', 'ai_insights',
      'budget_alert', 'goal_tracking', 'streak',
    ];
 
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
 
    const result = await repo.updateUserAnalyticsByAccountId(accountId, updateData);
    if (!result) throw new Error('User analytics not found');
    return result;
  },
 
  deleteUserAnalytics: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    const result = await repo.deleteUserAnalyticsByAccountId(accountId);
    if (!result) throw new Error('User analytics not found');
    return result;
  },
 
  // ================================================================
  // ANOMALY LOGS
  // ================================================================
  getAnomalyLogs: async (accountId) => {
    return await repo.findAnomalyLogsByAccountId(accountId);
  },
 
  getAnomalyLogById: async (logId) => {
    const result = await repo.findAnomalyLogById(logId);
    if (!result) throw new Error('Anomaly log not found');
    return result;
  },
 
  getUnreadAnomalyLogs: async (accountId) => {
    return await repo.findUnreadAnomalyLogsByAccountId(accountId);
  },
 
  countUnreadAnomalyLogs: async (accountId) => {
    return await repo.countUnreadAnomalyLogs(accountId);
  },
 
  createAnomalyLog: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    const VALID_TYPES     = ['unusual_amount', 'unusual_frequency', 'category_spike', 'income_drop', 'recurring_missed'];
    const VALID_SEVERITIES = ['low', 'medium', 'high'];
 
    if (!data.type || !VALID_TYPES.includes(data.type)) {
      throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!data.severity || !VALID_SEVERITIES.includes(data.severity)) {
      throw new Error(`severity must be one of: ${VALID_SEVERITIES.join(', ')}`);
    }
    if (!data.description) throw new Error('description is required');
 
    const formattedData = {
      account_id:     accountId,
      type:           data.type,
      severity:       data.severity,
      description:    data.description,
      transaction_id: data.transaction_id || null,
      category_id:    data.category_id    || null,
      amount_flagged: Number(data.amount_flagged) || null,
      expected_range: data.expected_range || { min: null, max: null },
      is_read:        Boolean(data.is_read)      || false,
      is_dismissed:   Boolean(data.is_dismissed) || false,
      detected_at:    data.detected_at ? new Date(data.detected_at) : new Date(),
    };
 
    return await repo.createAnomalyLog(formattedData);
  },
 
  updateAnomalyLog: async (logId, data) => {
    if (!logId) throw new Error('logId is required');
    if (!data)  throw new Error('Data is required');
 
    const allowedFields = ['severity', 'description', 'is_read', 'is_dismissed', 'amount_flagged', 'expected_range'];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
 
    const result = await repo.updateAnomalyLogById(logId, updateData);
    if (!result) throw new Error('Anomaly log not found');
    return result;
  },
 
  markAllAnomalyLogsRead: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return await repo.markAllAnomalyLogsRead(accountId);
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
 
  deleteAllAnomalyLogs: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return await repo.deleteAllAnomalyLogsByAccountId(accountId);
  },
 
  // ================================================================
  // CATEGORY SUMMARY
  // ================================================================
  getCategorySummary: async (accountId) => {
    return await repo.findCategorySummaryByAccountId(accountId);
  },
 
  getCategorySummaryByMonth: async (accountId, year, month) => {
    return await repo.findCategorySummaryByAccountMonth(accountId, Number(year), Number(month));
  },
 
  getCategorySummaryById: async (id) => {
    const result = await repo.findCategorySummaryById(id);
    if (!result) throw new Error('Category summary not found');
    return result;
  },
 
  getOverBudgetCategories: async (accountId) => {
    return await repo.findOverBudgetByAccountId(accountId);
  },
 
  createCategorySummary: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    if (!data.category_id)   throw new Error('category_id is required');
    if (!data.category_name) throw new Error('category_name is required');
    if (!data.year)          throw new Error('year is required');
    if (!data.month)         throw new Error('month is required');
 
    const formattedData = {
      account_id:        accountId,
      category_id:       data.category_id,
      category_name:     data.category_name,
      category_type:     data.category_type || 'expense',
      year:              Number(data.year),
      month:             Number(data.month),
      total_amount:      Number(data.total_amount)      || 0,
      transaction_count: Number(data.transaction_count) || 0,
      budget_limit:      Number(data.budget_limit)      || 0,
      is_over_budget:    Boolean(data.is_over_budget)   || false,
      daily_breakdown:   data.daily_breakdown || [],
    };
 
    return await repo.createCategorySummary(formattedData);
  },
 
  upsertCategorySummary: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
 
    if (!data.category_id)   throw new Error('category_id is required');
    if (!data.year)          throw new Error('year is required');
    if (!data.month)         throw new Error('month is required');
 
    const formattedData = {
      account_id:        accountId,
      category_id:       data.category_id,
      category_name:     data.category_name     || null,
      category_type:     data.category_type     || 'expense',
      year:              Number(data.year),
      month:             Number(data.month),
      total_amount:      Number(data.total_amount)      || 0,
      transaction_count: Number(data.transaction_count) || 0,
      budget_limit:      Number(data.budget_limit)      || 0,
      is_over_budget:    Boolean(data.is_over_budget)   || false,
      daily_breakdown:   data.daily_breakdown || [],
    };
 
    return await repo.upsertCategorySummary(
      accountId, data.category_id, Number(data.year), Number(data.month), formattedData
    );
  },
 
  updateCategorySummary: async (id, data) => {
    if (!id)   throw new Error('id is required');
    if (!data) throw new Error('Data is required');
 
    const allowedFields = [
      'category_name', 'category_type', 'total_amount',
      'transaction_count', 'budget_limit', 'is_over_budget', 'daily_breakdown',
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
 
    const result = await repo.updateCategorySummaryById(id, updateData);
    if (!result) throw new Error('Category summary not found');
    return result;
  },
 
  deleteCategorySummary: async (id) => {
    if (!id) throw new Error('id is required');
    const result = await repo.deleteCategorySummaryById(id);
    if (!result) throw new Error('Category summary not found');
    return result;
  },
 
  deleteAllCategorySummary: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return await repo.deleteAllCategorySummaryByAccountId(accountId);
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
  getDashboardCache: async (accountId) => {
    return await repo.findDashboardCacheByAccountId(accountId);
  },
 
  upsertDashboardCache: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    const TTL_MS = data.ttl_ms || 15 * 60 * 1000;
 
    const formattedData = {
      summary:             data.summary             || {},
      top_categories:      data.top_categories      || [],
      recent_transactions: data.recent_transactions || [],
      streak:              data.streak              || { saving_months: 0, unit: 'months' },
    };
 
    return await repo.upsertDashboardCache(accountId, formattedData, TTL_MS);
  },
 
  invalidateDashboardCache: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return await repo.invalidateDashboardCache(accountId);
  },
 
  // ================================================================
  // MONTHLY REPORT
  // ================================================================
  getMonthlyReport: async (accountId) => {
    return await repo.findMonthlyReportByAccountId(accountId);
  },
 
  getMonthlyReportByMonth: async (accountId, year, month) => {
    const result = await repo.findMonthlyReportByAccountMonth(accountId, Number(year), Number(month));
    if (!result) throw new Error('Monthly report not found');
    return result;
  },
 
  getRecentMonthlyReports: async (accountId, limit = 6) => {
    return await repo.findRecentMonthlyReports(accountId, limit);
  },
 
  getMonthlyReportById: async (id) => {
    const result = await repo.findMonthlyReportById(id);
    if (!result) throw new Error('Monthly report not found');
    return result;
  },
 
  createMonthlyReport: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    if (!data.year)    throw new Error('year is required');
    if (!data.month)   throw new Error('month is required');
    if (!data.summary) throw new Error('summary is required');
 
    const formattedData = {
      account_id:          accountId,
      year:                Number(data.year),
      month:               Number(data.month),
      summary:             data.summary             || {},
      income_by_category:  data.income_by_category  || [],
      expense_by_category: data.expense_by_category || [],
      weekly_trend:        data.weekly_trend        || [],
      daily_cashflow:      data.daily_cashflow      || [],
      top_expenses:        data.top_expenses        || [],
      comparison:          data.comparison          || {},
      ai_report:           data.ai_report           || { generated: false, content: null, generated_at: null },
      status:              data.status              || 'draft',
      generated_at:        data.generated_at ? new Date(data.generated_at) : null,
    };
 
    return await repo.createMonthlyReport(formattedData);
  },
 
  upsertMonthlyReport: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data.year)  throw new Error('year is required');
    if (!data.month) throw new Error('month is required');
 
    const formattedData = {
      account_id:          accountId,
      year:                Number(data.year),
      month:               Number(data.month),
      summary:             data.summary             || {},
      income_by_category:  data.income_by_category  || [],
      expense_by_category: data.expense_by_category || [],
      weekly_trend:        data.weekly_trend        || [],
      daily_cashflow:      data.daily_cashflow      || [],
      top_expenses:        data.top_expenses        || [],
      comparison:          data.comparison          || {},
      ai_report:           data.ai_report           || { generated: false, content: null, generated_at: null },
      status:              data.status              || 'generated',
      generated_at:        data.generated_at ? new Date(data.generated_at) : new Date(),
    };
 
    return await repo.upsertMonthlyReport(accountId, Number(data.year), Number(data.month), formattedData);
  },
 
  updateMonthlyReport: async (id, data) => {
    if (!id)   throw new Error('id is required');
    if (!data) throw new Error('Data is required');
 
    const allowedFields = [
      'summary', 'income_by_category', 'expense_by_category',
      'weekly_trend', 'daily_cashflow', 'top_expenses',
      'comparison', 'ai_report', 'status', 'generated_at',
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
 
    const result = await repo.updateMonthlyReportById(id, updateData);
    if (!result) throw new Error('Monthly report not found');
    return result;
  },
 
  deleteMonthlyReport: async (id) => {
    if (!id) throw new Error('id is required');
    const result = await repo.deleteMonthlyReportById(id);
    if (!result) throw new Error('Monthly report not found');
    return result;
  },
 
  deleteAllMonthlyReports: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return await repo.deleteAllMonthlyReportsByAccountId(accountId);
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
  getSpendingTrend: async (accountId) => {
    return await repo.findSpendingTrendByAccountId(accountId);
  },
 
  getSpendingTrendByCategory: async (accountId, categoryId) => {
    const result = await repo.findSpendingTrendByAccountAndCategory(accountId, categoryId);
    if (!result) throw new Error('Spending trend not found');
    return result;
  },
 
  getSpendingTrendById: async (id) => {
    const result = await repo.findSpendingTrendById(id);
    if (!result) throw new Error('Spending trend not found');
    return result;
  },
 
  createSpendingTrend: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    if (!data.category_id)   throw new Error('category_id is required');
    if (!data.category_name) throw new Error('category_name is required');
 
    const formattedData = {
      account_id:    accountId,
      category_id:   data.category_id,
      category_name: data.category_name,
      category_type: data.category_type || 'expense',
      monthly_data:  data.monthly_data  || [],
      stats:         data.stats         || {},
    };
 
    return await repo.createSpendingTrend(formattedData);
  },
 
  upsertSpendingTrend: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
 
    if (!data.category_id)   throw new Error('category_id is required');
    if (!data.category_name) throw new Error('category_name is required');
 
    const formattedData = {
      account_id:    accountId,
      category_id:   data.category_id,
      category_name: data.category_name,
      category_type: data.category_type || 'expense',
      monthly_data:  data.monthly_data  || [],
      stats:         data.stats         || {},
    };
 
    return await repo.upsertSpendingTrend(accountId, data.category_id, formattedData);
  },
 
  updateSpendingTrend: async (id, data) => {
    if (!id)   throw new Error('id is required');
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
 
  deleteAllSpendingTrends: async (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return await repo.deleteAllSpendingTrendsByAccountId(accountId);
  },
 
  // ================================================================
  // TRANSACTION
  // ================================================================
  getTransactions: async (accountId, { limit, skip } = {}) => {
    return await repo.findTransactionsByAccountId(accountId, { limit, skip });
  },
 
  getTransactionByTransId: async (transId) => {
    const result = await repo.findTransactionByTransId(transId);
    if (!result) throw new Error('Transaction not found');
    return result;
  },
 
  getTransactionsByDateRange: async (accountId, from, to) => {
    if (!from || !to) throw new Error('from and to dates are required');
    return await repo.findTransactionsByAccountAndDateRange(accountId, new Date(from), new Date(to));
  },
 
  getTransactionsByCategory: async (accountId, categoryId) => {
    if (!categoryId) throw new Error('categoryId is required');
    return await repo.findTransactionsByAccountAndCategory(accountId, categoryId);
  },
 
  createTransaction: async (accountId, data) => {
    if (!accountId) throw new Error('accountId is required');
    if (!data)      throw new Error('Data is required');
 
    const VALID_TYPES = ['income', 'expense', 'saving', 'investment'];
 
    if (!data.trans_id)          throw new Error('trans_id is required');
    if (data.amount === undefined) throw new Error('amount is required');
    if (!data.transaction_type || !VALID_TYPES.includes(data.transaction_type)) {
      throw new Error(`transaction_type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!data.date) throw new Error('date is required');
 
    const formattedData = {
      trans_id:         data.trans_id,
      account_id:       accountId,
      category_id:      data.category_id  || null,
      amount:           Number(data.amount),
      transaction_type: data.transaction_type,
      description:      data.description  || null,
      date:             new Date(data.date),
      note:             data.note         || null,
    };
 
    return await repo.createTransaction(formattedData);
  },
 
  updateTransaction: async (transId, data) => {
    if (!transId) throw new Error('transId is required');
    if (!data)    throw new Error('Data is required');
 
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
 


//   getUserAnomalyLogs: async (userId) => {
//   const data = await repo.findUserAnomalyLogsByUserId(userId);

//   return data;
//   },

//   getUserCategorySummary: async (userId) => {
//     const data = await repo.findUserCategorySummaryByUserId(userId);

//     return data;
//   },

//   getUserDashboardCache: async (userId) => {
//     const data = await repo.findUserDashboardCacheByUserId(userId);

//     return data;
//   },

//   getUserMonthlyReport: async (userId) => {
//     const data = await repo.findUserMonthlyReportByUserId(userId);

//     return data;
//   },

//   getUserSpendingTrend: async (userId) => {
//     const data = await repo.findUserSpendingTrendByUserId(userId);

//     return data;
//   },

//   getUserAnalytics: async (userId) => {
//     const data = await repo.findUserAnalyticsByUserId(userId);

//     return data;
//   },

//   getAllUserAnalytics: async () => {
//     const data = await repo.findAll();

//     return data;
//   },

// // ==================== CREATE ====================

//   createUserAnalytics: async (userId, data) => {
//     if (!userId) throw new Error('userId is required');
//     if (!data) throw new Error('Data is required');

//     const formattedData = {
//       user_id: userId,
//       total_income: Number(data.total_income) || 0,
//       total_expense: Number(data.total_expense) || 0,
//       current_balance: Number(data.current_balance) || 0,
//       current_month: {
//         year: Number(data.current_month?.year),
//         month: Number(data.current_month?.month),
//         income: Number(data.current_month?.income) || 0,
//         expense: Number(data.current_month?.expense) || 0,
//         savings: Number(data.current_month?.savings) || 0,
//         savings_rate: Number(data.current_month?.savings_rate) || 0
//       },
//       top_categories: data.top_categories || [],
//       ai_insights: data.ai_insights || { generated: false, content: null },
//       streak: data.streak || { saving_months: 0, unit: "months" },
//       created_at: data.created_at ? new Date(data.created_at) : new Date(),
//       updated_at: new Date()
//     };

//     return await repo.createUserAnalytics(userId, formattedData);
//   },

//   createAnomalyLog: async (userId, data) => {

//     console.log('=== userId:', userId);
//     console.log("=== data nhận được:", JSON.stringify(data, null, 2));

//     if (!userId) throw new Error('userId is required');
//     if (!data) throw new Error('Data is required');

  

//     const formattedData = {
//       user_id: userId,
//       type: data.type,
//       severity: data.severity,
//       description: data.description,
//       transaction_id: data.transaction_id || null,
//       category_id: data.category_id,
//       amount_flagged: Number(data.amount_flagged) || 0,
//       expected_range: data.expected_range || { min: 0, max: 0 },
//       is_read: Boolean(data.is_read) || false,
//       is_dismissed: Boolean(data.is_dismissed) || false,
//       detected_at: data.detected_at ? new Date(data.detected_at) : new Date()
//     };

//     // Validation quan trọng
//     if (!formattedData.type || !formattedData.severity || !formattedData.description) {
//       throw new Error('type, severity, description are required');
//     }

//     return await repo.createAnomalyLog(userId, formattedData);
//   },

//   createCategorySummary: async (userId, data) => {

//     // console.log('=== userId:', userId);
//     // console.log("=== data service nhận được:", JSON.stringify(data, null, 2));

//     if (!userId) throw new Error('userId is required');
//     if (!data) throw new Error('Data is required');

//     const formattedData = {
//       user_id: userId,
//       category_id: data.category_id,
//       category_name: data.category_name,
//       category_type: data.category_type || 'expense',
//       year: Number(data.year),
//       month: Number(data.month),
//       total_amount: Number(data.total_amount) || 0,
//       transaction_count: Number(data.transaction_count) || 0,
//       budget_limit: Number(data.budget_limit) || 0,
//       is_over_budget: Boolean(data.is_over_budget) || false,
//       daily_breakdown: data.daily_breakdown || [],
//       updated_at: new Date()
//     };

//     if (!formattedData.category_id || !formattedData.category_name || !formattedData.year || !formattedData.month) {
//       throw new Error('category_id, category_name, year, month are required');
//     }

//     return await repo.createCategorySummary(userId, formattedData);
//   },

//   createDashboardCache: async (userId, data) => {
//     if (!userId) throw new Error('userId is required');
//     if (!data) throw new Error('Data is required');

//     const formattedData = {
//       user_id: userId,
//       summary: data.summary || {},
//       top_categories: data.top_categories || [],
//       recent_transactions: data.recent_transactions || [],
//       streak: data.streak || { saving_months: 0, unit: "months" },
//       expires_at: data.expires_at ? new Date(data.expires_at) : new Date(Date.now() + 24 * 60 * 60 * 1000)
//     };

//     return await repo.createDashboardCache(userId, formattedData);
//   },

//   createMonthlyReport: async (userId, data) => {
//     if (!userId) throw new Error('userId is required');
//     if (!data) throw new Error('Data is required');

//     const formattedData = {
//       user_id: userId,
//       year: Number(data.year),
//       month: Number(data.month),
//       summary: data.summary || {},
//       income_by_category: data.income_by_category || [],
//       expense_by_category: data.expense_by_category || [],
//       weekly_trend: data.weekly_trend || [],
//       daily_cashflow: data.daily_cashflow || [],
//       top_expenses: data.top_expenses || [],
//       comparison: data.comparison || {},
//       ai_report: data.ai_report || { generated: false, content: null },
//       status: data.status || 'generated',
//       generated_at: data.generated_at ? new Date(data.generated_at) : new Date(),
//       updated_at: new Date()
//     };

//     if (!formattedData.year || !formattedData.month) {
//       throw new Error('year and month are required');
//     }

//     return await repo.createMonthlyReport(userId, formattedData);
//   },

//   createSpendingTrend: async (userId, data) => {
//     if (!userId) throw new Error('userId is required');
//     if (!data) throw new Error('Data is required');

//     const formattedData = {
//       category_id: data.category_id,
//       category_name: data.category_name,
//       category_type: data.category_type || 'expense',
      
//       // ← Sửa quan trọng ở đây
//       data_points: data.monthly_data || data.data_points || [],

//       avg_monthly: Number(data.avg_monthly) || 0,
//       trend: data.trend || 'stable',
//       total_months: Number(data.total_months) || 0,
//       total_transactions: Number(data.total_transactions) || 0,
//       last_updated: new Date()
//     };

//     if (!formattedData.category_id || !formattedData.category_name) {
//       throw new Error('category_id and category_name are required');
//     }

//     console.log(`=== data_points length: ${formattedData.data_points.length}`);

//     return await repo.createSpendingTrend(userId, formattedData);
//   },

//   // ==================== CREATE MANY ====================
//   createManyCategorySummary: async (dataArray) => {
//     if (!Array.isArray(dataArray) || dataArray.length === 0) {
//       throw new Error('Data array is required and cannot be empty');
//     }
//     return await repo.createManyCategorySummary(dataArray);
//   },

//   createManyMonthlyReport: async (dataArray) => {
//     if (!Array.isArray(dataArray) || dataArray.length === 0) {
//       throw new Error('Data array is required and cannot be empty');
//     }
//     return await repo.createManyMonthlyReport(dataArray);
//   }

};

module.exports = service;