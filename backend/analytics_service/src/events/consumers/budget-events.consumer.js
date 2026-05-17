const CategorySummary = require('../../model/categorySummary.model');
const UserAnalytics = require('../../model/userAnalytics.model');
const service = require('../../services/analytics.service.js');

// Liệt kê các (year, month) bị bao phủ bởi khoảng [dateStart..dateEnd]
// Nếu không có dateStart -> chỉ trả về tháng hiện tại để tránh ghi tràn lan.
const getCoveredMonths = (dateStart, dateEnd) => {
  const now = new Date();
  const fallback = [{ year: now.getFullYear(), month: now.getMonth() + 1 }];

  if (!dateStart) return fallback;

  const start = new Date(dateStart);
  if (Number.isNaN(start.getTime())) return fallback;

  const end = dateEnd ? new Date(dateEnd) : start;
  if (Number.isNaN(end.getTime())) return fallback;

  const months = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  const endY = end.getFullYear();
  const endM = end.getMonth();

  // Hard cap 36 tháng để tránh lặp vô hạn nếu dữ liệu lỗi
  let safety = 0;
  while ((y < endY || (y === endY && m <= endM)) && safety < 36) {
    months.push({ year: y, month: m + 1 });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    safety += 1;
  }

  return months.length > 0 ? months : fallback;
};

// Set/clear budget_limit trên category_summary cho 1 (user, category) qua nhiều tháng,
// đồng thời recompute is_over_budget = (total_amount > budget_limit && budget_limit > 0).
const applyBudgetLimitToCategorySummaries = async ({
  userId,
  categoryId,
  months,
  budgetLimit,
}) => {
  if (!userId || !categoryId || !Array.isArray(months) || months.length === 0) {
    return { matched: 0, modified: 0 };
  }

  const limit = Number(budgetLimit) || 0;
  const orFilter = months.map((m) => ({ year: m.year, month: m.month }));

  const result = await CategorySummary.updateMany(
    { user_id: userId, category_id: categoryId, $or: orFilter },
    [
      {
        $set: {
          budget_limit: limit,
          is_over_budget: {
            $cond: [
              { $and: [{ $gt: [limit, 0] }, { $gt: ['$total_amount', limit] }] },
              true,
              false,
            ],
          },
          updated_at: new Date(),
        },
      },
    ]
  );

  return {
    matched: result.matchedCount ?? result.n ?? 0,
    modified: result.modifiedCount ?? result.nModified ?? 0,
  };
};

// Đẩy 1 entry vào user_analytics.goal_tracking.goals (idempotent: pull-then-push).
const upsertGoalForBudget = async ({ userId, budget }) => {
  if (!userId || !budget?.budget_id) return null;

  const goal = {
    goal_id: budget.budget_id,
    title: budget.title || 'Budget plan',
    target_amount: Number(budget.amount_limit) || 0,
    current_amount: Number(budget.current_amount) || 0,
    deadline: budget.date_end ? new Date(budget.date_end) : null,
    status: 'in_progress',
    note: null,
  };

  await UserAnalytics.updateOne(
    { user_id: userId },
    { $pull: { 'goal_tracking.goals': { goal_id: budget.budget_id } } }
  );

  return UserAnalytics.updateOne(
    { user_id: userId },
    { $push: { 'goal_tracking.goals': goal } }
  );
};

const removeGoalForBudget = async ({ userId, budgetId }) => {
  if (!userId || !budgetId) return null;
  return UserAnalytics.updateOne(
    { user_id: userId },
    { $pull: { 'goal_tracking.goals': { goal_id: budgetId } } }
  );
};

// Pull alert của 1 category trong user_analytics.budget_alert.alerts
const pullBudgetAlert = async ({ userId, categoryId }) => {
  if (!userId || !categoryId) return null;
  return UserAnalytics.updateOne(
    { user_id: userId },
    {
      $pull: { 'budget_alert.alerts': { category_id: categoryId } },
      $set: { 'budget_alert.last_checked': new Date() },
    }
  );
};

async function handleBudgetCreated(content) {
  const {
    budget_id,
    user_id,
    category_id,
    type,
    amount_limit,
    date_start,
    date_end,
  } = content || {};

  console.log(
    `[Analytics] Handling budget.created | budget_id: ${budget_id}, user_id: ${user_id}, type: ${type}`
  );

  if (!user_id || !category_id) {
    console.log('[Analytics] Skipping budget.created: missing user_id or category_id');
    return;
  }

  try {
    if (type === 'plan') {
      await upsertGoalForBudget({ userId: user_id, budget: content });
      console.log(
        `[Analytics] Pushed goal ${budget_id} into user_analytics.goal_tracking for user ${user_id}`
      );
      return;
    }

    // type === 'limit' (default)
    const months = getCoveredMonths(date_start, date_end);
    const res = await applyBudgetLimitToCategorySummaries({
      userId: user_id,
      categoryId: category_id,
      months,
      budgetLimit: amount_limit,
    });
    console.log(
      `[Analytics] category_summary budget_limit set for user=${user_id} cat=${category_id} months=${months.length} matched=${res.matched} modified=${res.modified}`
    );

    // Recompute alert tháng hiện tại dựa trên category_summary vừa cập nhật
    if (typeof service._updateBudgetAlerts === 'function') {
      await service._updateBudgetAlerts({ user_id, category_id });
    }
  } catch (err) {
    console.error('[Analytics] Error handling budget.created:', err.message);
  }
}

