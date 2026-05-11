'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

 const accounts = new Schema(
  {
     user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

     user_name: {
      type: String,
      required: true,
      trim: true,
    },

     email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

     birth: {
      type: String,
      default: null,
    },

     telegram_id: {
      type: Schema.Types.Mixed,
      default: null,
    },

    account_id: {
      type: [String],
      default: [],
    },
  },
  {
    collection: 'accounts',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

 accounts.index({ user_id: 1 }, { unique: true, name: 'idx_user_id_unique' });
accounts.index({ email: 1 },   { unique: true, name: 'idx_email_unique' });
accounts.index({ account_id: 1 }, { name: 'idx_account_id' });

 
accounts.virtual('account_count').get(function () {
  return this.account_id?.length ?? 0;
});

// ── Static helpers ────────────────────────────────────────────
/**
 * Tìm user theo user_id (UUID string).
 * @param {string} userId
 * @returns {Promise<Account|null>}
 */
accounts.statics.findByUserId = function (userId) {
  return this.findOne({ user_id: userId });
};

/**
 * Tìm user sở hữu một account_id cụ thể.
 * @param {string} accountId
 * @returns {Promise<Account|null>}
 */
accounts.statics.findByAccountId = function (accountId) {
  return this.findOne({ account_id: accountId });
};

/**
 * Thêm một account_id mới vào mảng của user.
 * @param {string} userId
 * @param {string} accountId
 */
accounts.statics.addAccount = function (userId, accountId) {
  return this.findOneAndUpdate(
    { user_id: userId },
    { $addToSet: { account_id: accountId } },
    { new: true }
  );
};



module.exports = mongoose.model('Account', accounts);
