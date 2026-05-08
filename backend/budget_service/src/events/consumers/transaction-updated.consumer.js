const {
  findBudgetsByUserAndCategory,
  updateBudgetCurrentAmount,
} = require("../../repositories/budget.repository");

async function handleTransactionUpdated(content, msg) {
  const {
    user_id,
    category_id,
    account_id,
    account_id_update,
    amount,
    amount_update,
    transaction_type,
    transaction_type_update,
    trans_id,
    date,
  } = content;

  console.log(`[Budget] Handling transaction.updated | trans_id: ${trans_id}`);

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

    const oldAmount = parseFloat(amount);
    const newAmount = parseFloat(amount_update) || oldAmount;

    const diff = newAmount - oldAmount;

    if (diff === 0) {
      console.log(`[Budget] No amount change, skipping`);
      return;
    }

    for (const budget of budgets) {
      const currentAmount = parseFloat(budget.current_amount) + diff;
      await updateBudgetCurrentAmount({
        budgetId: budget.budget_id,
        currentAmount: Math.max(0, currentAmount),
      });
      console.log(`[Budget] Updated budget ${budget.budget_id}: current_amount = ${currentAmount} (diff: ${diff})`);
    }
  } catch (err) {
    console.error(`[Budget] Error handling transaction.updated:`, err.message);
  }
}

module.exports = { handleTransactionUpdated };
