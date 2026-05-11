const mongoose = require("mongoose");
const { Schema } = mongoose;

 const expectedRangeSchema = new Schema(
  {
    min: { type: Number, required: true, min: 0, comment: "Lower bound of the normal spending range (VND)" },
    max: { type: Number, required: true, min: 0, comment: "Upper bound of the normal spending range (VND)" },
  },
  { _id: false }
);

 const anomaly_logs = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – owner of the anomaly alert",
    },

    account_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – account where the anomaly was detected",
    },

    type: {
      type: String,
      required: true,
      enum: ["category_spike", "large_transaction", "unusual_merchant", "duplicate"],
      default: "category_spike",
      comment: "Anomaly type; currently only 'category_spike' is seeded",
    },

    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      comment: "Severity level: low | medium | high",
    },

    description: {
      type: String,
      required: true,
      trim: true,
      comment: "Human-readable explanation of the anomaly (Vietnamese)",
    },

    transaction_id: {
      type: String,
      default: null,
      trim: true,
      comment: "UUID of the triggering transaction; null for aggregate-level anomalies",
    },

    category_id: {
      type: String,
      default: null,
      trim: true,
      comment: "UUID of the category involved",
    },

    amount_flagged: {
      type: Number,
      default: null,
      min: 0,
      comment: "The actual spending amount that triggered the alert (VND)",
    },

    expected_range: {
      type: expectedRangeSchema,
      default: null,
      comment: "Normal min/max range used to detect the spike",
    },

    is_read: {
      type: Boolean,
      default: false,
      comment: "true once the user has viewed this alert",
    },

    is_dismissed: {
      type: Boolean,
      default: false,
      comment: "true once the user dismisses / acknowledges this alert",
    },

    detected_at: {
      type: Date,
      required: true,
      comment: "Timestamp when the anomaly was detected",
    },
  },
  {
    timestamps: false,
    collection: "anomaly_logs",
    versionKey: false,
  }
);

anomaly_logs.index({ user_id: 1 }, { name: "idx_anomaly_user_id" });
anomaly_logs.index({ account_id: 1 }, { name: "idx_anomaly_account_id" });
anomaly_logs.index({ category_id: 1 }, { name: "idx_anomaly_category_id" });
anomaly_logs.index({ detected_at: -1 }, { name: "idx_anomaly_detected_at_desc" });
anomaly_logs.index({ user_id: 1, is_read: 1 }, { name: "idx_anomaly_user_unread" });
anomaly_logs.index(
  { user_id: 1, is_dismissed: 1, detected_at: -1 },
  { name: "idx_anomaly_user_active" }
);
anomaly_logs.index(
  { user_id: 1, severity: 1, detected_at: -1 },
  { name: "idx_anomaly_user_severity" }
);

const AnomalyLog = mongoose.model("AnomalyLog", anomaly_logs);

module.exports = AnomalyLog;
