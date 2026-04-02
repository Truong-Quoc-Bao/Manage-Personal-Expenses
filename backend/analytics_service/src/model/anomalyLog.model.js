'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schema ───────────────────────────────────────────────

const ExpectedRangeSchema = new Schema(
  {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────

const AnomalyLogSchema = new Schema(
  {
    user_id: {
      type:     String,
      required: true,
      index:    true,
    },

    type: {
      type:     String,
      required: true,
      enum: [
        'unusual_amount',     // single tx much higher than average
        'unusual_frequency',  // too many txns in short period
        'category_spike',     // category total >> previous months
        'income_drop',
        'recurring_missed',   // expected recurring not found
      ],
    },

    severity: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'low',
    },

    description:    { type: String, default: '' },
    transaction_id: { type: String, default: null }, // nullable
    category_id:    { type: String, default: null }, // nullable
    amount_flagged: { type: Number, default: 0 },
    expected_range: { type: ExpectedRangeSchema, default: () => ({}) },

    is_read:      { type: Boolean, default: false },
    is_dismissed: { type: Boolean, default: false },

    detected_at: { type: Date, required: true, default: Date.now },
  },
  {
    versionKey: false,
    collection: 'anomaly_logs',
  }
);

// ── Indexes ──────────────────────────────────────────────────

AnomalyLogSchema.index(
  { user_id: 1, detected_at: -1 },
  { name: 'idx_user_detected' }
);
AnomalyLogSchema.index(
  { user_id: 1, is_read: 1 },
  { name: 'idx_user_unread' }
);
AnomalyLogSchema.index(
  { user_id: 1, severity: 1, detected_at: -1 },
  { name: 'idx_user_severity' }
);

// TTL index: auto-delete anomaly logs older than 1 year
AnomalyLogSchema.index(
  { detected_at: 1 },
  { expireAfterSeconds: 31_536_000, name: 'ttl_anomaly_1yr' }
);

module.exports = mongoose.model('AnomalyLog', AnomalyLogSchema);
