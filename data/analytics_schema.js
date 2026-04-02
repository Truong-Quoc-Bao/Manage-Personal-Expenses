/**
 * ============================================================
 * ANALYTICS SERVICE - MONGODB SCHEMA DESIGN
 * Personal Finance Management System (AI/NLP Integrated)
 * ============================================================
 *
 * Design principles:
 *  - Optimized for READ-HEAVY operations (dashboards, charts, stats)
 *  - Pre-aggregated data to avoid expensive real-time computation
 *  - Compound indexes on common query patterns
 *  - TTL indexes for auto-expiring cache/temp collections
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// 1. user_analytics
//    Stores per-user aggregated financial overview.
//    Updated incrementally whenever a transaction is added/edited.
// ─────────────────────────────────────────────────────────────
db.createCollection("user_analytics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "updated_at"],
      properties: {
        _id: { bsonType: "objectId" },

        user_id: {
          bsonType: "string",
          description: "Reference to users collection (auth service)"
        },

        // ── Rolling totals ──────────────────────────────────
        total_income: {
          bsonType: "double",
          description: "Lifetime total income (VND)"
        },
        total_expense: {
          bsonType: "double",
          description: "Lifetime total expense (VND)"
        },
        current_balance: {
          bsonType: "double",
          description: "total_income - total_expense"
        },

        // ── Current month snapshot (refreshed daily) ────────
        current_month: {
          bsonType: "object",
          properties: {
            year:    { bsonType: "int" },
            month:   { bsonType: "int" },       // 1-12
            income:  { bsonType: "double" },
            expense: { bsonType: "double" },
            savings: { bsonType: "double" },    // income - expense
            savings_rate: { bsonType: "double" } // savings / income * 100
          }
        },

        // ── Top spending categories this month ──────────────
        top_categories: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              category_id:   { bsonType: "string" },
              category_name: { bsonType: "string" },
              total_spent:   { bsonType: "double" },
              percentage:    { bsonType: "double" }  // % of total expense
            }
          }
        },

        // ── AI/NLP insight flags ────────────────────────────
        ai_insights: {
          bsonType: "object",
          properties: {
            anomaly_detected:    { bsonType: "bool" },
            anomaly_description: { bsonType: "string" },
            saving_tip:          { bsonType: "string" },
            predicted_expense_next_month: { bsonType: "double" },
            last_analyzed_at:    { bsonType: "date" }
          }
        },

        // ── Streak / gamification ───────────────────────────
        streak: {
          bsonType: "object",
          properties: {
            under_budget_days:    { bsonType: "int" },
            consecutive_savings_months: { bsonType: "int" }
          }
        },

        updated_at: { bsonType: "date" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

// Indexes for user_analytics
db.user_analytics.createIndex({ user_id: 1 }, { unique: true });
db.user_analytics.createIndex({ "current_month.year": 1, "current_month.month": 1 });
db.user_analytics.createIndex({ updated_at: -1 });


// ─────────────────────────────────────────────────────────────
// 2. category_summary
//    Pre-aggregated spending per category per user per month.
//    One document = one user × one category × one month.
//    Enables fast chart rendering (bar/pie charts by category).
// ─────────────────────────────────────────────────────────────
db.createCollection("category_summary", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "category_id", "year", "month"],
      properties: {
        _id: { bsonType: "objectId" },

        user_id:       { bsonType: "string" },
        category_id:   { bsonType: "string" },
        category_name: { bsonType: "string" },
        category_type: {
          bsonType: "string",
          enum: ["income", "expense", "saving", "investment"]
        },
        category_icon:  { bsonType: "string" },
        category_color: { bsonType: "string" },  // hex color for charts

        year:  { bsonType: "int" },
        month: { bsonType: "int" },

        // ── Aggregated amounts ──────────────────────────────
        total_amount:       { bsonType: "double" },
        transaction_count:  { bsonType: "int" },
        average_per_tx:     { bsonType: "double" },
        max_single_tx:      { bsonType: "double" },
        min_single_tx:      { bsonType: "double" },

        // ── Budget tracking ─────────────────────────────────
        budget_limit:     { bsonType: "double" },    // 0 if not set
        budget_used_pct:  { bsonType: "double" },    // total_amount / budget_limit * 100
        is_over_budget:   { bsonType: "bool" },

        // ── Daily breakdown (for time-series chart) ─────────
        daily_breakdown: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              day:    { bsonType: "int" },           // 1-31
              amount: { bsonType: "double" },
              count:  { bsonType: "int" }
            }
          }
        },

        // ── Month-over-month delta ──────────────────────────
        prev_month_amount: { bsonType: "double" },
        mom_change_pct:    { bsonType: "double" },   // % change vs previous month

        updated_at: { bsonType: "date" }
      }
    }
  }
});

// Indexes for category_summary
db.category_summary.createIndex(
  { user_id: 1, year: -1, month: -1 },
  { name: "idx_user_month" }
);
db.category_summary.createIndex(
  { user_id: 1, category_id: 1, year: -1, month: -1 },
  { unique: true, name: "idx_user_category_month" }
);
db.category_summary.createIndex(
  { user_id: 1, category_type: 1, year: -1, month: -1 },
  { name: "idx_user_type_month" }
);
db.category_summary.createIndex({ is_over_budget: 1, user_id: 1 });


// ─────────────────────────────────────────────────────────────
// 3. monthly_reports
//    Full monthly financial report per user.
//    Generated once/month (or on-demand).
//    Powers the "Monthly Summary" dashboard page.
// ─────────────────────────────────────────────────────────────
db.createCollection("monthly_reports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "year", "month"],
      properties: {
        _id: { bsonType: "objectId" },

        user_id: { bsonType: "string" },
        year:    { bsonType: "int" },
        month:   { bsonType: "int" },

        // ── Financial summary ───────────────────────────────
        summary: {
          bsonType: "object",
          properties: {
            total_income:   { bsonType: "double" },
            total_expense:  { bsonType: "double" },
            net_savings:    { bsonType: "double" },
            savings_rate:   { bsonType: "double" },
            opening_balance: { bsonType: "double" },
            closing_balance: { bsonType: "double" }
          }
        },

        // ── Income breakdown ────────────────────────────────
        income_by_category: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              category_id:   { bsonType: "string" },
              category_name: { bsonType: "string" },
              amount:        { bsonType: "double" },
              percentage:    { bsonType: "double" }
            }
          }
        },

        // ── Expense breakdown ───────────────────────────────
        expense_by_category: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              category_id:   { bsonType: "string" },
              category_name: { bsonType: "string" },
              amount:        { bsonType: "double" },
              percentage:    { bsonType: "double" },
              budget_limit:  { bsonType: "double" },
              is_over_budget: { bsonType: "bool" }
            }
          }
        },

        // ── Weekly trend (for line chart) ───────────────────
        weekly_trend: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              week:    { bsonType: "int" },    // 1-5
              income:  { bsonType: "double" },
              expense: { bsonType: "double" }
            }
          }
        },

        // ── Daily cash-flow (for bar chart) ─────────────────
        daily_cashflow: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              day:         { bsonType: "int" },
              income:      { bsonType: "double" },
              expense:     { bsonType: "double" },
              balance_eod: { bsonType: "double" }  // balance end-of-day
            }
          }
        },

        // ── Top transactions ────────────────────────────────
        top_expenses: {
          bsonType: "array",
          maxItems: 5,
          items: {
            bsonType: "object",
            properties: {
              transaction_id:   { bsonType: "string" },
              description:      { bsonType: "string" },
              amount:           { bsonType: "double" },
              category_name:    { bsonType: "string" },
              date:             { bsonType: "date" }
            }
          }
        },

        // ── Comparison with previous month ──────────────────
        comparison: {
          bsonType: "object",
          properties: {
            income_change_pct:  { bsonType: "double" },
            expense_change_pct: { bsonType: "double" },
            savings_change_pct: { bsonType: "double" }
          }
        },

        // ── AI-generated insights ───────────────────────────
        ai_report: {
          bsonType: "object",
          properties: {
            summary_text:        { bsonType: "string" },   // NLP-generated paragraph
            recommendations:     { bsonType: "array", items: { bsonType: "string" } },
            anomalies_detected:  { bsonType: "array", items: { bsonType: "string" } },
            predicted_next_month: {
              bsonType: "object",
              properties: {
                income:  { bsonType: "double" },
                expense: { bsonType: "double" }
              }
            },
            generated_at: { bsonType: "date" }
          }
        },

        status: {
          bsonType: "string",
          enum: ["draft", "generated", "reviewed"]
        },
        generated_at: { bsonType: "date" },
        updated_at:   { bsonType: "date" }
      }
    }
  }
});

// Indexes for monthly_reports
db.monthly_reports.createIndex(
  { user_id: 1, year: -1, month: -1 },
  { unique: true, name: "idx_user_year_month" }
);
db.monthly_reports.createIndex({ generated_at: -1 });
db.monthly_reports.createIndex({ status: 1, user_id: 1 });


// ─────────────────────────────────────────────────────────────
// 4. dashboard_cache
//    Short-lived cache of dashboard widget data per user.
//    TTL: 15 minutes. Avoids re-aggregating on every page load.
// ─────────────────────────────────────────────────────────────
db.createCollection("dashboard_cache");

db.dashboard_cache.createIndex({ user_id: 1 }, { unique: true });
db.dashboard_cache.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: "ttl_expires_at" }   // TTL index
);

/**
 * dashboard_cache document shape:
 * {
 *   user_id: "string",
 *   widgets: {
 *     balance_card:      { current_balance, income_mtd, expense_mtd },
 *     expense_pie:       [ { category_name, amount, color } ],
 *     cashflow_bar:      [ { label: "Mon", income, expense } ],
 *     recent_txns:       [ { id, description, amount, date, category } ],
 *     budget_progress:   [ { category_name, used, limit, pct } ],
 *     ai_tip:            "string"
 *   },
 *   generated_at: ISODate,
 *   expires_at:   ISODate   // generated_at + 15min → drives TTL
 * }
 */


