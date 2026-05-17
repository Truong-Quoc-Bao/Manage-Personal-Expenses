const UserAnalytics = require('../../model/userAnalytics.model');
const DashboardCache = require('../../model/dashboardCache.model');
const CategorySummary = require('../../model/categorySummary.model');
const SpendingTrend = require('../../model/spendingTrend.model');

async function handleAccountCreated(content, msg) {
  const { account_id, user_id, account_name } = content;
  console.log(`[Analytics] Handling account.created | account_id: ${account_id}, user_id: ${user_id}`);

  if (!account_id || !user_id) {
    console.log("[Analytics] Skipping account.created: missing account_id or user_id");
    return;
  }

  try {
    const result = await UserAnalytics.findOneAndUpdate(
      { user_id },
      { $addToSet: { account_id: account_id } },
      { new: true }
    );

    if (result) {
      console.log(`[Analytics] Added account_id ${account_id} to user_analytics for user ${user_id}`);
    } else {
      console.log(`[Analytics] user_analytics not found for user ${user_id}, skipping`);
    }
  } catch (err) {
    console.error(`[Analytics] Error handling account.created:`, err.message);
  }
}

async function handleAccountDeleted(content, msg) {
  const { account_id, user_id } = content;
  console.log(`[Analytics] Handling account.deleted | account_id: ${account_id}, user_id: ${user_id}`);

  if (!account_id || !user_id) {
    console.log("[Analytics] Skipping account.deleted: missing account_id or user_id");
    return;
  }

  try {
    // 1. Gỡ account_id khỏi user_analytics.account_id[]
    const result = await UserAnalytics.findOneAndUpdate(
      { user_id },
      { $pull: { account_id: account_id } },
      { new: true }
    );

    if (result) {
      console.log(`[Analytics] Removed account_id ${account_id} from user_analytics for user ${user_id}`);
    } else {
      console.log(`[Analytics] user_analytics not found for user ${user_id}, skipping`);
    }

    // 2. Cleanup các collection có field account_id (tránh document mồ côi)
    const [dcRes, csRes, stRes] = await Promise.allSettled([
      DashboardCache.deleteMany({ account_id }),
      CategorySummary.deleteMany({ account_id }),
      SpendingTrend.deleteMany({ account_id }),
    ]);

    if (dcRes.status === 'fulfilled') {
      console.log(`[Analytics] Deleted ${dcRes.value?.deletedCount ?? 0} dashboard_cache docs for account ${account_id}`);
    } else {
      console.error(`[Analytics] dashboard_cache cleanup error:`, dcRes.reason?.message);
    }
    if (csRes.status === 'fulfilled') {
      console.log(`[Analytics] Deleted ${csRes.value?.deletedCount ?? 0} category_summary docs for account ${account_id}`);
    } else {
      console.error(`[Analytics] category_summary cleanup error:`, csRes.reason?.message);
    }
    if (stRes.status === 'fulfilled') {
      console.log(`[Analytics] Deleted ${stRes.value?.deletedCount ?? 0} spending_trends docs for account ${account_id}`);
    } else {
      console.error(`[Analytics] spending_trends cleanup error:`, stRes.reason?.message);
    }

    // 3. Sau khi xoá cache, recompute top_account_id cho các cache còn lại của user
    try {
      const remaining = await DashboardCache.find({ user_id }).lean();
      if (Array.isArray(remaining) && remaining.length > 0) {
        let topAccountId = null;
        let maxExpense = -1;
        for (const c of remaining) {
          const exp = Number(c?.summary?.monthly_expense || 0);
          if (exp > maxExpense) {
            maxExpense = exp;
            topAccountId = c.account_id;
          }
        }
        if (topAccountId) {
          await DashboardCache.updateMany(
            { user_id },
            { $set: { top_account_id: topAccountId } }
          );
          console.log(`[Analytics] Recomputed top_account_id=${topAccountId} for user ${user_id}`);
        }
      }
    } catch (err) {
      console.warn(`[Analytics] Recompute top_account_id failed:`, err.message);
    }
  } catch (err) {
    console.error(`[Analytics] Error handling account.deleted:`, err.message);
  }
}

module.exports = {
  handleAccountCreated,
  handleAccountDeleted,
};
