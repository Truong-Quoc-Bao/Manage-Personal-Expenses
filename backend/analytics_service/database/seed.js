#!/usr/bin/env node
/**
 * ============================================================
 * seed.js  —  Analytics Service Data Seeder
 * ============================================================
 *
 * Loads JSON seed files and inserts into MongoDB analytics_db.
 *
 * Usage:
 *   node seed.js
 *
 * Or via npm script (add to package.json):
 *   "seed": "node database/seed.js"
 *
 * Env vars (optional, falls back to defaults):
 *   MONGO_URI=mongodb://localhost:27017
 *   MONGO_DB=analytics_db
 * ============================================================
 */

'use strict';

const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');

const {
  UserAnalytics,
  CategorySummary,
  MonthlyReport,
  DashboardCache,
  SpendingTrend,
  AnomalyLog,
} = require('../src/model');

// ── Config ───────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB  = process.env.MONGO_DB  || 'analytics_db';

/**
 * Build a valid connection string that places the database name
 * BEFORE any query-string parameters.
 *
 * Input examples:
 *   mongodb://admin:admin@mongodb:27017?authSource=admin   → append /analytics_db before ?
 *   mongodb://localhost:27017                              → append /analytics_db at end
 *   mongodb://localhost:27017/analytics_db                 → use as-is (db already set)
 *   mongodb+srv://user:pw@cluster.mongodb.net/?retryWrites=true → insert db before ?
 */
function buildConnectionString(uri, dbName) {
  // If URI already contains the DB name (path segment after host), use as-is
  // e.g. mongodb://host:27017/mydb  or  mongodb://host/mydb?opts
  const withoutProto = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  // withoutProto looks like: [user:pw@]host[:port][/path][?query]
  const slashAfterHost = withoutProto.indexOf('/');
  if (slashAfterHost !== -1) {
    // There is a slash — check if it has a non-empty path segment (i.e. a DB name)
    const afterSlash = withoutProto.slice(slashAfterHost + 1).split('?')[0];
    if (afterSlash.length > 0) {
      // DB already embedded in URI — just return it unchanged
      return uri;
    }
    // Slash exists but path is empty (e.g. "host:27017/?opts") — insert dbName
    return uri.replace(/\/(\?|$)/, `/${dbName}$1`);
  }

  // No slash at all after host — split on '?' and insert /dbName before query string
  const qIdx = uri.indexOf('?');
  if (qIdx !== -1) {
    return uri.slice(0, qIdx) + '/' + dbName + uri.slice(qIdx);
  }
  return uri + '/' + dbName;
}

// ── Helpers ──────────────────────────────────────────────────
const seedDir = __dirname;

function loadJson(filename) {
  const filepath = path.join(seedDir, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  File not found: ${filepath} — skipping`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

async function seedCollection(Model, docs, label) {
  if (!docs.length) {
    console.log(`  ⏭️  ${label}: no docs to insert`);
    return;
  }
  const userIds = [...new Set(docs.map(d => d.user_id).filter(Boolean))];
  if (userIds.length) {
    await Model.deleteMany({ user_id: { $in: userIds } });
  } else {
    await Model.deleteMany({});
  }
  const inserted = await Model.insertMany(docs, { ordered: false });
  console.log(`  ✅ ${label}: inserted ${inserted.length} documents`);
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Analytics Service — MongoDB Seeder');
  const connectionString = buildConnectionString(MONGO_URI, MONGO_DB);
  console.log(`  URI : ${connectionString}`);
  console.log('═══════════════════════════════════════════════════════');

  await mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('\n🔌 Connected to MongoDB\n');

  const userAnalyticsDocs   = loadJson('seed_user_analytics.json');
  const categorySummaryDocs = loadJson('seed_category_summary.json');
  const monthlyReportDocs   = loadJson('seed_monthly_reports.json');
  const spendingTrendDocs   = loadJson('seed_spending_trends.json');
  const dashboardCacheDocs  = loadJson('seed_dashboard_cache.json');
  const anomalyLogDocs      = loadJson('seed_anomaly_logs.json');

  console.log('📦 Seeding collections...\n');

  await seedCollection(UserAnalytics,   userAnalyticsDocs,   'user_analytics  (9 users)');
  await seedCollection(CategorySummary, categorySummaryDocs, 'category_summary (304 records)');
  await seedCollection(MonthlyReport,   monthlyReportDocs,   'monthly_reports  (135 records)');
  await seedCollection(SpendingTrend,   spendingTrendDocs,   'spending_trends  (22 records)');
  await seedCollection(DashboardCache,  dashboardCacheDocs,  'dashboard_cache  (9 users)');
  await seedCollection(AnomalyLog,      anomalyLogDocs,      'anomaly_logs     (12 records)');

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(' ✅ Seeding complete!');
  console.log('');
  console.log(' Summary:');
  console.log(`   user_analytics  : ${userAnalyticsDocs.length}`);
  console.log(`   category_summary: ${categorySummaryDocs.length}`);
  console.log(`   monthly_reports : ${monthlyReportDocs.length}`);
  console.log(`   spending_trends : ${spendingTrendDocs.length}`);
  console.log(`   dashboard_cache : ${dashboardCacheDocs.length}`);
  console.log(`   anomaly_logs    : ${anomalyLogDocs.length}`);
  console.log('═══════════════════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
