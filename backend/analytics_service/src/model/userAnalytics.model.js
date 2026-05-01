// ============================================================
// userAnalytics.model.js
// Collection: user_analytics
// Database  : finance_db
// ============================================================

const mongoose = require("mongoose");
const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────

/** Aggregated category spend for the all-time top-category list */
const topCategorySchema = new Schema(
  {
    category_id: { type: String, required: true, trim: true },
    category_name: { type: String, required: true, trim: true },
    total_amount: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

/** Current-month income / expense / savings snapshot */
const currentMonthSchema = new Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    income: { type: Number, default: 0, min: 0 },
    expense: { type: Number, default: 0, min: 0 },
    savings: { type: Number, default: 0 },
    savings_rate: { type: Number, default: 0, comment: "Savings / income × 100 (%)" },
  },
  { _id: false }
);

/** AI-generated insights block */
const aiInsightsSchema = new Schema(
  {
    generated: { type: Boolean, default: false },
    content: { type: String, default: null },
    generated_at: { type: Date, default: null },
  },
  { _id: false }
);

/** Individual budget alert for a single category */
const budgetAlertItemSchema = new Schema(
  {
    category_id: { type: String, required: true, trim: true },
    category_name: { type: String, required: true, trim: true },
    budget_limit: { type: Number, required: true, min: 0 },
    current_spent: { type: Number, required: true, min: 0 },
    percent_used: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["ok", "warning", "critical", "exceeded"],
      comment: "'ok' < 70% | 'warning' 70–99% | 'critical' ≥ 99% | 'exceeded' > 100%",
    },
    alerted_at: { type: Date, default: null },
  },
  { _id: false }
);

/** Budget alert container */
const budgetAlertSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    alerts: { type: [budgetAlertItemSchema], default: [] },
    last_checked: { type: Date, default: null },
  },
  { _id: false }
);

/** Single savings / spending goal */
const goalSchema = new Schema(
  {
    goal_id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    target_amount: { type: Number, required: true, min: 0 },
    current_amount: { type: Number, required: true, default: 0 },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      required: true,
      enum: ["in_progress", "completed", "exceeded", "failed"],
      default: "in_progress",
    },
    note: { type: String, default: null, trim: true },
  },
  { _id: false }
);

/** Goal-tracking container */
const goalTrackingSchema = new Schema(
  {
    goals: { type: [goalSchema], default: [] },
  },
  { _id: false }
);

/** Saving-streak badge */
const streakSchema = new Schema(
  {
    saving_months: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "months" },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────
const user_analytics = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      comment: "UUID – one analytics document per user",
    },

    display_name: {
      type: String,
      required: true,
      trim: true,
      comment: "User's full name (e.g. 'Lê Tấn Đạt')",
    },

    account_id: {
      type: [String],
      default: [],
      comment: "List of account UUIDs belonging to this user",
    },

    total_income: {
      type: Number,
      default: 0,
      min: 0,
      comment: "All-time total income across all accounts (VND)",
    },

    total_expense: {
      type: Number,
      default: 0,
      min: 0,
      comment: "All-time total expense across all accounts (VND)",
    },

    current_balance: {
      type: Number,
      default: 0,
      comment: "total_income - total_expense (can be negative)",
    },

    current_month: {
      type: currentMonthSchema,
      required: true,
      comment: "Snapshot of the current month's financials",
    },

    top_categories: {
      type: [topCategorySchema],
      default: [],
      comment: "All-time top spending categories across all accounts",
    },

    ai_insights: {
      type: aiInsightsSchema,
      default: () => ({}),
      comment: "AI-generated financial insights (lazy-generated)",
    },

    budget_alert: {
      type: budgetAlertSchema,
      default: () => ({}),
      comment: "Budget monitoring for the current month",
    },

    goal_tracking: {
      type: goalTrackingSchema,
      default: () => ({}),
      comment: "Financial goals and their progress",
    },

    streak: {
      type: streakSchema,
      default: () => ({}),
      comment: "Consecutive months with positive savings",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "user_analytics",
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────
user_analytics.index(
  { user_id: 1 },
  { unique: true, name: "idx_user_analytics_user_id_unique" }
);
user_analytics.index(
  { "streak.saving_months": -1 },
  { name: "idx_user_analytics_streak" }
);

// ── Model ─────────────────────────────────────────────────────
const UserAnalytics = mongoose.model("UserAnalytics", user_analytics);

module.exports = UserAnalytics;
