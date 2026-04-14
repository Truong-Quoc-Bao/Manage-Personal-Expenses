'use strict';

/**
 * ============================================================
 * Model: Account
 * Collection: accounts
 * Key: user_id (string UUID, unique)
 * ============================================================
 *
 * Một user có thể sở hữu nhiều account (ví).
 * account_id[] là mảng các UUID ví thuộc về user này.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Schema ────────────────────────────────────────────────────
const accounts = new Schema(
  {
    /** UUID của user — khóa chính nghiệp vụ */
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /** Họ tên đầy đủ */
    user_name: {
      type: String,
      required: true,
      trim: true,
    },

    /** Email — unique */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /** Ngày sinh dạng "YYYY-MM-DD" */
    birth: {
      type: String,
      default: null,
    },

    /** Telegram chat_id (null nếu chưa liên kết) */
    telegram_id: {
      type: Schema.Types.Mixed,
      default: null,
    },

    /**
     * Mảng UUID của các ví (account) thuộc user này.
     * Mỗi phần tử tương ứng với account_id trong các collection khác.
     */
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

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
accounts.index({ user_id: 1 }, { unique: true, name: 'idx_user_id_unique' });
accounts.index({ email: 1 },   { unique: true, name: 'idx_email_unique' });
accounts.index({ account_id: 1 }, { name: 'idx_account_id' });

// ── Virtuals ──────────────────────────────────────────────────
/** Số lượng ví thuộc user */
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
