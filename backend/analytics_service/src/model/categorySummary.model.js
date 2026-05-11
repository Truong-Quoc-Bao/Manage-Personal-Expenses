const mongoose = require("mongoose");
const { Schema } = mongoose;

 const dailyBreakdownSchema = new Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
      comment: "Day of month (1–31)",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: "Total spent on this day in VND",
    },
    trans_id: {
      type: [String],
      default: [],
      comment: "List of transaction UUIDs that contribute to this day's amount",
    },
  },
  { _id: false }
);

 const category_summary = new Schema(
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
      comment: "UUID – account",
    },

    category_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – spending / income category",
    },

    category_name: {
      type: String,
      required: true,
      trim: true,
      comment: "Human-readable category label (e.g. 'Di chuyển', 'Entertainment')",
    },

    category_type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      comment: "'income' | 'expense'",
    },

    year: {
      type: Number,
      required: true,
      comment: "4-digit year (e.g. 2025)",
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      comment: "Month number 1–12",
    },

    total_amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      comment: "Total amount for this category in the given year/month (VND)",
    },

    transaction_count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      comment: "Number of transactions in this category/month",
    },

    budget_limit: {
      type: Number,
      default: 0,
      min: 0,
      comment: "Monthly budget ceiling for this category; 0 = not set",
    },

    is_over_budget: {
      type: Boolean,
      default: false,
      comment: "true when total_amount > budget_limit (and budget_limit > 0)",
    },

    daily_breakdown: {
      type: [dailyBreakdownSchema],
      default: [],
      comment: "Per-day spending rollup within the month",
    },

    updated_at: {
      type: Date,
      default: null,
      comment: "Timestamp of the last update to this summary document",
    },
  },
  {
    timestamps: false,
    collection: "category_summary",
    versionKey: false,
  }
);

 category_summary.index({ user_id: 1 }, { name: "idx_cat_summary_user_id" });
category_summary.index({ account_id: 1 }, { name: "idx_cat_summary_account_id" });
category_summary.index({ category_id: 1 }, { name: "idx_cat_summary_category_id" });
category_summary.index(
  { account_id: 1, category_id: 1, year: 1, month: 1 },
  { unique: true, name: "idx_cat_summary_unique" }
);
category_summary.index(
  { user_id: 1, year: 1, month: 1 },
  { name: "idx_cat_summary_user_ym" }
);

 const CategorySummary = mongoose.model("CategorySummary", category_summary);

module.exports = CategorySummary;
