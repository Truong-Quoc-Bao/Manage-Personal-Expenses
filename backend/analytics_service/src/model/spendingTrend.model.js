'use strict';

/**
 * ============================================================
 * Model: SpendingTrend
 * Collection: spending_trends
 * Unique key: (account_id, category_id)
 * ============================================================
 *
 * Xu hướng chi tiêu theo tháng cho từng cặp (ví, danh mục).
 * monthly_data: mảng { year, month, amount } toàn bộ lịch sử.
 * Được dùng để vẽ biểu đồ đường cho từng category.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────

const MonthlyDataSchema = new Schema(
  {
    year:   { type: Number, required: true },
    month:  { type: Number, required: true, min: 1, max: 12 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

/** Thống kê tổng hợp từ monthly_data (tính sẵn để tránh aggregate) */
const StatsSchema = new Schema(
  {
    total_amount: { type: Number, default: 0 },
    avg_monthly:  { type: Number, default: 0 },
    max_month: {
      type: new Schema(
        {
          year:   { type: Number, default: null },
          month:  { type: Number, default: null },
          amount: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    min_month: {
      type: new Schema(
        {
          year:   { type: Number, default: null },
          month:  { type: Number, default: null },
          amount: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    last_updated: { type: Date, default: null },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────
const spending_trends = new Schema(
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

    /** Dữ liệu toàn bộ lịch sử theo tháng */
    monthly_data: {
      type: [MonthlyDataSchema],
      default: [],
    },

    /** Thống kê nhanh (tính sẵn) */
    stats: {
      type: StatsSchema,
      default: () => ({}),
    },
  },
  {
    collection: 'spending_trends',
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
spending_trends.index(
  { account_id: 1, category_id: 1 },
  { unique: true, name: 'idx_account_category_trend' }
);
spending_trends.index(
  { account_id: 1, category_type: 1 },
  { name: 'idx_account_type_trend' }
);

// ── Instance methods ──────────────────────────────────────────
/**
 * Lấy amount của một tháng cụ thể.
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
spending_trends.methods.getMonthAmount = function (year, month) {
  const entry = this.monthly_data.find((d) => d.year === year && d.month === month);
  return entry ? entry.amount : 0;
};

/**
 * Cập nhật (upsert) amount cho một tháng trong monthly_data.
 * Không gọi save — gọi riêng sau nếu cần.
 * @param {number} year
 * @param {number} month
 * @param {number} amount
 */
spending_trends.methods.setMonthAmount = function (year, month, amount) {
  const idx = this.monthly_data.findIndex((d) => d.year === year && d.month === month);
  if (idx >= 0) {
    this.monthly_data[idx].amount = amount;
  } else {
    this.monthly_data.push({ year, month, amount });
    this.monthly_data.sort((a, b) => a.year - b.year || a.month - b.month);
  }
  this.markModified('monthly_data');
};

// ── Static helpers ────────────────────────────────────────────
/**
 * Lấy tất cả trends của một account, sắp xếp theo category_type.
 * @param {string} accountId
 */
spending_trends.statics.findByAccount = function (accountId) {
  return this.find({ account_id: accountId }).sort({ category_type: 1, category_name: 1 });
};

/**
 * Lấy trend của một cặp (account, category).
 * @param {string} accountId
 * @param {string} categoryId
 */
spending_trends.statics.findOne_ = function (accountId, categoryId) {
  return this.findOne({ account_id: accountId, category_id: categoryId });
};

/**
 * Thêm delta vào monthly_data của một tháng (atomic update qua $inc trong array).
 * Nếu entry chưa tồn tại thì $push.
 * @param {string} accountId
 * @param {string} categoryId
 * @param {number} year
 * @param {number} month
 * @param {number} amountDelta
 */
spending_trends.statics.applyDelta = async function (
  accountId,
  categoryId,
  year,
  month,
  amountDelta
) {
  // Thử update entry đã tồn tại trong mảng
  const updated = await this.findOneAndUpdate(
    {
      account_id:  accountId,
      category_id: categoryId,
      'monthly_data.year':  year,
      'monthly_data.month': month,
    },
    { $inc: { 'monthly_data.$.amount': amountDelta } },
    { new: true }
  );

  if (updated) return updated;

  // Nếu chưa có entry tháng này thì push
  return this.findOneAndUpdate(
    { account_id: accountId, category_id: categoryId },
    { $push: { monthly_data: { year, month, amount: amountDelta } } },
    { new: true, upsert: true }
  );
};



module.exports = mongoose.model('SpendingTrend', spending_trends);
