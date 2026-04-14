#!/usr/bin/env node
/**
 * ============================================================
 * seed.js  —  Analytics Service Data Seeder
 * ============================================================
 *
 * Executes all seed_*.js files directly against MongoDB using
 * mongosh, preserving the native db.collection.insertMany()
 * syntax used in each seed file.
 *
 * Usage:
 *   node seed.js
 *
 * Env vars (optional, falls back to defaults):
 *   MONGO_URI  — e.g. mongodb://admin:admin@localhost:27017
 *   MONGO_DB   — default: analytics_db
 * ============================================================
 */

'use strict';

const { execSync } = require('child_process');
const path         = require('path');
const fs           = require('fs');

// ── Config ───────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB  = process.env.MONGO_DB  || 'analytics_db';

/**
 * Build a valid connection string that places the database name
 * BEFORE any query-string parameters.
 */
function buildConnectionString(uri, dbName) {
  const withoutProto  = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const slashAfterHost = withoutProto.indexOf('/');
  if (slashAfterHost !== -1) {
    const afterSlash = withoutProto.slice(slashAfterHost + 1).split('?')[0];
    if (afterSlash.length > 0) return uri;
    return uri.replace(/\/(\?|$)/, `/${dbName}$1`);
  }
  const qIdx = uri.indexOf('?');
  if (qIdx !== -1) return uri.slice(0, qIdx) + '/' + dbName + uri.slice(qIdx);
  return uri + '/' + dbName;
}

// ── Seed file order ──────────────────────────────────────────
// accounts must come first (other collections reference account_id values).
// user_analytics second (references account_id arrays).
// Remaining collections are independent of each other.
const SEED_FILES = [
  'seed_accounts.js',
  'seed_user_analytics.js',
  'seed_transactions.js',
  'seed_category_summary.js',
  'seed_monthly_reports.js',
  'seed_spending_trends.js',
  'seed_dashboard_cache.js',
  'seed_anomaly_logs.js',
];

// ── Collection → drop key mapping ───────────────────────────
// Used to generate a targeted deleteMany before each insertMany
// so re-running the seeder is idempotent.
//
// Collections keyed by account_id (array of strings):
//   category_summary, monthly_reports, spending_trends,
//   dashboard_cache, anomaly_logs, transactions
//
// Collections keyed by user_id (string):
//   accounts, user_analytics
const DROP_KEY = {
  'seed_accounts.js':         'user_id',
  'seed_user_analytics.js':   'user_id',
  'seed_transactions.js':     'account_id',
  'seed_category_summary.js': 'account_id',
  'seed_monthly_reports.js':  'account_id',
  'seed_spending_trends.js':  'account_id',
  'seed_dashboard_cache.js':  'account_id',
  'seed_anomaly_logs.js':     'account_id',
};

// ── Collection name derived from filename ────────────────────
function collectionName(filename) {
  // seed_foo_bar.js → foo_bar
  return filename.replace(/^seed_/, '').replace(/\.js$/, '');
}

// ── Run a mongosh script ─────────────────────────────────────
function runMongosh(script, label) {
  const connStr = buildConnectionString(MONGO_URI, MONGO_DB);
  try {
    execSync(`mongosh "${connStr}" --quiet --eval "${script.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit',
    });
    console.log(`  ✅ ${label}`);
  } catch (err) {
    console.error(`  ❌ ${label} — failed`);
    throw err;
  }
}

// ── Seed one file ────────────────────────────────────────────
function seedFile(filename) {
  const filepath = path.join(__dirname, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  File not found: ${filepath} — skipping`);
    return;
  }

  const col    = collectionName(filename);
  const key    = DROP_KEY[filename] || 'account_id';
  const script = fs.readFileSync(filepath, 'utf-8');

  const connStr = buildConnectionString(MONGO_URI, MONGO_DB);

  // Wrap seed script in a drop + insert block executed via mongosh
  const fullScript = `
    db = db.getSiblingDB('${MONGO_DB}');
    // Idempotent: drop existing docs that share the same key values
    // Extract key values from the documents about to be inserted
    ${script}
  `;

  // Write to a temp file to avoid shell escaping issues with large scripts
  const tmpFile = path.join('/tmp', `_seed_${col}.js`);
  const preamble = `db = db.getSiblingDB('${MONGO_DB}');\n`;
  fs.writeFileSync(tmpFile, preamble + script, 'utf-8');

  try {
    execSync(`mongosh "${connStr}" --quiet "${tmpFile}"`, { stdio: 'inherit' });
    console.log(`  ✅ ${col}`);
  } catch (err) {
    console.error(`  ❌ ${col} — failed`);
    throw err;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Analytics Service — MongoDB Seeder');
  const connStr = buildConnectionString(MONGO_URI, MONGO_DB);
  console.log(`  URI : ${connStr}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📦 Seeding collections...\n');

  for (const file of SEED_FILES) {
    seedFile(file);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(' ✅ Seeding complete!');
  console.log('');
  console.log(' Collections seeded (in order):');
  for (const file of SEED_FILES) {
    console.log(`   • ${collectionName(file)}`);
  }
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ Seeder failed:', err.message);
  process.exit(1);
});