async function handleBudgetUpdated(content) {
  const {
    budget_id,
    user_id,
    category_id,
    type,
    amount_limit,
    date_start,
    date_end,
    old_category_id,
    old_type,
    old_date_start,
    old_date_end,
  } = content || {};

  console.log(
    `[Analytics] Handling budget.updated | budget_id: ${budget_id}, user_id: ${user_id}, type: ${type}`
  );

  if (!user_id || !category_id) {
    console.log('[Analytics] Skipping budget.updated: missing user_id or category_id');
    return;
  }

  try {
    // Nếu category_id và/hoặc type thay đổi -> dọn dấu vết cũ trước
    const categoryChanged = old_category_id && old_category_id !== category_id;
    const typeChanged = old_type && old_type !== type;

    if (old_type === 'limit' && (categoryChanged || typeChanged || type !== 'limit')) {
      const oldMonths = getCoveredMonths(old_date_start || date_start, old_date_end || date_end);
      const oldCat = old_category_id || category_id;

      await applyBudgetLimitToCategorySummaries({
        userId: user_id,
        categoryId: oldCat,
        months: oldMonths,
        budgetLimit: 0,
      });
      await pullBudgetAlert({ userId: user_id, categoryId: oldCat });
      console.log(
        `[Analytics] Cleared old limit budget footprint for user=${user_id} oldCat=${oldCat}`
      );
    }

    if (old_type === 'plan' && (typeChanged || type !== 'plan')) {
      await removeGoalForBudget({ userId: user_id, budgetId: budget_id });
      console.log(`[Analytics] Removed stale goal ${budget_id} (type changed from plan)`);
    }

    // Apply trạng thái mới
    if (type === 'plan') {
      await upsertGoalForBudget({ userId: user_id, budget: content });
      console.log(
        `[Analytics] Upserted goal ${budget_id} in user_analytics.goal_tracking for user ${user_id}`
      );
      return;
    }

    // type === 'limit'
    const months = getCoveredMonths(date_start, date_end);
    const res = await applyBudgetLimitToCategorySummaries({
      userId: user_id,
      categoryId: category_id,
      months,
      budgetLimit: amount_limit,
    });
    console.log(
      `[Analytics] category_summary budget_limit updated for user=${user_id} cat=${category_id} months=${months.length} matched=${res.matched} modified=${res.modified}`
    );

    if (typeof service._updateBudgetAlerts === 'function') {
      await service._updateBudgetAlerts({ user_id, category_id });
      if (categoryChanged) {
        await service._updateBudgetAlerts({ user_id, category_id: old_category_id });
      }
    }
  } catch (err) {
    console.error('[Analytics] Error handling budget.updated:', err.message);
  }
}

async function handleBudgetDeleted(content) {
  const {
    budget_id,
    user_id,
    category_id,
    type,
    date_start,
    date_end,
  } = content || {};

  console.log(
    `[Analytics] Handling budget.deleted | budget_id: ${budget_id}, user_id: ${user_id}, type: ${type}`
  );

  if (!user_id || !category_id) {
    console.log('[Analytics] Skipping budget.deleted: missing user_id or category_id');
    return;
  }

  try {
    if (type === 'plan') {
      await removeGoalForBudget({ userId: user_id, budgetId: budget_id });
      console.log(
        `[Analytics] Removed goal ${budget_id} from user_analytics.goal_tracking for user ${user_id}`
      );
      return;
    }

    // type === 'limit'
    const months = getCoveredMonths(date_start, date_end);
    const res = await applyBudgetLimitToCategorySummaries({
      userId: user_id,
      categoryId: category_id,
      months,
      budgetLimit: 0,
    });
    console.log(
      `[Analytics] category_summary budget_limit cleared for user=${user_id} cat=${category_id} months=${months.length} matched=${res.matched} modified=${res.modified}`
    );

    await pullBudgetAlert({ userId: user_id, categoryId: category_id });
    console.log(
      `[Analytics] Pulled budget_alert.alerts for user=${user_id} cat=${category_id}`
    );
  } catch (err) {
    console.error('[Analytics] Error handling budget.deleted:', err.message);
  }
}

module.exports = {
  handleBudgetCreated,
  handleBudgetUpdated,
  handleBudgetDeleted,
};
