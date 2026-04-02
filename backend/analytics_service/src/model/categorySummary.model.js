'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ──────────────────────────────────────────────

const DailyBreakdownSchema = new Schema(
  {
    day:    { type: Number, required: true, min: 1, max: 31 },
    amount: { type: Number, default: 0 },
    count:  { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const CategorySummarySchema = new Schema(
  {
    user_id: {
      type:     String,
      required: true,
      index:    true,
    },

    category_id:   { type: String, required: true },
    category_name: { type: String, required: true },
    category_type: {
      type:     String,
      required: true,
      enum:     ['income', 'expense', 'saving', 'investment'],
    },
    category_icon:  { type: String, default: '' },
    category_color: { type: String, default: '#6B7280' }, // hex for charts

    // Period
    year:  { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },

    // Aggregated amounts
    total_amount:      { type: Number, default: 0 },
    transaction_count: { type: Number, default: 0 },
    average_per_tx:    { type: Number, default: 0 },
    max_single_tx:     { type: Number, default: 0 },
    min_single_tx:     { type: Number, default: 0 },

    // Budget tracking
    budget_limit:    { type: Number, default: 0 },
    budget_used_pct: { type: Number, default: 0 }, // total_amount / budget_limit * 100
    is_over_budget:  { type: Boolean, default: false },

    // Daily breakdown array (for time-series micro-chart)
    daily_breakdown: { type: [DailyBreakdownSchema], default: [] },

    // Month-over-month comparison
    prev_month_amount: { type: Number, default: 0 },
    mom_change_pct:    { type: Number, default: 0 }, // % change vs previous month
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    collection: 'category_summary',
  }
);

// ── Indexes ──────────────────────────────────────────────────

// Primary query: user's categories for a given month
CategorySummarySchema.index(
  { user_id: 1, year: -1, month: -1 },
  { name: 'idx_user_month' }
);

// Unique constraint: one doc per user × category × month
CategorySummarySchema.index(
  { user_id: 1, category_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_user_category_month' }
);

// Filter by category type (income vs expense)
CategorySummarySchema.index(
  { user_id: 1, category_type: 1, year: -1, month: -1 },
  { name: 'idx_user_type_month' }
);

// Budget alert queries
CategorySummarySchema.index(
  { is_over_budget: 1, user_id: 1 },
  { name: 'idx_over_budget' }
);

module.exports = mongoose.model('CategorySummary', CategorySummarySchema);
