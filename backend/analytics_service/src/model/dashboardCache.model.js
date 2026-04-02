'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schemas ──────────────────────────────────────────────

const BalanceCardSchema = new Schema(
  {
    current_balance: { type: Number, default: 0 },
    income_mtd:      { type: Number, default: 0 }, // month-to-date income
    expense_mtd:     { type: Number, default: 0 }, // month-to-date expense
  },
  { _id: false }
);

const ExpensePieItemSchema = new Schema(
  {
    category_name: { type: String, required: true },
    amount:        { type: Number, default: 0 },
    color:         { type: String, default: '#6B7280' },
  },
  { _id: false }
);

const CashflowBarItemSchema = new Schema(
  {
    label:   { type: String, required: true }, // e.g. "Mon", "01/04"
    income:  { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
  },
  { _id: false }
);

const RecentTxnSchema = new Schema(
  {
    id:            { type: String, required: true },
    description:   { type: String, default: '' },
    amount:        { type: Number, default: 0 },
    type:          { type: String, enum: ['income', 'expense'], default: 'expense' },
    category_name: { type: String, default: '' },
    category_icon: { type: String, default: '' },
    date:          { type: Date,   required: true },
  },
  { _id: false }
);

const BudgetProgressSchema = new Schema(
  {
    category_name: { type: String, required: true },
    used:          { type: Number, default: 0 },
    limit:         { type: Number, default: 0 },
    pct:           { type: Number, default: 0 },
    is_over:       { type: Boolean, default: false },
  },
  { _id: false }
);

const WidgetsSchema = new Schema(
  {
    balance_card:    { type: BalanceCardSchema,          default: () => ({}) },
    expense_pie:     { type: [ExpensePieItemSchema],     default: [] },
    cashflow_bar:    { type: [CashflowBarItemSchema],    default: [] },
    recent_txns:     { type: [RecentTxnSchema],          default: [] },
    budget_progress: { type: [BudgetProgressSchema],     default: [] },
    ai_tip:          { type: String, default: '' },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const DashboardCacheSchema = new Schema(
  {
    user_id: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    widgets:      { type: WidgetsSchema, default: () => ({}) },
    generated_at: { type: Date, default: Date.now },

    // TTL field — MongoDB removes doc when expires_at is reached
    expires_at: {
      type:     Date,
      required: true,
      default:  () => new Date(Date.now() + 15 * 60 * 1000), // +15 minutes
    },
  },
  {
    versionKey: false,
    collection: 'dashboard_cache',
  }
);

// ── Indexes ──────────────────────────────────────────────────

// TTL index: MongoDB auto-deletes when expires_at <= now
DashboardCacheSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: 'ttl_expires_at' }
);

// ── Helper static ────────────────────────────────────────────

/**
 * Refresh expiry time (call after regenerating widgets)
 */
DashboardCacheSchema.methods.refreshExpiry = function (minutes = 15) {
  this.expires_at  = new Date(Date.now() + minutes * 60 * 1000);
  this.generated_at = new Date();
};

module.exports = mongoose.model('DashboardCache', DashboardCacheSchema);