// ─────────────────────────────────────────────────────────────
// 5. spending_trends
//    Multi-month trend data per user per category.
//    Powers "6-month / 12-month" trend line charts.
// ─────────────────────────────────────────────────────────────
db.createCollection("spending_trends");

/**
 * spending_trends document shape (one doc per user × category):
 * {
 *   user_id:       "string",
 *   category_id:   "string",
 *   category_name: "string",
 *   category_type: "income" | "expense",
 *   data_points: [
 *     { year: 2025, month: 10, amount: 1500000, tx_count: 12 },
 *     { year: 2025, month: 11, amount: 1800000, tx_count: 15 },
 *     ...up to 24 months rolling window
 *   ],
 *   last_updated: ISODate
 * }
 */

db.spending_trends.createIndex(
  { user_id: 1, category_id: 1 },
  { unique: true, name: "idx_user_category_trend" }
);
db.spending_trends.createIndex({ user_id: 1, category_type: 1 });


// ─────────────────────────────────────────────────────────────
// 6. anomaly_logs
//    Records AI-detected spending anomalies for audit & display.
// ─────────────────────────────────────────────────────────────
db.createCollection("anomaly_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "detected_at", "type"],
      properties: {
        _id:     { bsonType: "objectId" },
        user_id: { bsonType: "string" },

        type: {
          bsonType: "string",
          enum: [
            "unusual_amount",      // single tx much higher than average
            "unusual_frequency",   // too many txns in short period
            "category_spike",      // category total >> previous months
            "income_drop",
            "recurring_missed"     // expected recurring not found
          ]
        },

        severity: {
          bsonType: "string",
          enum: ["low", "medium", "high"]
        },

        description:    { bsonType: "string" },       // human-readable
        transaction_id: { bsonType: "string" },       // nullable
        category_id:    { bsonType: "string" },       // nullable
        amount_flagged: { bsonType: "double" },
        expected_range: {
          bsonType: "object",
          properties: {
            min: { bsonType: "double" },
            max: { bsonType: "double" }
          }
        },

        is_read:       { bsonType: "bool" },
        is_dismissed:  { bsonType: "bool" },
        detected_at:   { bsonType: "date" }
      }
    }
  }
});

