const mongoose = require("mongoose");
const { Schema } = mongoose;

 const monthlyDataSchema = new Schema(
  {
    year: { type: Number, required: true, comment: "4-digit year" },
    month: { type: Number, required: true, min: 1, max: 12, comment: "Month 1–12" },
    amount: { type: Number, required: true, default: 0, min: 0, comment: "Total spent this month (VND)" },
  },
  { _id: false }
);

 const spending_trends = new Schema(
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
      trim: true,
      comment: "UUID – account this trend belongs to",
    },

    category_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – category being tracked",
    },

    category_name: {
      type: String,
      required: true,
      trim: true,
      comment: "Denormalized label (e.g. 'Mua sắm', 'Entertainment')",
    },

    category_type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      comment: "'income' | 'expense'",
    },

    monthly_data: {
      type: [monthlyDataSchema],
      default: [],
      comment: "Ordered list of monthly spending amounts (ascending by year/month)",
    },

    avg_monthly: {
      type: Number,
      default: 0,
      min: 0,
      comment: "Average monthly spend computed over total_months (VND)",
    },

    trend: {
      type: String,
      enum: ["increasing", "decreasing", "stable"],
      default: "stable",
      comment: "Direction of the trend derived from recent months",
    },

    total_months: {
      type: Number,
      default: 0,
      min: 0,
      comment: "Number of months included in monthly_data",
    },

    total_transactions: {
      type: Number,
      default: 0,
      min: 0,
      comment: "Cumulative transaction count across all tracked months",
    },

    updated_at: {
      type: Date,
      default: Date.now,
      comment: "Timestamp of the last recalculation",
    },
  },
  {
    timestamps: false,
    collection: "spending_trends",
    versionKey: false,
  }
);

 spending_trends.index({ user_id: 1 }, { name: "idx_spending_trends_user_id" });
spending_trends.index({ account_id: 1 }, { name: "idx_spending_trends_account_id" });
spending_trends.index(
  { account_id: 1, category_id: 1 },
  { unique: true, name: "idx_spending_trends_unique" }
);
spending_trends.index(
  { user_id: 1, category_id: 1 },
  { name: "idx_spending_trends_user_cat" }
);

 const SpendingTrend = mongoose.model("SpendingTrend", spending_trends);

module.exports = SpendingTrend;
