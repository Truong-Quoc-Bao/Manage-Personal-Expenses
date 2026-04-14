'use strict';

/**
 * ============================================================
 * Model: Transaction
 * Collection: transactions
 * Key: trans_id (string UUID, unique)
 * ============================================================
 *
 * Mỗi giao dịch thuộc về một account (ví) cụ thể.
 * transaction_type: 'income' | 'expense' | 'saving' | 'investment'
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Enums ─────────────────────────────────────────────────────
const TRANSACTION_TYPES = ['income', 'expense', 'saving', 'investment'];

// ── Schema ────────────────────────────────────────────────────
const transactions = new Schema(
  {
    /** UUID giao dịch — khóa chính nghiệp vụ */
    trans_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /** UUID ví chứa giao dịch */
    account_id: {
      type: String,
      required: true,
      trim: true,
    },

    /** UUID danh mục (category), nullable */
    category_id: {
      type: String,
      default: null,
      trim: true,
    },

    /** Số tiền (VND) — luôn dương, chiều giao dịch do transaction_type quyết định */
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /** Loại giao dịch */
    transaction_type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },

    /** Mô tả ngắn (tên cửa hàng, nội dung chi tiêu…) */
    description: {
      type: String,
      default: null,
      trim: true,
    },

    /** Ngày thực hiện giao dịch (Date, không có giờ phút) */
    date: {
      type: Date,
      required: true,
    },

    /** Ghi chú tự do của user — có thể là String hoặc bất kỳ kiểu gì */
    note: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    collection: 'transactions',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
transactions.index({ trans_id: 1 }, { unique: true, name: 'idx_trans_id_unique' });
transactions.index({ account_id: 1, date: -1 }, { name: 'idx_account_date' });
transactions.index(
  { account_id: 1, category_id: 1, date: -1 },
  { name: 'idx_account_category_date' }
);
transactions.index(
  { account_id: 1, transaction_type: 1, date: -1 },
  { name: 'idx_account_type_date' }
);

// ── Static helpers ────────────────────────────────────────────
/**
 * Lấy danh sách giao dịch của một account, sắp xếp mới nhất trước.
 * @param {string} accountId
 * @param {{ limit?: number, skip?: number }} opts
 */
transactions.statics.findByAccount = function (accountId, { limit = 20, skip = 0 } = {}) {
  return this.find({ account_id: accountId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Lấy giao dịch theo account + khoảng thời gian.
 * @param {string} accountId
 * @param {Date} from
 * @param {Date} to
 */
transactions.statics.findByAccountAndDateRange = function (accountId, from, to) {
  return this.find({
    account_id: accountId,
    date: { $gte: from, $lte: to },
  }).sort({ date: -1 });
};

/**
 * Lấy giao dịch theo account + category.
 * @param {string} accountId
 * @param {string} categoryId
 */
transactions.statics.findByAccountAndCategory = function (accountId, categoryId) {
  return this.find({ account_id: accountId, category_id: categoryId }).sort({ date: -1 });
};

/**
 * Tổng hợp thu/chi theo tháng cho một account.
 * @param {string} accountId
 * @param {number} year
 * @param {number} month  (1–12)
 * @returns {Promise<{ _id: string, total: number }[]>}
 */
transactions.statics.sumByTypeForMonth = function (accountId, year, month) {
  const from = new Date(year, month - 1, 1);
  const to   = new Date(year, month, 1);
  return this.aggregate([
    { $match: { account_id: accountId, date: { $gte: from, $lt: to } } },
    { $group: { _id: '$transaction_type', total: { $sum: '$amount' } } },
  ]);
};



module.exports = mongoose.model('Transaction', transactions);
