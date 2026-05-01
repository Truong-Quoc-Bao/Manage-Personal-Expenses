// ============================================================
// dashboardCache.model.js
// Collection: dashboard_cache
// Database  : finance_db
// Note      : TTL index on `expires_at` automatically removes
//             stale cache documents (expireAfterSeconds: 0).
// ============================================================

const mongoose = require("mongoose");
const { Schema } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────
const summarySchema = new Schema(
  {
    current_balance: { type: Number, default: 0, comment: "Current balance of the account (VND)" },
    monthly_income: { type: Number, default: 0, min: 0, comment: "Total income this month (VND)" },
    monthly_expense: { type: Number, default: 0, min: 0, comment: "Total expense this month (VND)" },
    monthly_savings: { type: Number, default: 0, comment: "Income minus expense (can be negative)" },
    savings_rate: { type: Number, default: 0, comment: "Savings / income × 100 (%); 0 when no income" },
  },
  { _id: false }
);

const topCategorySchema = new Schema(
  {
    category_id: { type: String, required: true, trim: true },
    category_name: { type: String, required: true, trim: true },
    total_amount: { type: Number, required: true, default: 0, min: 0, comment: "Cumulative amount (VND)" },
  },
  { _id: false }
);

const recentTransactionSchema = new Schema(
  {
    trans_id: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ["income", "expense"] },
    date: { type: String, required: true, comment: "YYYY-MM-DD" },
    category_id: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const streakSchema = new Schema(
  {
    saving_months: { type: Number, default: 0, min: 0, comment: "Consecutive months with positive savings" },
    unit: { type: String, default: "months" },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────
const dashboard_cache = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – owner",
    },

    account_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      comment: "UUID – one cache document per account",
    },

    summary: {
      type: summarySchema,
      required: true,
      comment: "Aggregated financial snapshot for the dashboard",
    },

    top_categories: {
      type: [topCategorySchema],
      default: [],
      comment: "Top spending categories (all-time cumulative)",
    },

    recent_transactions: {
      type: [recentTransactionSchema],
      default: [],
      comment: "Last N transactions shown on the dashboard (typically 5)",
    },

    streak: {
      type: streakSchema,
      default: () => ({}),
      comment: "Saving-streak info displayed as a badge",
    },

    expires_at: {
      type: Date,
      required: true,
      comment: "TTL field – MongoDB removes the document once this date passes",
    },

    top_account_id: {
      type: String,
      default: null,
      trim: true,
      comment: "UUID – account with the highest monthly_expense among all accounts of this user",
    },
  },
  {
    timestamps: false,
    collection: "dashboard_cache",
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────
dashboard_cache.index({ user_id: 1 }, { name: "idx_dashboard_user_id" });
dashboard_cache.index(
  { account_id: 1 },
  { unique: true, name: "idx_dashboard_account_unique" }
);
// TTL index — document is auto-deleted when expires_at <= current time
dashboard_cache.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: "idx_dashboard_ttl" }
);

// ── Model ─────────────────────────────────────────────────────
const DashboardCache = mongoose.model("DashboardCache", dashboard_cache);

module.exports = DashboardCache;
