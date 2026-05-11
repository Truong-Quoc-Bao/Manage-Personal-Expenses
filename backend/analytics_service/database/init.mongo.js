 
db = db.getSiblingDB('analytics_db');
 
db.createCollection('user_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id'],
      properties: {
        user_id:         { bsonType: 'string' },
        total_income:    { bsonType: 'double' },
        total_expense:   { bsonType: 'double' },
        current_balance: { bsonType: 'double' },
        current_month: {
          bsonType: 'object',
          properties: {
            year:         { bsonType: 'int' },
            month:        { bsonType: 'int' },
            income:       { bsonType: 'double' },
            expense:      { bsonType: 'double' },
            savings:      { bsonType: 'double' },
            savings_rate: { bsonType: 'double' },
          },
        },
        top_categories: { bsonType: 'array' },
        ai_insights:    { bsonType: 'object' },
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
 
db.createCollection('category_summary', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'category_id', 'year', 'month'],
      properties: {
        user_id:       { bsonType: 'string' },
        category_id:   { bsonType: 'string' },
        category_name: { bsonType: 'string' },
        category_type: {
          bsonType: 'string',
          enum: ['income', 'expense', 'saving', 'investment'],
        },
        year:              { bsonType: 'int' },
        month:             { bsonType: 'int' },
        total_amount:      { bsonType: 'double' },
        transaction_count: { bsonType: 'int' },
        budget_limit:      { bsonType: 'double' },
        is_over_budget:    { bsonType: 'bool' },
        daily_breakdown:   { bsonType: 'array' },
        updated_at:        { bsonType: 'date' },
      },
    },
  },
  validationAction: 'warn',
});

db.category_summary.createIndex(
  { user_id: 1, year: -1, month: -1 },
  { name: 'idx_user_month' }
);
db.category_summary.createIndex(
  { user_id: 1, category_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_user_category_month' }
);
db.category_summary.createIndex(
  { user_id: 1, category_type: 1, year: -1, month: -1 },
  { name: 'idx_user_type_month' }
);
db.category_summary.createIndex(
  { is_over_budget: 1, user_id: 1 },
  { name: 'idx_over_budget' }
);

print('[init] ✅  category_summary — collection + indexes created');
 
db.createCollection('monthly_reports', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'year', 'month'],
      properties: {
        user_id:             { bsonType: 'string' },
        year:                { bsonType: 'int' },
        month:               { bsonType: 'int' },
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
  { user_id: 1, year: -1, month: -1 },
  { unique: true, name: 'idx_user_year_month' }
);
db.monthly_reports.createIndex({ generated_at: -1 }, { name: 'idx_generated_at' });
db.monthly_reports.createIndex({ status: 1, user_id: 1 }, { name: 'idx_status_user' });

print('[init] ✅  monthly_reports — collection + indexes created');
 
db.createCollection('dashboard_cache');

db.dashboard_cache.createIndex(
  { user_id: 1 },
  { unique: true, name: 'idx_user_id_unique' }
);
 db.dashboard_cache.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: 'ttl_expires_at' }
);

print('[init] ✅  dashboard_cache — collection + TTL index created (15 min)');
 
db.createCollection('spending_trends');

db.spending_trends.createIndex(
  { user_id: 1, category_id: 1 },
  { unique: true, name: 'idx_user_category_trend' }
);
db.spending_trends.createIndex(
  { user_id: 1, category_type: 1 },
  { name: 'idx_user_type_trend' }
);

print('[init] ✅  spending_trends — collection + indexes created');
 
db.createCollection('anomaly_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'type', 'detected_at'],
      properties: {
        user_id:    { bsonType: 'string' },
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
        transaction_id: { bsonType: 'string' },
        category_id:    { bsonType: 'string' },
        amount_flagged: { bsonType: 'double' },
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
  { user_id: 1, detected_at: -1 },
  { name: 'idx_user_detected' }
);
db.anomaly_logs.createIndex(
  { user_id: 1, is_read: 1 },
  { name: 'idx_user_unread' }
);
db.anomaly_logs.createIndex(
  { user_id: 1, severity: 1, detected_at: -1 },
  { name: 'idx_user_severity' }
);
 db.anomaly_logs.createIndex(
  { detected_at: 1 },
  { expireAfterSeconds: 31536000, name: 'ttl_anomaly_1yr' }
);

print('[init] ✅  anomaly_logs — collection + indexes + TTL (1 yr) created');
 
print('');
print('═══════════════════════════════════════════════════════');
print(' Analytics Service — MongoDB init complete ✅');
print(' Database : analytics_db');
print(' Collections created:');
print('   • user_analytics');
print('   • category_summary');
print('   • monthly_reports');
print('   • dashboard_cache   (TTL 15 min)');
print('   • spending_trends');
print('   • anomaly_logs      (TTL 1 year)');
print('═══════════════════════════════════════════════════════');