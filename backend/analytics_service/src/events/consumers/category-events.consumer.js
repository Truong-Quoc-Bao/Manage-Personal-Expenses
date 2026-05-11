const CategorySummary = require('../../model/categorySummary.model');
const DashboardCache = require('../../model/dashboardCache.model');
const MonthlyReport = require('../../model/monthlyReport.model');
const SpendingTrend = require('../../model/spendingTrend.model');

async function handleCategoryCreated(content, msg) {
  const { category_id, user_id, category_name, type } = content;
  console.log(`[Analytics] Handling category.created | category_id: ${category_id}, user_id: ${user_id}`);
 }

async function handleCategoryUpdated(content, msg) {
  const { category_id, user_id, category_name, type, old_category_name } = content;
  console.log(`[Analytics] Handling category.updated | category_id: ${category_id}, new_name: ${category_name}`);

  if (!category_id || !user_id) {
    console.log("[Analytics] Skipping category.updated: missing category_id or user_id");
    return;
  }

  try {
     await CategorySummary.updateMany(
      { category_id, user_id },
      { $set: { category_name, category_type: type, updated_at: new Date() } }
    );
    console.log(`[Analytics] Updated category_summary for category ${category_id}`);

     await DashboardCache.updateMany(
      { user_id, "top_categories.category_id": category_id },
      { $set: { "top_categories.$.category_name": category_name } }
    );
    console.log(`[Analytics] Updated dashboard_cache top_categories for category ${category_id}`);

     await MonthlyReport.updateMany(
      { user_id, "income_by_category.category_id": category_id },
      { $set: { "income_by_category.$.category_name": category_name } }
    );
    await MonthlyReport.updateMany(
      { user_id, "expense_by_category.category_id": category_id },
      { $set: { "expense_by_category.$.category_name": category_name } }
    );
    console.log(`[Analytics] Updated monthly_report for category ${category_id}`);

     await SpendingTrend.updateMany(
      { user_id, category_id },
      { $set: { category_name, category_type: type, updated_at: new Date() } }
    );
    console.log(`[Analytics] Updated spending_trends for category ${category_id}`);

  } catch (err) {
    console.error(`[Analytics] Error handling category.updated:`, err.message);
  }
}

async function handleCategoryDeleted(content, msg) {
  const { category_id, user_id, category_name, type } = content;
  console.log(`[Analytics] Handling category.deleted | category_id: ${category_id}, user_id: ${user_id}`);

  if (!category_id || !user_id) {
    console.log("[Analytics] Skipping category.deleted: missing category_id or user_id");
    return;
  }

  try {
     await CategorySummary.deleteMany({ category_id, user_id });
    console.log(`[Analytics] Deleted category_summary docs for category ${category_id}`);

     await DashboardCache.updateMany(
      { user_id },
      { $pull: { top_categories: { category_id } } }
    );
    console.log(`[Analytics] Removed category ${category_id} from dashboard_cache top_categories`);

     await MonthlyReport.updateMany(
      { user_id },
      {
        $pull: {
          income_by_category: { category_id },
          expense_by_category: { category_id },
        }
      }
    );
    console.log(`[Analytics] Removed category ${category_id} from monthly_report`);

     await SpendingTrend.deleteMany({ user_id, category_id });
    console.log(`[Analytics] Deleted spending_trends for category ${category_id}`);

  } catch (err) {
    console.error(`[Analytics] Error handling category.deleted:`, err.message);
  }
}

module.exports = {
  handleCategoryCreated,
  handleCategoryUpdated,
  handleCategoryDeleted,
};
