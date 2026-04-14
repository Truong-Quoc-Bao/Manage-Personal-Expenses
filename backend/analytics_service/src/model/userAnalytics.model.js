'use strict';

/**
 * ============================================================
 * Model: UserAnalytics
 * Collection: user_analytics
 * Key: user_id (string UUID, unique)
 * ============================================================
 *
 * Tổng hợp phân tích toàn bộ các ví của một user:
 *   - Tổng thu / chi / số dư
 *   - Dữ liệu tháng hiện tại
 *   - Top danh mục
 *   - AI insights, budget alerts, goal tracking, streak
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────

const CurrentMonthSchema = new Schema(
  {
    year:         { type: Number, default: null },
    month:        { type: Number, default: null },   // 1–12
    income:       { type: Number, default: 0 },
    expense:      { type: Number, default: 0 },
    savings:      { type: Number, default: 0 },
    savings_rate: { type: Number, default: 0 },      // %
  },
  { _id: false }
);

const TopCategorySchema = new Schema(
  {
    category_id:   { type: String, required: true },
    category_name: { type: String, required: true },
    total_amount:  { type: Number, default: 0 },
  },
  { _id: false }
);

const AiInsightsSchema = new Schema(
  {
    generated:     { type: Boolean, default: false },
    content:       { type: Schema.Types.Mixed, default: null },
    generated_at:  { type: Date, default: null },
  },
  { _id: false }
);

const BudgetAlertItemSchema = new Schema(
  {
    category_id:   { type: String, required: true },
    category_name: { type: String, required: true },
    budget_limit:  { type: Number, default: 0 },
    current_spent: { type: Number, default: 0 },
    percent_used:  { type: Number, default: 0 },
    /** 'ok' | 'warning' | 'exceeded' */
    status:        { type: String, enum: ['ok', 'warning', 'exceeded'], default: 'ok' },
    alerted_at:    { type: Date, default: null },
  },
  { _id: false }
);

const BudgetAlertSchema = new Schema(
  {
    enabled:      { type: Boolean, default: true },
    alerts:       { type: [BudgetAlertItemSchema], default: [] },
    last_checked: { type: Date, default: null },
  },
  { _id: false }
);

const GoalSchema = new Schema(
  {
    goal_id:        { type: String, required: true },
    title:          { type: String, required: true },
    target_amount:  { type: Number, default: 0 },
    current_amount: { type: Number, default: 0 },
    deadline:       { type: Date, default: null },
    /** 'not_started' | 'in_progress' | 'completed' | 'cancelled' */
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started',
    },
    note: { type: String, default: null },
  },
  { _id: false }
);

const GoalTrackingSchema = new Schema(
  {
    goals: { type: [GoalSchema], default: [] },
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
const user_analytics = new Schema(
  {
    /** UUID user — khóa chính nghiệp vụ */
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /** Tên hiển thị (copy từ accounts để tránh join) */
    display_name: {
      type: String,
      default: null,
    },

    /** Danh sách UUID ví thuộc user */
    account_id: {
      type: [String],
      default: [],
    },

    /** Tổng thu từ tất cả ví, từ đầu */
    total_income: { type: Number, default: 0 },

    /** Tổng chi từ tất cả ví, từ đầu */
    total_expense: { type: Number, default: 0 },

    /** Số dư hiện tại (total_income - total_expense) */
    current_balance: { type: Number, default: 0 },

    /** Thống kê tháng hiện tại */
    current_month: { type: CurrentMonthSchema, default: () => ({}) },

    /** Top danh mục theo tổng chi */
    top_categories: { type: [TopCategorySchema], default: [] },

    /** AI-generated insights */
    ai_insights: { type: AiInsightsSchema, default: () => ({}) },

    /** Cảnh báo ngân sách */
    budget_alert: { type: BudgetAlertSchema, default: () => ({}) },

    /** Theo dõi mục tiêu tài chính */
    goal_tracking: { type: GoalTrackingSchema, default: () => ({}) },

    /** Streak tiết kiệm liên tiếp */
    streak: { type: StreakSchema, default: () => ({}) },
  },
  {
    collection: 'user_analytics',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// ── Indexes (mirrors init_mongo.js) ──────────────────────────
user_analytics.index({ user_id: 1 }, { unique: true, name: 'idx_user_id_unique' });
user_analytics.index(
  { 'current_month.year': 1, 'current_month.month': 1 },
  { name: 'idx_current_month' }
);
user_analytics.index({ updated_at: -1 }, { name: 'idx_updated_at' });

// ── Static helpers ────────────────────────────────────────────
/**
 * Tìm analytics theo user_id.
 * @param {string} userId
 */
user_analytics.statics.findByUserId = function (userId) {
  return this.findOne({ user_id: userId });
};

/**
 * Cập nhật số dư tổng (dùng sau khi thêm/xóa transaction).
 * @param {string} userId
 * @param {{ income?: number, expense?: number }} delta
 */
user_analytics.statics.applyDelta = function (userId, { income = 0, expense = 0 }) {
  return this.findOneAndUpdate(
    { user_id: userId },
    {
      $inc: {
        total_income:    income,
        total_expense:   expense,
        current_balance: income - expense,
      },
    },
    { new: true }
  );
};

/**
 * Cập nhật current_month snapshot.
 * @param {string} userId
 * @param {object} monthData
 */
user_analytics.statics.updateCurrentMonth = function (userId, monthData) {
  return this.findOneAndUpdate(
    { user_id: userId },
    { $set: { current_month: monthData } },
    { new: true }
  );
};


module.exports = mongoose.model('UserAnalytics', user_analytics);

