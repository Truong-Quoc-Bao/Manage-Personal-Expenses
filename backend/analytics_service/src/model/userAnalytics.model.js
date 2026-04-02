'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ──────────────────────────────────────────────

const CurrentMonthSchema = new Schema(
  {
    year:         { type: Number, required: true },
    month:        { type: Number, required: true, min: 1, max: 12 },
    income:       { type: Number, default: 0 },
    expense:      { type: Number, default: 0 },
    savings:      { type: Number, default: 0 },   // income - expense
    savings_rate: { type: Number, default: 0 },   // savings / income * 100
  },
  { _id: false }
);

const TopCategorySchema = new Schema(
  {
    category_id:   { type: String, required: true },
    category_name: { type: String, required: true },
    total_spent:   { type: Number, default: 0 },
    percentage:    { type: Number, default: 0 },  // % of total expense
  },
  { _id: false }
);

const AiInsightsSchema = new Schema(
  {
    anomaly_detected:             { type: Boolean, default: false },
    anomaly_description:          { type: String,  default: '' },
    saving_tip:                   { type: String,  default: '' },
    predicted_expense_next_month: { type: Number,  default: 0 },
    last_analyzed_at:             { type: Date,    default: null },
  },
  { _id: false }
);

const StreakSchema = new Schema(
  {
    under_budget_days:           { type: Number, default: 0 },
    consecutive_savings_months:  { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const UserAnalyticsSchema = new Schema(
  {
    user_id: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    // Rolling lifetime totals
    total_income:    { type: Number, default: 0 },
    total_expense:   { type: Number, default: 0 },
    current_balance: { type: Number, default: 0 }, // total_income - total_expense

    // Snapshot for the current month
    current_month: { type: CurrentMonthSchema, default: () => ({}) },

    // Top 5 spending categories this month
    top_categories: { type: [TopCategorySchema], default: [] },

    // AI/NLP insight flags
    ai_insights: { type: AiInsightsSchema, default: () => ({}) },

    // Gamification streaks
    streak: { type: StreakSchema, default: () => ({}) },
  },
  {
    timestamps:  { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey:  false,
    collection:  'user_analytics',
  }
);

// ── Indexes ──────────────────────────────────────────────────
UserAnalyticsSchema.index({ 'current_month.year': 1, 'current_month.month': 1 });
UserAnalyticsSchema.index({ updated_at: -1 });

module.exports = mongoose.model('UserAnalytics', UserAnalyticsSchema);
