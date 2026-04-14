'use strict';

/**
 * ============================================================
 * Model: MonthlyReport
 * Collection: monthly_reports
 * Unique key: (account_id, year, month)
 * ============================================================
 *
 * Báo cáo tổng hợp thu/chi theo tháng cho một ví.
 * Bao gồm: income/expense by category, weekly trend,
 *           daily cashflow, top expenses, so sánh với tháng trước,
 *           AI report.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────

/** { category_id, category_name, amount } */
const CategoryAmountSchema = new Schema(
  {
    category_id:   { type: String, required: true },
    category_name: { type: String, default: null },
    amount:        { type: Number, default: 0 },
  },
  { _id: false }
);

/** { week, income, expense } */
const WeeklyTrendSchema = new Schema(
  {
    week:    { type: Number, required: true },  // 1–5
    income:  { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
  },
  { _id: false }
);

/** { day, income, expense } */
const DailyCashflowSchema = new Schema(
  {
    day:     { type: Number, required: true },  // 1–31
    income:  { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
  },
  { _id: false }
);

/** Top expense item */
const TopExpenseSchema = new Schema(
  {
    trans_id:    { type: String, required: true },
    description: { type: String, default: null },
    amount:      { type: Number, default: 0 },
    category_id: { type: String, default: null },
    date:        { type: Date, default: null },
  },
  { _id: false }
);

/** Summary tổng */
const SummarySchema = new Schema(
  {
    total_income:      { type: Number, default: 0 },
    total_expense:     { type: Number, default: 0 },
    savings:           { type: Number, default: 0 },
    savings_rate:      { type: Number, default: 0 },  // %
    transaction_count: { type: Number, default: 0 },
  },
  { _id: false }
);

/** So sánh với tháng trước */
const ComparisonSchema = new Schema(
  {
    prev_income:        { type: Number, default: null },
    prev_expense:       { type: Number, default: null },
    income_change_pct:  { type: Number, default: null },
    expense_change_pct: { type: Number, default: null },
  },
  { _id: false }
);

/** AI report (text + metadata) */
const AiReportSchema = new Schema(
  {
    generated:    { type: Boolean, default: false },
    content:      { type: Schema.Types.Mixed, default: null },
    generated_at: { type: Date, default: null },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────
const monthly_reports = new Schema(
  {
    /** UUID ví */
    account_id: {
      type: String,
      required: true,
      trim: true,
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

    /** Tóm tắt thu/chi/tiết kiệm */
    summary: {
      type: SummarySchema,
      default: () => ({}),
    },

    /** Thu theo danh mục */
    income_by_category: {
      type: [CategoryAmountSchema],
      default: [],
    },

    /** Chi theo danh mục */
    expense_by_category: {
      type: [CategoryAmountSchema],
      default: [],
    },

    /** Xu hướng theo tuần */
    weekly_trend: {
      type: [WeeklyTrendSchema],
      default: [],
    },

    /** Dòng tiền theo ngày */
    daily_cashflow: {
      type: [DailyCashflowSchema],
      default: [],
    },

    /** Top 5–10 giao dịch lớn nhất */
    top_expenses: {
      type: [TopExpenseSchema],
      default: [],
    },

    /** So sánh với tháng liền trước */
    comparison: {
      type: ComparisonSchema,
      default: () => ({}),
    },

    /** Báo cáo AI */
    ai_report: {
      type: AiReportSchema,
      default: () => ({}),
    },

    /** Trạng thái báo cáo */
    status: {
      type: String,
      enum: ['draft', 'generated', 'reviewed'],
      default: 'draft',
    },

    /** Thời điểm generate xong */
    generated_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'monthly_reports',
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
monthly_reports.index(
  { account_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_account_year_month' }
);
monthly_reports.index({ generated_at: -1 }, { name: 'idx_generated_at' });
monthly_reports.index({ status: 1, account_id: 1 }, { name: 'idx_status_account' });

// ── Static helpers ────────────────────────────────────────────
/**
 * Lấy báo cáo theo account + tháng.
 */
monthly_reports.statics.findByAccountMonth = function (accountId, year, month) {
  return this.findOne({ account_id: accountId, year, month });
};

/**
 * Lấy N tháng gần nhất của một account.
 * @param {string} accountId
 * @param {number} limit
 */
monthly_reports.statics.findRecent = function (accountId, limit = 6) {
  return this.find({ account_id: accountId })
    .sort({ year: -1, month: -1 })
    .limit(limit);
};

/**
 * Đánh dấu report là 'generated' và set generated_at.
 */
monthly_reports.statics.markGenerated = function (accountId, year, month) {
  return this.findOneAndUpdate(
    { account_id: accountId, year, month },
    { $set: { status: 'generated', generated_at: new Date() } },
    { new: true }
  );
};

module.exports = mongoose.model('MonthlyReport', monthly_reports);
