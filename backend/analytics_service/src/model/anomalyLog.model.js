'use strict';

/**
 * ============================================================
 * Model: AnomalyLog
 * Collection: anomaly_logs
 * Key: account_id + detected_at (không có unique key riêng)
 * TTL: 1 năm (365 ngày, qua TTL index trên detected_at)
 * ============================================================
 *
 * Ghi nhận các bất thường tài chính được phát hiện tự động:
 *   - category_spike    : danh mục tăng đột biến so với tháng trước
 *   - unusual_amount    : giao dịch đơn lẻ quá lớn
 *   - unusual_frequency : tần suất giao dịch bất thường
 *   - income_drop       : thu nhập giảm mạnh
 *   - recurring_missed  : khoản định kỳ bị bỏ qua
 *
 * MongoDB tự xóa log sau 1 năm kể từ detected_at (TTL index).
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Enums ─────────────────────────────────────────────────────
const ANOMALY_TYPES = [
  'unusual_amount',
  'unusual_frequency',
  'category_spike',
  'income_drop',
  'recurring_missed',
];

const SEVERITY_LEVELS = ['low', 'medium', 'high'];

// ── Sub-schemas ───────────────────────────────────────────────

/** Khoảng giá trị kỳ vọng dùng để phát hiện bất thường */
const ExpectedRangeSchema = new Schema(
  {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────
const anomaly_logs = new Schema(
  {
    /** UUID ví bị phát hiện bất thường */
    account_id: {
      type: String,
      required: true,
      trim: true,
    },

    /** Loại bất thường */
    type: {
      type: String,
      enum: ANOMALY_TYPES,
      required: true,
    },

    /** Mức độ nghiêm trọng */
    severity: {
      type: String,
      enum: SEVERITY_LEVELS,
      default: 'medium',
    },

    /** Mô tả chi tiết (tự sinh hoặc AI) */
    description: {
      type: String,
      default: null,
    },

    /**
     * UUID giao dịch liên quan (nếu có).
     * Dùng Mixed vì có thể null hoặc mảng UUID.
     */
    transaction_id: {
      type: Schema.Types.Mixed,
      default: null,
    },

    /** UUID danh mục liên quan (nếu có) */
    category_id: {
      type: Schema.Types.Mixed,
      default: null,
    },

    /** Số tiền bị đánh dấu bất thường */
    amount_flagged: {
      type: Number,
      default: null,
    },

    /** Khoảng kỳ vọng bình thường */
    expected_range: {
      type: ExpectedRangeSchema,
      default: () => ({}),
    },

    /** User đã đọc thông báo chưa */
    is_read: {
      type: Boolean,
      default: false,
    },

    /** User đã dismiss thông báo chưa */
    is_dismissed: {
      type: Boolean,
      default: false,
    },

    /**
     * Thời điểm phát hiện.
     * TTL index sẽ xóa document sau 365 ngày kể từ đây.
     */
    detected_at: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    collection: 'anomaly_logs',
    versionKey: false,
    // Không dùng timestamps — detected_at đóng vai trò created_at
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
anomaly_logs.index(
  { account_id: 1, detected_at: -1 },
  { name: 'idx_account_detected' }
);
anomaly_logs.index(
  { account_id: 1, is_read: 1 },
  { name: 'idx_account_unread' }
);
anomaly_logs.index(
  { account_id: 1, severity: 1, detected_at: -1 },
  { name: 'idx_account_severity' }
);
// TTL — tự xóa sau 1 năm
anomaly_logs.index(
  { detected_at: 1 },
  { expireAfterSeconds: 31_536_000, name: 'ttl_anomaly_1yr' }
);

// ── Static helpers ────────────────────────────────────────────
/**
 * Lấy tất cả log chưa đọc của một ví.
 * @param {string} accountId
 */
anomaly_logs.statics.findUnread = function (accountId) {
  return this.find({ account_id: accountId, is_read: false, is_dismissed: false })
    .sort({ detected_at: -1 });
};

/**
 * Lấy log theo severity của một ví.
 * @param {string} accountId
 * @param {'low'|'medium'|'high'} severity
 */
anomaly_logs.statics.findBySeverity = function (accountId, severity) {
  return this.find({ account_id: accountId, severity }).sort({ detected_at: -1 });
};

/**
 * Lấy N log gần nhất của một ví.
 * @param {string} accountId
 * @param {number} limit
 */
anomaly_logs.statics.findRecent = function (accountId, limit = 20) {
  return this.find({ account_id: accountId })
    .sort({ detected_at: -1 })
    .limit(limit);
};

/**
 * Đánh dấu tất cả log chưa đọc của một ví là đã đọc.
 * @param {string} accountId
 */
anomaly_logs.statics.markAllRead = function (accountId) {
  return this.updateMany(
    { account_id: accountId, is_read: false },
    { $set: { is_read: true } }
  );
};

/**
 * Dismiss một log cụ thể.
 * @param {string} logId  — _id (ObjectId string)
 */
anomaly_logs.statics.dismiss = function (logId) {
  return this.findByIdAndUpdate(
    logId,
    { $set: { is_dismissed: true, is_read: true } },
    { new: true }
  );
};

/**
 * Đếm số log chưa đọc của một ví.
 * @param {string} accountId
 * @returns {Promise<number>}
 */
anomaly_logs.statics.countUnread = function (accountId) {
  return this.countDocuments({ account_id: accountId, is_read: false, is_dismissed: false });
};


module.exports = mongoose.model('AnomalyLog', anomaly_logs);
