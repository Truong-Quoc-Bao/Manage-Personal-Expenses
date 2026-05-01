// ============================================================
// init_mongo.js
// Khởi tạo database MongoDB: tạo collections + indexes
// Database: finance_db
// Collections: transactions, category_summary, monthly_reports,
//              dashboard_cache, spending_trends, anomaly_logs, user_analytics
// ============================================================

const db = db.getSiblingDB("finance_db");

// ============================================================
// 1. TRANSACTIONS
// ============================================================
db.createCollection("transactions");

db.transactions.createIndex({ trans_id: 1 }, { unique: true, name: "idx_trans_id_unique" });
db.transactions.createIndex({ user_id: 1 }, { name: "idx_transactions_user_id" });
db.transactions.createIndex({ account_id: 1 }, { name: "idx_transactions_account_id" });
db.transactions.createIndex({ category_id: 1 }, { name: "idx_transactions_category_id" });
db.transactions.createIndex({ date: -1 }, { name: "idx_transactions_date_desc" });
db.transactions.createIndex({ user_id: 1, date: -1 }, { name: "idx_transactions_user_date" });
db.transactions.createIndex(
  { account_id: 1, date: -1 },
  { name: "idx_transactions_account_date" }
);
db.transactions.createIndex(
  { user_id: 1, transaction_type: 1, date: -1 },
  { name: "idx_transactions_user_type_date" }
);
db.transactions.createIndex(
  { account_id: 1, category_id: 1, date: -1 },
  { name: "idx_transactions_account_cat_date" }
);

print("✓ Collection 'transactions' created with indexes");

// ============================================================
// 2. CATEGORY SUMMARY
// ============================================================
db.createCollection("category_summary");

db.category_summary.createIndex({ user_id: 1 }, { name: "idx_cat_summary_user_id" });
db.category_summary.createIndex({ account_id: 1 }, { name: "idx_cat_summary_account_id" });
db.category_summary.createIndex({ category_id: 1 }, { name: "idx_cat_summary_category_id" });
db.category_summary.createIndex(
  { account_id: 1, category_id: 1, year: 1, month: 1 },
  { unique: true, name: "idx_cat_summary_unique" }
);
db.category_summary.createIndex(
  { user_id: 1, year: 1, month: 1 },
  { name: "idx_cat_summary_user_ym" }
);

print("✓ Collection 'category_summary' created with indexes");

// ============================================================
// 3. MONTHLY REPORTS
// ============================================================
db.createCollection("monthly_reports");

db.monthly_reports.createIndex({ user_id: 1 }, { name: "idx_monthly_reports_user_id" });
db.monthly_reports.createIndex(
  { user_id: 1, year: 1, month: 1 },
  { unique: true, name: "idx_monthly_reports_unique" }
);
db.monthly_reports.createIndex(
  { user_id: 1, year: -1, month: -1 },
  { name: "idx_monthly_reports_user_ym_desc" }
);

print("✓ Collection 'monthly_reports' created with indexes");

// ============================================================
// 4. DASHBOARD CACHE
// ============================================================
db.createCollection("dashboard_cache");

db.dashboard_cache.createIndex({ user_id: 1 }, { name: "idx_dashboard_user_id" });
db.dashboard_cache.createIndex(
  { account_id: 1 },
  { unique: true, name: "idx_dashboard_account_unique" }
);
db.dashboard_cache.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: "idx_dashboard_ttl" }
);

print("✓ Collection 'dashboard_cache' created with indexes");

// ============================================================
// 5. SPENDING TRENDS
// ============================================================
db.createCollection("spending_trends");

db.spending_trends.createIndex({ user_id: 1 }, { name: "idx_spending_trends_user_id" });
db.spending_trends.createIndex({ account_id: 1 }, { name: "idx_spending_trends_account_id" });
db.spending_trends.createIndex(
  { account_id: 1, category_id: 1 },
  { unique: true, name: "idx_spending_trends_unique" }
);
db.spending_trends.createIndex(
  { user_id: 1, category_id: 1 },
  { name: "idx_spending_trends_user_cat" }
);

print("✓ Collection 'spending_trends' created with indexes");

// ============================================================
// 6. ANOMALY LOGS
// ============================================================
db.createCollection("anomaly_logs");

db.anomaly_logs.createIndex({ user_id: 1 }, { name: "idx_anomaly_user_id" });
db.anomaly_logs.createIndex({ account_id: 1 }, { name: "idx_anomaly_account_id" });
db.anomaly_logs.createIndex({ category_id: 1 }, { name: "idx_anomaly_category_id" });
db.anomaly_logs.createIndex({ detected_at: -1 }, { name: "idx_anomaly_detected_at_desc" });
db.anomaly_logs.createIndex(
  { user_id: 1, is_read: 1 },
  { name: "idx_anomaly_user_unread" }
);
db.anomaly_logs.createIndex(
  { user_id: 1, is_dismissed: 1, detected_at: -1 },
  { name: "idx_anomaly_user_active" }
);
db.anomaly_logs.createIndex(
  { user_id: 1, severity: 1, detected_at: -1 },
  { name: "idx_anomaly_user_severity" }
);

print("✓ Collection 'anomaly_logs' created with indexes");

// ============================================================
// 7. USER ANALYTICS
// ============================================================
db.createCollection("user_analytics");

db.user_analytics.createIndex(
  { user_id: 1 },
  { unique: true, name: "idx_user_analytics_user_id_unique" }
);
db.user_analytics.createIndex(
  { "streak.saving_months": -1 },
  { name: "idx_user_analytics_streak" }
);

print("✓ Collection 'user_analytics' created with indexes");

print("\n✅ init_mongo.js hoàn tất — database 'finance_db' đã sẵn sàng.");
