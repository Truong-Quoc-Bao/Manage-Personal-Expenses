/**
 * ============================================================
 * init_mongo.js
 * MongoDB initialization script for Analytics Service.
 *
 * Usage (mongosh / Docker entrypoint):
 *   mongosh --username $MONGO_INITDB_ROOT_USERNAME \
 *           --password $MONGO_INITDB_ROOT_PASSWORD \
 *           --authenticationDatabase admin \
 *           analytics_db init_mongo.js
 *
 * Or via Docker Compose volume mount to:
 *   /docker-entrypoint-initdb.d/init_mongo.js
 * ============================================================
 */

// ── Switch to / create the analytics database ────────────────
db = db.getSiblingDB('analytics_db');

// ─────────────────────────────────────────────────────────────
// 1. accounts
// Key field : user_id (string UUID)
// account_id: array of account UUIDs belonging to this user
// ─────────────────────────────────────────────────────────────
db.createCollection('accounts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'user_name', 'email'],
      properties: {
        user_id:    { bsonType: 'string' },
        user_name:  { bsonType: 'string' },
        email:      { bsonType: 'string' },
        birth:      { bsonType: 'string' },
        telegram_id: {},
        account_id: { bsonType: 'array', items: { bsonType: 'string' } },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.accounts.createIndex({ user_id: 1 }, { unique: true, name: 'idx_user_id_unique' });
db.accounts.createIndex({ email: 1 },   { unique: true, name: 'idx_email_unique' });
db.accounts.createIndex({ account_id: 1 }, { name: 'idx_account_id' });

print('[init] ✅  accounts — collection + indexes created');

// ─────────────────────────────────────────────────────────────
// 2. transactions
// Key field : account_id (string UUID, references one account)
// ─────────────────────────────────────────────────────────────
db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['trans_id', 'account_id', 'amount', 'transaction_type', 'date'],
      properties: {
        trans_id:         { bsonType: 'string' },
        account_id:       { bsonType: 'string' },
        category_id:      { bsonType: 'string' },
        amount:           { bsonType: ['double', 'int', 'long'] },
        transaction_type: {
          bsonType: 'string',
          enum: ['income', 'expense', 'saving', 'investment'],
        },
        description: { bsonType: 'string' },
        date:        { bsonType: 'date' },
        note:        {},
        created_at:  { bsonType: 'date' },
        updated_at:  { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.transactions.createIndex({ trans_id: 1 },   { unique: true, name: 'idx_trans_id_unique' });
db.transactions.createIndex({ account_id: 1, date: -1 }, { name: 'idx_account_date' });
db.transactions.createIndex({ account_id: 1, category_id: 1, date: -1 }, { name: 'idx_account_category_date' });
db.transactions.createIndex({ account_id: 1, transaction_type: 1, date: -1 }, { name: 'idx_account_type_date' });

print('[init] ✅  transactions — collection + indexes created');

// ─────────────────────────────────────────────────────────────
// 3. user_analytics
// Key field : user_id (string UUID)
// account_id: array — all accounts belonging to this user
// ─────────────────────────────────────────────────────────────
db.createCollection('user_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id'],
      properties: {
        user_id:         { bsonType: 'string' },
        display_name:    { bsonType: 'string' },
        account_id:      { bsonType: 'array', items: { bsonType: 'string' } },
        total_income:    { bsonType: ['double', 'int', 'long'] },
        total_expense:   { bsonType: ['double', 'int', 'long'] },
        current_balance: { bsonType: ['double', 'int', 'long'] },
        current_month: {
          bsonType: 'object',
          properties: {
            year:         { bsonType: ['int', 'double', 'long'] },
            month:        { bsonType: ['int', 'double', 'long'] },
            income:       { bsonType: ['double', 'int', 'long'] },
            expense:      { bsonType: ['double', 'int', 'long'] },
            savings:      { bsonType: ['double', 'int', 'long'] },
            savings_rate: { bsonType: ['double', 'int', 'long'] },
          },
        },
        top_categories: { bsonType: 'array' },
        ai_insights:    { bsonType: 'object' },
        budget_alert:   { bsonType: 'object' },
        goal_tracking:  { bsonType: 'object' },
        streak:         { bsonType: 'object' },
        created_at:     { bsonType: 'date' },
        updated_at:     { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.user_analytics.createIndex({ user_id: 1 }, { unique: true, name: 'idx_user_id_unique' });
db.user_analytics.createIndex(
  { 'current_month.year': 1, 'current_month.month': 1 },
  { name: 'idx_current_month' }
);
db.user_analytics.createIndex({ updated_at: -1 }, { name: 'idx_updated_at' });

print('[init] ✅  user_analytics — collection + indexes created');

// ─────────────────────────────────────────────────────────────
// 4. category_summary
// Key field : account_id (string UUID)
// Unique on  : account_id + category_id + year + month
// ─────────────────────────────────────────────────────────────
db.createCollection('category_summary', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['account_id', 'category_id', 'year', 'month'],
      properties: {
        account_id:        { bsonType: 'string' },
        category_id:       { bsonType: 'string' },
        category_name:     { bsonType: 'string' },
        category_type: {
          bsonType: 'string',
          enum: ['income', 'expense', 'saving', 'investment'],
        },
        year:              { bsonType: ['int', 'double', 'long'] },
        month:             { bsonType: ['int', 'double', 'long'] },
        total_amount:      { bsonType: ['double', 'int', 'long'] },
        transaction_count: { bsonType: ['int', 'double', 'long'] },
        budget_limit:      { bsonType: ['double', 'int', 'long'] },
        is_over_budget:    { bsonType: 'bool' },
        daily_breakdown:   { bsonType: 'array' },
        updated_at:        { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.category_summary.createIndex(
  { account_id: 1, year: -1, month: -1 },
  { name: 'idx_account_month' }
);
db.category_summary.createIndex(
  { account_id: 1, category_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_account_category_month' }
);
db.category_summary.createIndex(
  { account_id: 1, category_type: 1, year: -1, month: -1 },
  { name: 'idx_account_type_month' }
);
db.category_summary.createIndex(
  { is_over_budget: 1, account_id: 1 },
  { name: 'idx_over_budget' }
);

print('[init] ✅  category_summary — collection + indexes created');

// ─────────────────────────────────────────────────────────────
// 5. monthly_reports
// Key field : account_id (string UUID)
// Unique on  : account_id + year + month
// ─────────────────────────────────────────────────────────────
db.createCollection('monthly_reports', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['account_id', 'year', 'month'],
      properties: {
        account_id:          { bsonType: 'string' },
        year:                { bsonType: ['int', 'double', 'long'] },
        month:               { bsonType: ['int', 'double', 'long'] },
        summary:             { bsonType: 'object' },
        income_by_category:  { bsonType: 'array' },
        expense_by_category: { bsonType: 'array' },
        weekly_trend:        { bsonType: 'array' },
        daily_cashflow:      { bsonType: 'array' },
        top_expenses:        { bsonType: 'array' },
        comparison:          { bsonType: 'object' },
        ai_report:           { bsonType: 'object' },
        status: {
          bsonType: 'string',
          enum: ['draft', 'generated', 'reviewed'],
        },
        generated_at: { bsonType: 'date' },
        updated_at:   { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.monthly_reports.createIndex(
  { account_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_account_year_month' }
);
db.monthly_reports.createIndex({ generated_at: -1 }, { name: 'idx_generated_at' });
db.monthly_reports.createIndex({ status: 1, account_id: 1 }, { name: 'idx_status_account' });

print('[init] ✅  monthly_reports — collection + indexes created');

// ─────────────────────────────────────────────────────────────
// 6. dashboard_cache  (TTL: 15 minutes via expires_at field)
// Key field : account_id (string UUID)
// ─────────────────────────────────────────────────────────────
db.createCollection('dashboard_cache');

db.dashboard_cache.createIndex(
  { account_id: 1 },
  { unique: true, name: 'idx_account_id_unique' }
);
// TTL index — MongoDB removes document automatically when expires_at <= now
db.dashboard_cache.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: 'ttl_expires_at' }
);

print('[init] ✅  dashboard_cache — collection + TTL index created (15 min)');

// ─────────────────────────────────────────────────────────────
// 7. spending_trends
// Key field : account_id (string UUID)
// Unique on  : account_id + category_id
// ─────────────────────────────────────────────────────────────
db.createCollection('spending_trends');

db.spending_trends.createIndex(
  { account_id: 1, category_id: 1 },
  { unique: true, name: 'idx_account_category_trend' }
);
db.spending_trends.createIndex(
  { account_id: 1, category_type: 1 },
  { name: 'idx_account_type_trend' }
);

print('[init] ✅  spending_trends — collection + indexes created');

// ─────────────────────────────────────────────────────────────
// 8. anomaly_logs  (TTL: 1 year)
// Key field : account_id (string UUID)
// ─────────────────────────────────────────────────────────────
db.createCollection('anomaly_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['account_id', 'type', 'detected_at'],
      properties: {
        account_id: { bsonType: 'string' },
        type: {
          bsonType: 'string',
          enum: [
            'unusual_amount',
            'unusual_frequency',
            'category_spike',
            'income_drop',
            'recurring_missed',
          ],
        },
        severity: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high'],
        },
        description:    { bsonType: 'string' },
        transaction_id: {},
        category_id:    {},
        amount_flagged: { bsonType: ['double', 'int', 'long'] },
        expected_range: { bsonType: 'object' },
        is_read:        { bsonType: 'bool' },
        is_dismissed:   { bsonType: 'bool' },
        detected_at:    { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.anomaly_logs.createIndex(
  { account_id: 1, detected_at: -1 },
  { name: 'idx_account_detected' }
);
db.anomaly_logs.createIndex(
  { account_id: 1, is_read: 1 },
  { name: 'idx_account_unread' }
);
db.anomaly_logs.createIndex(
  { account_id: 1, severity: 1, detected_at: -1 },
  { name: 'idx_account_severity' }
);
// TTL index — auto-delete logs older than 365 days
db.anomaly_logs.createIndex(
  { detected_at: 1 },
  { expireAfterSeconds: 31536000, name: 'ttl_anomaly_1yr' }
);

print('[init] ✅  anomaly_logs — collection + indexes + TTL (1 yr) created');

// ─────────────────────────────────────────────────────────────
// Done
// ─────────────────────────────────────────────────────────────
print('');
print('═══════════════════════════════════════════════════════');
print(' Analytics Service — MongoDB init complete ✅');
print(' Database : analytics_db');
print(' Collections created:');
print('   • accounts');
print('   • transactions');
print('   • user_analytics');
print('   • category_summary');
print('   • monthly_reports');
print('   • dashboard_cache   (TTL 15 min via expires_at)');
print('   • spending_trends');
print('   • anomaly_logs      (TTL 1 year)');
print('═══════════════════════════════════════════════════════');