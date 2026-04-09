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
    savings:      { type: Number, default: 0 },
    savings_rate: { type: Number, default: 0 },
  },
  { _id: false }
);

const TopCategorySchema = new Schema(
  {
    category_id:   { type: String, required: true },
    category_name: { type: String, required: true },
    total_amount:  { type: Number, default: 0 }, // ✅ sửa đúng theo DB
  },
  { _id: false }
);

const AiInsightsSchema = new Schema(
  {
    generated: { type: Boolean, default: false }, // ✅ match DB
    content:   { type: String, default: null },   // ✅ match DB
  },
  { _id: false }
);

const StreakSchema = new Schema(
  {
    saving_months: { type: Number, default: 0 },  // ✅ match DB
    unit:          { type: String, default: 'months' }, // ✅ match DB
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const user_analytics = new Schema(
  {
    user_id: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    total_income:    { type: Number, default: 0 },
    total_expense:   { type: Number, default: 0 },
    current_balance: { type: Number, default: 0 },

    current_month: { type: CurrentMonthSchema, default: () => ({}) },

    top_categories: { type: [TopCategorySchema], default: [] },

    ai_insights: { type: AiInsightsSchema, default: () => ({}) },

    streak: { type: StreakSchema, default: () => ({}) },
  },
  {
    timestamps:  { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey:  false,
    collection:  'user_analytics',
  }
);

// ── Indexes ──────────────────────────────────────────────────
user_analytics.index({ 'current_month.year': 1, 'current_month.month': 1 });
user_analytics.index({ updated_at: -1 });

module.exports = mongoose.model('UserAnalytics', user_analytics);