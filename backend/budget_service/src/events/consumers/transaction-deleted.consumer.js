const {
  findBudgetsByUserAndCategory,
  updateBudgetCurrentAmount,
} = require("../../repositories/budget.repository");

async function handleTransactionDeleted(content, msg) {
  const { user_id, category_id, amount, transaction_type, trans_id, date } = content;

  console.log(`[Budget] Handling transaction.deleted | trans_id: ${trans_id}, category: ${category_id}`);

  if (!category_id || !user_id) {
    console.log("[Budget] Skipping: missing category_id or user_id");
    return;
  }

  try {
    const budgets = await findBudgetsByUserAndCategory({
      userId: user_id,
      categoryId: category_id,
      date: date || new Date().toISOString(),
    });

    if (!budgets || budgets.length === 0) {
      console.log(`[Budget] No matching budgets for category ${category_id}`);
      return;
    }

    for (const budget of budgets) {
      const currentAmount = parseFloat(budget.current_amount) - parseFloat(amount);
      await updateBudgetCurrentAmount({
        budgetId: budget.budget_id,
        currentAmount: Math.max(0, currentAmount),
      });
      console.log(`[Budget] Updated budget ${budget.budget_id}: current_amount = ${currentAmount}`);
    }
  } catch (err) {
    console.error(`[Budget] Error handling transaction.deleted:`, err.message);
  }
}

module.exports = { handleTransactionDeleted };