db.anomaly_logs.createIndex({ user_id: 1, detected_at: -1 });
db.anomaly_logs.createIndex({ user_id: 1, is_read: 1 });
db.anomaly_logs.createIndex({ user_id: 1, severity: 1, detected_at: -1 });
// Auto-delete anomaly logs older than 1 year
db.anomaly_logs.createIndex(
  { detected_at: 1 },
  { expireAfterSeconds: 31536000, name: "ttl_anomaly_1yr" }
);


// ─────────────────────────────────────────────────────────────
// SUMMARY OF COLLECTIONS
// ─────────────────────────────────────────────────────────────
/*
 Collection           | Primary purpose
 ─────────────────────────────────────────────────────────────
 user_analytics       | Per-user rolling totals + AI insights
 category_summary     | Monthly spending per category (charts)
 monthly_reports      | Full monthly report with AI narrative
 dashboard_cache      | 15-min TTL widget cache (performance)
 spending_trends      | Multi-month trend per category
 anomaly_logs         | AI anomaly detection history
 ─────────────────────────────────────────────────────────────

 Update strategy:
  • user_analytics    → updated via event from transaction service
  • category_summary  → upsert on every transaction write (inc/dec)
  • monthly_reports   → cron job runs on 1st of each month
  • dashboard_cache   → regenerated on cache miss (TTL expired)
  • spending_trends   → updated monthly after monthly_reports generated
  • anomaly_logs      → written by AI/NLP anomaly detection worker
*/

// 7. financial_goals (Bổ sung)
// Theo dõi tiến độ mục tiêu tiết kiệm để AI đưa ra gợi ý sát hơn.
// db.createCollection("financial_goals", {
//   validator: {
//     $jsonSchema: {
//       bsonType: "object",
//       required: ["user_id", "goal_name", "target_amount"],
//       properties: {
//         user_id: { bsonType: "string" },
//         goal_name: { bsonType: "string" },
//         target_amount: { bsonType: "decimal128" },
//         current_amount: { bsonType: "decimal128" },
//         deadline: { bsonType: "date" },
//         status: { enum: ["active", "achieved", "failed"] }
//       }
//     }
//   }
// });
