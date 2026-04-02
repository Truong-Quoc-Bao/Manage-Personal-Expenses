'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schema ───────────────────────────────────────────────

const DataPointSchema = new Schema(
  {
    year:     { type: Number, required: true },
    month:    { type: Number, required: true, min: 1, max: 12 },
    amount:   { type: Number, default: 0 },
    tx_count: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const SpendingTrendSchema = new Schema(
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

    // Rolling 24-month window of data points (sorted asc)
    data_points: {
      type:     [DataPointSchema],
      default:  [],
      validate: {
        validator: (arr) => arr.length <= 24,
        message:  'data_points rolling window max 24 months',
      },
    },

    last_updated: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    collection: 'spending_trends',
  }
);

// ── Indexes ──────────────────────────────────────────────────

SpendingTrendSchema.index(
  { user_id: 1, category_id: 1 },
  { unique: true, name: 'idx_user_category_trend' }
);
SpendingTrendSchema.index(
  { user_id: 1, category_type: 1 },
  { name: 'idx_user_type_trend' }
);

// ── Helper method ────────────────────────────────────────────

/**
 * Upsert a monthly data point and keep the rolling 24-month window.
 * @param {number} year
 * @param {number} month
 * @param {number} amount
 * @param {number} txCount
 */
SpendingTrendSchema.methods.upsertDataPoint = function (year, month, amount, txCount) {
  const idx = this.data_points.findIndex(
    (dp) => dp.year === year && dp.month === month
  );

  if (idx >= 0) {
    this.data_points[idx].amount   = amount;
    this.data_points[idx].tx_count = txCount;
  } else {
    this.data_points.push({ year, month, amount, tx_count: txCount });
    // Keep sorted ascending and trim to 24 months
    this.data_points.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    if (this.data_points.length > 24) {
      this.data_points = this.data_points.slice(-24);
    }
  }

  this.last_updated = new Date();
};

module.exports = mongoose.model('SpendingTrend', SpendingTrendSchema);
