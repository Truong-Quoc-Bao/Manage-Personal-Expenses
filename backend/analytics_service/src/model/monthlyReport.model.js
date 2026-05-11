
const mongoose = require("mongoose");
const { Schema } = mongoose;

 const summarySchema = new Schema(
  {
    total_income: { type: Number, default: 0, min: 0, comment: "Total income for the month (VND)" },
    total_expense: { type: Number, default: 0, min: 0, comment: "Total expense for the month (VND)" },
    savings: { type: Number, default: 0, comment: "total_income - total_expense (can be negative)" },
    savings_rate: { type: Number, default: 0, comment: "savings / total_income × 100 (%)" },
    transaction_count: { type: Number, default: 0, min: 0, comment: "Total number of transactions" },
  },
  { _id: false }
);

const categoryBreakdownSchema = new Schema(
  {
    category_id: { type: String, required: true, trim: true },
    category_name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const weeklyTrendSchema = new Schema(
  {
    week: { type: Number, required: true, min: 1, max: 6, comment: "Week number within the month (1–6)" },
    income: { type: Number, default: 0, min: 0 },
    expense: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const dailyCashflowSchema = new Schema(
  {
    day: { type: Number, required: true, min: 1, max: 31, comment: "Day of month (1–31)" },
    income: { type: Number, default: 0, min: 0 },
    expense: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const topExpenseSchema = new Schema(
  {
    trans_id: { type: String, required: true, trim: true, comment: "UUID – transaction" },
    description: { type: String, default: null, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category_id: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const aiReportSchema = new Schema(
  {
    generated: { type: Boolean, default: false, comment: "Whether the AI report has been generated" },
    content: { type: String, default: null, comment: "AI-generated report content; null until generated" },
  },
  { _id: false }
);

 const monthly_reports = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – owner of the report",
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

    summary: {
      type: summarySchema,
      required: true,
      comment: "Aggregated income / expense / savings for the month",
    },

    income_by_category: {
      type: [categoryBreakdownSchema],
      default: [],
      comment: "Income broken down by category",
    },

    expense_by_category: {
      type: [categoryBreakdownSchema],
      default: [],
      comment: "Expenses broken down by category",
    },

    weekly_trend: {
      type: [weeklyTrendSchema],
      default: [],
      comment: "Per-week rollup of income and expense",
    },

    daily_cashflow: {
      type: [dailyCashflowSchema],
      default: [],
      comment: "Per-day income and expense for charting",
    },

    top_expenses: {
      type: [topExpenseSchema],
      default: [],
      comment: "Top N highest single transactions of the month",
    },

    comparison: {
      type: Schema.Types.Mixed,
      default: {},
      comment: "Month-over-month comparison data (populated lazily)",
    },

    ai_report: {
      type: aiReportSchema,
      default: () => ({ generated: false, content: null }),
      comment: "AI-generated narrative report for the month",
    },

    status: {
      type: String,
      required: true,
      enum: ["generated", "pending", "failed"],
      default: "generated",
      comment: "Report generation status",
    },

    generated_at: {
      type: Date,
      default: null,
      comment: "Timestamp when the report was first generated",
    },

    updated_at: {
      type: Date,
      default: null,
      comment: "Timestamp of the last update to this report",
    },
  },
  {
    timestamps: false,
    collection: "monthly_reports",
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────
monthly_reports.index({ user_id: 1 }, { name: "idx_monthly_reports_user_id" });
monthly_reports.index(
  { user_id: 1, year: 1, month: 1 },
  { unique: true, name: "idx_monthly_reports_unique" }
);
monthly_reports.index(
  { user_id: 1, year: -1, month: -1 },
  { name: "idx_monthly_reports_user_ym_desc" }
);
monthly_reports.index(
  { status: 1 },
  { name: "idx_monthly_reports_status" }
);

 const MonthlyReport = mongoose.model("MonthlyReport", monthly_reports);

module.exports = MonthlyReport;
