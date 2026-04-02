'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Reusable sub-schemas ─────────────────────────────────────

const CategoryBreakdownSchema = new Schema(
  {
    category_id:    { type: String, required: true },
    category_name:  { type: String, required: true },
    amount:         { type: Number, default: 0 },
    percentage:     { type: Number, default: 0 },
    budget_limit:   { type: Number, default: 0 },
    is_over_budget: { type: Boolean, default: false },
  },
  { _id: false }
);

const SummarySchema = new Schema(
  {
    total_income:    { type: Number, default: 0 },
    total_expense:   { type: Number, default: 0 },
    net_savings:     { type: Number, default: 0 },
    savings_rate:    { type: Number, default: 0 },
    opening_balance: { type: Number, default: 0 },
    closing_balance: { type: Number, default: 0 },
  },
  { _id: false }
);

const WeeklyTrendSchema = new Schema(
  {
    week:    { type: Number, required: true, min: 1, max: 5 },
    income:  { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
  },
  { _id: false }
);

const DailyCashflowSchema = new Schema(
  {
    day:         { type: Number, required: true, min: 1, max: 31 },
    income:      { type: Number, default: 0 },
    expense:     { type: Number, default: 0 },
    balance_eod: { type: Number, default: 0 }, // balance end-of-day
  },
  { _id: false }
);

const TopExpenseSchema = new Schema(
  {
    transaction_id: { type: String, required: true },
    description:    { type: String, default: '' },
    amount:         { type: Number, default: 0 },
    category_name:  { type: String, default: '' },
    date:           { type: Date,   required: true },
  },
  { _id: false }
);

const ComparisonSchema = new Schema(
  {
    income_change_pct:  { type: Number, default: 0 },
    expense_change_pct: { type: Number, default: 0 },
    savings_change_pct: { type: Number, default: 0 },
  },
  { _id: false }
);

const AiReportSchema = new Schema(
  {
    summary_text:     { type: String, default: '' },  // NLP-generated paragraph
    recommendations:  { type: [String], default: [] },
    anomalies_detected: { type: [String], default: [] },
    predicted_next_month: {
      income:  { type: Number, default: 0 },
      expense: { type: Number, default: 0 },
    },
    generated_at: { type: Date, default: null },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const MonthlyReportSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    year:    { type: Number, required: true },
    month:   { type: Number, required: true, min: 1, max: 12 },

    summary:             { type: SummarySchema,   default: () => ({}) },
    income_by_category:  { type: [CategoryBreakdownSchema], default: [] },
    expense_by_category: { type: [CategoryBreakdownSchema], default: [] },
    weekly_trend:        { type: [WeeklyTrendSchema],       default: [] },
    daily_cashflow:      { type: [DailyCashflowSchema],     default: [] },

    // Top 5 largest expenses of the month
    top_expenses: {
      type:    [TopExpenseSchema],
      default: [],
      validate: { validator: (v) => v.length <= 5, message: 'top_expenses max 5 items' },
    },

    comparison: { type: ComparisonSchema, default: () => ({}) },
    ai_report:  { type: AiReportSchema,   default: () => ({}) },

    status: {
      type:    String,
      enum:    ['draft', 'generated', 'reviewed'],
      default: 'draft',
    },

    generated_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'monthly_reports',
  }
);

// ── Indexes ──────────────────────────────────────────────────
MonthlyReportSchema.index(
  { user_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_user_year_month' }
);
MonthlyReportSchema.index({ generated_at: -1 });
MonthlyReportSchema.index({ status: 1, user_id: 1 });

module.exports = mongoose.model('MonthlyReport', MonthlyReportSchema);
