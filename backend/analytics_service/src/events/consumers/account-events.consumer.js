const UserAnalytics = require('../../model/userAnalytics.model');

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
  } catch (err) {
    console.error(`[Analytics] Error handling account.deleted:`, err.message);
  }
}

module.exports = {
  handleAccountCreated,
  handleAccountDeleted,
};
