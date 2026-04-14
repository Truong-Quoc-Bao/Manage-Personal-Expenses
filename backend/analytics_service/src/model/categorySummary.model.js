'use strict';

/**
 * ============================================================
 * Model: CategorySummary
 * Collection: category_summary
 * Unique key: (account_id, category_id, year, month)
 * ============================================================
 *
 * Tổng hợp chi tiêu theo danh mục, theo tháng, cho từng ví.
 * daily_breakdown: mảng { day, amount } — số ngày có giao dịch.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────

const DailyBreakdownSchema = new Schema(
  {
    day:    { type: Number, required: true },   // 1–31
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────
const category_summary = new Schema(
  {
    /** UUID ví */
    account_id: {
      type: String,
      required: true,
      trim: true,
    },

    /** UUID danh mục */
    category_id: {
      type: String,
      required: true,
      trim: true,
    },

    /** Tên danh mục (denormalized) */
    category_name: {
      type: String,
      default: null,
    },

    /** Loại danh mục */
    category_type: {
      type: String,
      enum: ['income', 'expense', 'saving', 'investment'],
      default: 'expense',
    },

    /** Năm (YYYY) */
    year: {
      type: Number,
      required: true,
    },

    /** Tháng (1–12) */
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    /** Tổng tiền trong tháng */
    total_amount: {
      type: Number,
      default: 0,
    },

    /** Số lượng giao dịch trong tháng */
    transaction_count: {
      type: Number,
      default: 0,
    },

    /** Hạn mức ngân sách (0 = không đặt) */
    budget_limit: {
      type: Number,
      default: 0,
    },

    /** true nếu total_amount > budget_limit (và budget_limit > 0) */
    is_over_budget: {
      type: Boolean,
      default: false,
    },

    /** Breakdown chi tiêu theo từng ngày trong tháng */
    daily_breakdown: {
      type: [DailyBreakdownSchema],
      default: [],
    },
  },
  {
    collection: 'category_summary',
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
category_summary.index(
  { account_id: 1, year: -1, month: -1 },
  { name: 'idx_account_month' }
);
category_summary.index(
  { account_id: 1, category_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_account_category_month' }
);
category_summary.index(
  { account_id: 1, category_type: 1, year: -1, month: -1 },
  { name: 'idx_account_type_month' }
);
category_summary.index(
  { is_over_budget: 1, account_id: 1 },
  { name: 'idx_over_budget' }
);

// ── Middleware ────────────────────────────────────────────────
/** Tự động cập nhật is_over_budget trước khi lưu */
category_summary.pre('save', function (next) {
  if (this.budget_limit > 0) {
    this.is_over_budget = this.total_amount > this.budget_limit;
  } else {
    this.is_over_budget = false;
  }
  next();
});

// ── Static helpers ────────────────────────────────────────────
/**
 * Lấy tất cả summary của một account trong một tháng.
 * @param {string} accountId
 * @param {number} year
 * @param {number} month
 */
category_summary.statics.findByAccountMonth = function (accountId, year, month) {
  return this.find({ account_id: accountId, year, month }).sort({ total_amount: -1 });
};

/**
 * Lấy summary theo account + category + khoảng thời gian (nhiều tháng).
 * @param {string} accountId
 * @param {string} categoryId
 * @param {number} fromYear
 * @param {number} fromMonth
 * @param {number} toYear
 * @param {number} toMonth
 */
category_summary.statics.findTrend = function (
  accountId,
  categoryId,
  fromYear,
  fromMonth,
  toYear,
  toMonth
) {
  return this.find({
    account_id:  accountId,
    category_id: categoryId,
    $or: [
      { year: { $gt: fromYear, $lt: toYear } },
      { year: fromYear, month: { $gte: fromMonth } },
      { year: toYear,   month: { $lte: toMonth } },
    ],
  }).sort({ year: 1, month: 1 });
};

/**
 * Lấy danh sách danh mục vượt budget của một account.
 * @param {string} accountId
 */
category_summary.statics.findOverBudget = function (accountId) {
  return this.find({ account_id: accountId, is_over_budget: true }).sort({ year: -1, month: -1 });
};

/**
 * Upsert (update or insert) một category summary.
 * Dùng sau khi có giao dịch mới.
 * @param {string} accountId
 * @param {string} categoryId
 * @param {number} year
 * @param {number} month
 * @param {{ amountDelta: number, countDelta: number }} delta
 */
category_summary.statics.applyTransactionDelta = function (
  accountId,
  categoryId,
  year,
  month,
  { amountDelta, countDelta }
) {
  return this.findOneAndUpdate(
    { account_id: accountId, category_id: categoryId, year, month },
    {
      $inc: {
        total_amount:      amountDelta,
        transaction_count: countDelta,
      },
    },
    { new: true, upsert: true }
  );
};

module.exports = mongoose.model('CategorySummary', category_summary);
