'use strict';

/**
 * ============================================================
 * Model: DashboardCache
 * Collection: dashboard_cache
 * Unique key: account_id
 * TTL: 15 phút (qua field expires_at + TTL index expireAfterSeconds: 0)
 * ============================================================
 *
 * Cache dashboard nhanh cho từng ví.
 * MongoDB tự xóa document khi expires_at <= now (TTL index).
 *
 * Không bao giờ insert trực tiếp vào collection này từ phía service —
 * hãy luôn dùng DashboardCache.upsert() để đảm bảo expires_at đúng.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/** TTL mặc định: 15 phút */
const TTL_MS = 15 * 60 * 1000;

// ── Sub-schemas ───────────────────────────────────────────────

const SummarySchema = new Schema(
  {
    current_balance:  { type: Number, default: 0 },
    monthly_income:   { type: Number, default: 0 },
    monthly_expense:  { type: Number, default: 0 },
    monthly_savings:  { type: Number, default: 0 },
    savings_rate:     { type: Number, default: 0 },    // %
  },
  { _id: false }
);

const TopCategorySchema = new Schema(
  {
    category_id:   { type: String, required: true },
    category_name: { type: String, default: null },
    total_amount:  { type: Number, default: 0 },
  },
  { _id: false }
);

const RecentTransactionSchema = new Schema(
  {
    trans_id:    { type: String, required: true },
    description: { type: String, default: null },
    amount:      { type: Number, default: 0 },
    /** 'income' | 'expense' | 'saving' | 'investment' */
    type:        { type: String, default: null },
    /** Lưu dạng "YYYY-MM-DD" để tránh timezone issue khi hiển thị */
    date:        { type: String, default: null },
    category_id: { type: String, default: null },
  },
  { _id: false }
);

const StreakSchema = new Schema(
  {
    saving_months: { type: Number, default: 0 },
    unit:          { type: String, default: 'months' },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────
const dashboard_cache = new Schema(
  {
    /** UUID ví — khóa unique */
    account_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /** Số liệu tổng hợp nhanh */
    summary: {
      type: SummarySchema,
      default: () => ({}),
    },

    /** Top danh mục chi tiêu tháng hiện tại */
    top_categories: {
      type: [TopCategorySchema],
      default: [],
    },

    /** 5–10 giao dịch gần nhất */
    recent_transactions: {
      type: [RecentTransactionSchema],
      default: [],
    },

    /** Streak tiết kiệm */
    streak: {
      type: StreakSchema,
      default: () => ({}),
    },

    /**
     * Thời điểm hết hạn cache.
     * MongoDB TTL index (expireAfterSeconds: 0) sẽ xóa document khi
     * expires_at <= server time.
     */
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    collection: 'dashboard_cache',
    // Không dùng timestamps để giữ schema gọn — chỉ cần expires_at
    versionKey: false,
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
dashboard_cache.index(
  { account_id: 1 },
  { unique: true, name: 'idx_account_id_unique' }
);
// TTL index — MongoDB tự xóa khi expires_at <= now
dashboard_cache.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: 'ttl_expires_at' }
);

// ── Static helpers ────────────────────────────────────────────
/**
 * Lấy cache của một ví. Trả về null nếu không có hoặc đã hết hạn.
 * @param {string} accountId
 * @returns {Promise<DashboardCache|null>}
 */
dashboard_cache.statics.findByAccount = function (accountId) {
  return this.findOne({
    account_id: accountId,
    expires_at: { $gt: new Date() },
  });
};

/**
 * Upsert cache cho một ví với TTL mặc định (15 phút).
 * @param {string} accountId
 * @param {object} payload  — { summary, top_categories, recent_transactions, streak }
 * @param {number} [ttlMs]  — TTL tùy chỉnh (ms), mặc định 15 phút
 * @returns {Promise<DashboardCache>}
 */
dashboard_cache.statics.upsert = function (accountId, payload, ttlMs = TTL_MS) {
  const expires_at = new Date(Date.now() + ttlMs);
  return this.findOneAndUpdate(
    { account_id: accountId },
    { $set: { ...payload, expires_at } },
    { new: true, upsert: true }
  );
};

/**
 * Xóa cache của một ví (invalidate ngay lập tức).
 * @param {string} accountId
 */
dashboard_cache.statics.invalidate = function (accountId) {
  return this.deleteOne({ account_id: accountId });
};

/**
 * Xóa cache của nhiều ví cùng lúc.
 * @param {string[]} accountIds
 */
dashboard_cache.statics.invalidateMany = function (accountIds) {
  return this.deleteMany({ account_id: { $in: accountIds } });
};


module.exports = mongoose.model('DashboardCache', dashboard_cache);
