import dotenv from 'dotenv';
dotenv.config();

import validator from 'validator';
import express from 'express';
import multer from 'multer';

import { createServer } from 'http';
import { Server } from 'socket.io';
import webpush from 'web-push';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import got from 'got';
import { getBestModel, getStatusData } from './super_check.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMoneyGuardRules } from './systemRules.js';
import {
  getUserProfile,
  listAccounts,
  createAccount as createAccountApi,
  getOrCreateDefaultAccount,
  listCategories,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
  findCategoryByName,
  findOrCreateCategoryByName,
  listTransactionsPage,
  listAllTransactions,
  createTransaction as createTransactionApi,
  getTransactionById,
  updateTransactionApi,
  deleteTransactionApi,
  listBudgets,
  listBudgetsByMonth,
  upsertBudget,
  findBudgetByCategoryAndMonth,
  deleteBudgetApi,
} from './serviceClients.js';

const createBankAccount = (userId, accountName) =>
  createAccountApi(userId, { accountName, type: 'bank', balance: 0, currency: 'VND' });

import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

import pg from 'pg';
const { Pool } = pg;

// Cấu hình kết nối PostgreSQL
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// export default pool;

// // Kiểm tra kết nối
// pool.connect((err) => {
//   if (err) console.error('❌ Lỗi kết nối Postgres:', err.stack);
//   else console.log('✅ Đã kết nối PostgreSQL thành công');
// });

const cleanUrl = process.env.AI_DATABASE_URL || '';
const SCHEMA_NAME = 'ai_service'; // Tên schema của bạn

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
});

// Cách để ép tất cả kết nối dùng đúng Schema
pool.on('connect', (client) => {
  client.query(
    'SET search_path TO ai_service, transaction_service, category_service, budgets_service, public',
  );
});

// Đoạn check kết nối của bạn
pool.connect((err, client, release) => {
  if (err) {
    console.log(`📝 URL đang dùng: "${cleanUrl.substring(0, 30)}..."`);
    console.error('❌ Lỗi kết nối Postgres:', err.message);
  } else {
    console.log(`✅ Kết nối thành công tới Schema: ${SCHEMA_NAME}`);

    // Test thử xem có đọc được bảng trong schema đó không
    client.query('SELECT current_schema()', (err, res) => {
      release(); // Giải phóng client lại cho pool
      if (!err) {
        console.log('📂 Schema hiện tại đang đứng là:', res.rows[0].current_schema);
      }
    });
  }
});
// dotenv.config();
const app = express();

// Khởi tạo httpServer và Socket.io ngay từ đầu
const httpServer = createServer(app);

// soket
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// Cấu hình multer để xử lý file ảnh (lưu tạm trong bộ nhớ)
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ limit: '10mb' })); // tránh bị spam payload lớn
app.use(express.static('public')); // phục vụ index.html, css, js

const PORT = process.env.AI_PORT || 4005;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY chưa được set trong file .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

let chatHistory = [];

let lastUserMessage = { time: 0, content: '' };
let lastSavedTransaction = { time: 0, content: '' };
let subscriptions = [];

const userNameCache = new Map();
async function getUserName(userId) {
  if (userNameCache.has(userId)) return userNameCache.get(userId);
  try {
    const result = await pool.query('SELECT user_name FROM user_service.users WHERE user_id = $1', [
      userId,
    ]);
    const name = result.rows[0]?.user_name || 'Người dùng';
    userNameCache.set(userId, name);
    setTimeout(() => userNameCache.delete(userId), 10 * 60 * 1000);
    return name;
  } catch (err) {
    console.error('❌ Lỗi lấy user_name:', err.message);
    return 'Người dùng';
  }
}

// 1. Cấu hình Web Push
webpush.setVapidDetails(
  'mailto:baotruong.190404@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
);

// ===========================================================================
// HELPER tổng hợp dữ liệu từ các microservice (thay cho các SQL JOIN cross-schema cũ)
// ===========================================================================

const monthDateRange = (month, year) => {
  const m = Number(month);
  const y = Number(year);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

const toNumber = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

// Lấy toàn bộ giao dịch trong tháng (đã include_details=true để có category_name).
async function fetchTransactionsByMonth(userId, month, year, transactionType) {
  const { start, end } = monthDateRange(month, year);
  return await listAllTransactions(userId, {
    dateFrom: start,
    dateTo: end,
    transactionType,
    includeDetails: true,
    pageSize: 200,
  });
}

// Tính tổng thu/chi/đếm số giao dịch trong tháng.
async function aggregateMonthlyTotals(userId, month, year) {
  const txs = await fetchTransactionsByMonth(userId, month, year);
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  for (const t of txs) {
    const type = String(t.transactionType || t.transaction_type || '').toLowerCase();
    const amount = toNumber(t.amount);
    if (type === 'income') {
      totalIncome += amount;
      incomeCount += 1;
    } else if (type === 'expense') {
      totalExpense += amount;
      expenseCount += 1;
    }
  }
  return { totalIncome, totalExpense, incomeCount, expenseCount, transactions: txs };
}

// Gom giao dịch theo (category_name, transaction_type) cho dashboard /stats.
function groupByCategoryAndType(transactions) {
  const grouped = new Map();
  for (const t of transactions) {
    const type = String(t.transactionType || t.transaction_type || '').toLowerCase();
    const name = t.categoryName || t.category_name || 'Chưa phân loại';
    const amount = toNumber(t.amount);
    const key = `${name}__${type}`;
    if (!grouped.has(key)) {
      grouped.set(key, { category_name: name, transaction_type: type, amount: 0 });
    }
    grouped.get(key).amount += amount;
  }
  return Array.from(grouped.values());
}

// Lấy báo cáo theo từng category cho tháng (spent + limit_amount), chỉ cho expense.
async function buildCategoryReport(userId, month, year) {
  const [categories, monthTxs, monthBudgets] = await Promise.all([
    listCategories(userId),
    fetchTransactionsByMonth(userId, month, year, 'expense'),
    listBudgetsByMonth(userId, month, year),
  ]);

  const spentByCat = new Map();
  for (const t of monthTxs) {
    const cid = t.categoryId || t.category_id;
    if (!cid) continue;
    spentByCat.set(cid, (spentByCat.get(cid) || 0) + toNumber(t.amount));
  }

  const budgetByCat = new Map();
  for (const b of monthBudgets) {
    if (b.category_id) budgetByCat.set(b.category_id, toNumber(b.amount_limit));
  }

  return categories.map((c) => ({
    category_id: c.category_id,
    category_name: c.category_name,
    icon: c.icon?.icon_code || c.icon_code || '',
    spent: spentByCat.get(c.category_id) || 0,
    limit_amount: budgetByCat.get(c.category_id) || null,
  }));
}

// Tổng amount_limit của tháng/năm.
async function totalBudgetLimit(userId, month, year) {
  const monthBudgets = await listBudgetsByMonth(userId, month, year);
  return monthBudgets.reduce((sum, b) => sum + toNumber(b.amount_limit), 0);
}

// Lấy top N giao dịch gần nhất.
async function fetchRecentTransactions(userId, limit = 10) {
  const page = await listTransactionsPage(userId, {
    page: 1,
    pageSize: limit,
    includeDetails: true,
  });
  return page.items || [];
}

// ===========================================================================
// Bộ xử lý <query_db> qua API (thay thế nguyên block SQL trong /chat).
// Trả về `null` nếu không khớp loại nào, hoặc một object data theo shape cũ
// để phần render bên dưới (`dataFound`) tiếp tục dùng được.
// ===========================================================================
async function runQueryDbViaApi(queryData, userId, currentMonth, currentYear) {
  // 1. last_week: tổng chi tuần trước.
  if (queryData.time_range === 'last_week') {
    const now = new Date();
    const day = now.getDay() || 7;
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - day + 1);
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const txs = await listAllTransactions(userId, {
      dateFrom: startOfLastWeek.toISOString(),
      dateTo: new Date(startOfThisWeek.getTime() - 1).toISOString(),
      transactionType: 'expense',
      includeDetails: false,
    });
    const total = txs.reduce((s, t) => s + toNumber(t.amount), 0);
    return { total, count: txs.length };
  }

  // 2. start_date + end_date (không kèm category): tổng chi trong khoảng.
  if (queryData.start_date && queryData.end_date && queryData.type !== 'category_spending_range') {
    const txs = await listAllTransactions(userId, {
      dateFrom: queryData.start_date,
      dateTo: queryData.end_date,
      transactionType: 'expense',
      includeDetails: false,
    });
    return {
      total: txs.reduce((s, t) => s + toNumber(t.amount), 0),
      count: txs.length,
    };
  }

  // 3. total_spending tháng (dùng cho cả income lẫn expense gốc — gốc cũ chỉ dùng expense).
  if (queryData.type === 'total_spending') {
    const month = Number(queryData.month || currentMonth);
    const year = Number(queryData.year || currentYear);
    const stats = await aggregateMonthlyTotals(userId, month, year);
    return {
      total: stats.totalExpense,
      total_income: stats.totalIncome,
      total_expense: stats.totalExpense,
      count: stats.expenseCount + stats.incomeCount,
    };
  }

  // 5. category_spending theo tháng.
  if (queryData.type === 'category_spending' && queryData.category) {
    const month = Number(queryData.month || currentMonth);
    const year = Number(queryData.year || currentYear);
    const cat = await findCategoryByName(userId, queryData.category);
    if (!cat) return { total: 0, count: 0 };
    const { start, end } = monthDateRange(month, year);
    const txs = await listAllTransactions(userId, {
      dateFrom: start,
      dateTo: end,
      transactionType: 'expense',
      categoryId: cat.category_id,
      includeDetails: false,
    });
    return {
      total: txs.reduce((s, t) => s + toNumber(t.amount), 0),
      count: txs.length,
    };
  }

  // 6. top_spending_day: ngày trong tuần tiêu nhiều nhất tháng hiện tại.
  if (queryData.type === 'top_spending_day') {
    const txs = await fetchTransactionsByMonth(userId, currentMonth, currentYear, 'expense');
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const buckets = new Map();
    for (const t of txs) {
      const d = new Date(t.date);
      const dow = d.getDay();
      const cur = buckets.get(dow) || { total: 0, count: 0 };
      cur.total += toNumber(t.amount);
      cur.count += 1;
      buckets.set(dow, cur);
    }
    if (!buckets.size) return null;
    let bestDow = 0;
    let best = { total: 0, count: 0 };
    for (const [dow, val] of buckets) {
      if (val.total > best.total) {
        best = val;
        bestDow = dow;
      }
    }
    return { day_name: dayNames[bestDow], total_day: best.total, count: best.count };
  }

  // 7. compare_weeks: so sánh chi tiêu tuần này vs tuần trước.
  if (queryData.type === 'compare_weeks') {
    const now = new Date();
    const day = now.getDay() || 7;
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - day + 1);
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const txs = await listAllTransactions(userId, {
      dateFrom: startOfLastWeek.toISOString(),
      transactionType: 'expense',
      includeDetails: false,
    });
    let thisWeek = 0;
    let lastWeek = 0;
    for (const t of txs) {
      const d = new Date(t.date);
      const amt = toNumber(t.amount);
      if (d >= startOfThisWeek) thisWeek += amt;
      else if (d >= startOfLastWeek) lastWeek += amt;
    }
    return { this_week: thisWeek, last_week: lastWeek };
  }

  // 8. budget_check: kiểm tra hạn mức cho category trong tháng.
  if (queryData.type === 'budget_check') {
    const month = Number(queryData.month || currentMonth);
    const year = Number(queryData.year || currentYear);
    let cat = null;
    if (queryData.category) {
      cat = await findCategoryByName(userId, queryData.category);
      if (!cat) return null;
    }
    const monthBudgets = await listBudgetsByMonth(userId, month, year);
    const budget = cat
      ? monthBudgets.find((b) => String(b.category_id) === String(cat.category_id))
      : monthBudgets[0];
    if (!budget) return null;
    const { start, end } = monthDateRange(month, year);
    const txs = await listAllTransactions(userId, {
      dateFrom: start,
      dateTo: end,
      transactionType: 'expense',
      categoryId: budget.category_id,
      includeDetails: false,
    });
    const spent = txs.reduce((s, t) => s + toNumber(t.amount), 0);
    return {
      category_name: cat?.category_name || queryData.category || '',
      amount_limit: toNumber(budget.amount_limit),
      spent,
      remaining: toNumber(budget.amount_limit) - spent,
      month,
      year,
    };
  }

  // 9. budget_upsert.
  if (queryData.type === 'budget_upsert') {
    const month = Number(queryData.month || currentMonth);
    const year = Number(queryData.year || currentYear);
    const { start, end } = monthDateRange(month, year);
    const cat = await findOrCreateCategoryByName(userId, queryData.category, { type: 'expense' });
    const result = await upsertBudget(userId, {
      title: queryData.category,
      categoryId: cat.category_id,
      type: 'limit',
      amountLimit: toNumber(queryData.amount),
      dateStart: queryData.start_date || start,
      dateEnd: queryData.end_date || end,
      month,
      year,
    });
    return {
      category_name: queryData.category,
      amount_limit: toNumber(result?.amount_limit ?? queryData.amount),
      spent: 0,
      remaining: toNumber(result?.amount_limit ?? queryData.amount),
      month,
      year,
    };
  }

  // 10. budget_delete.
  if (queryData.type === 'budget_delete') {
    const month = Number(queryData.month || currentMonth);
    const year = Number(queryData.year || currentYear);
    const cat = await findCategoryByName(userId, queryData.category);
    if (!cat) return null;
    const budget = await findBudgetByCategoryAndMonth(userId, cat.category_id, month, year);
    if (!budget) return null;
    await deleteBudgetApi(userId, budget.budget_id);
    return { category_name: cat.category_name, amount_limit: 0, spent: 0, remaining: 0 };
  }

  // 11. budget_summary: list tất cả budget của tháng + spent.
  if (queryData.type === 'budget_summary') {
    const month = Number(queryData.month || currentMonth);
    const year = Number(queryData.year || currentYear);
    const monthBudgets = await listBudgetsByMonth(userId, month, year);
    if (!monthBudgets.length) return null;
    // Trả về row đầu tiên (giữ tương thích với render dùng dataFound = rows[0]).
    const first = monthBudgets[0];
    const cat = (await listCategories(userId)).find(
      (c) => String(c.category_id) === String(first.category_id),
    );
    const { start, end } = monthDateRange(month, year);
    const txs = await listAllTransactions(userId, {
      dateFrom: start,
      dateTo: end,
      transactionType: 'expense',
      categoryId: first.category_id,
      includeDetails: false,
    });
    const spent = txs.reduce((s, t) => s + toNumber(t.amount), 0);
    return {
      category_name: cat?.category_name || '',
      amount_limit: toNumber(first.amount_limit),
      spent,
      remaining: toNumber(first.amount_limit) - spent,
    };
  }

  // 12. category_upsert.
  if (queryData.type === 'category_upsert') {
    if (queryData.old_name) {
      const cat = await findCategoryByName(userId, queryData.old_name);
      if (cat) {
        await updateCategoryApi(userId, cat.category_id, {
          ...cat,
          category_name: queryData.new_name,
        });
      }
    } else {
      await findOrCreateCategoryByName(userId, queryData.category_name, { type: 'expense' });
    }
    return { total: 0, count: 0 };
  }

  // 13. category_delete.
  if (queryData.type === 'category_delete') {
    const cat = await findCategoryByName(userId, queryData.category_name);
    if (cat) await deleteCategoryApi(userId, cat.category_id);
    return { total: 0, count: 0 };
  }

  // 14. category_spending_range.
  if (queryData.type === 'category_spending_range' && queryData.category) {
    const cat = await findCategoryByName(userId, queryData.category);
    if (!cat) return { total: 0, count: 0 };
    const { start: defStart, end: defEnd } = monthDateRange(currentMonth, currentYear);
    const txs = await listAllTransactions(userId, {
      dateFrom: queryData.start_date || defStart,
      dateTo: queryData.end_date || defEnd,
      transactionType: 'expense',
      categoryId: cat.category_id,
      includeDetails: false,
    });
    return {
      total: txs.reduce((s, t) => s + toNumber(t.amount), 0),
      count: txs.length,
    };
  }

  return null;
}

// Anomaly detector: trung bình chi tiêu của 1 category dựa trên list giao dịch.
async function getAnomalyStatusByApi(userId, categoryName, amount) {
  try {
    const cat = await findCategoryByName(userId, categoryName);
    if (!cat) return { isAnomaly: false };
    const txs = await listAllTransactions(userId, {
      categoryId: cat.category_id,
      transactionType: 'expense',
      includeDetails: false,
      pageSize: 200,
    });
    if (!txs.length) return { isAnomaly: false };
    const avg = txs.reduce((s, t) => s + toNumber(t.amount), 0) / txs.length;
    if (avg > 0 && Number(amount) > avg * 3) {
      return { isAnomaly: true, factor: Math.round(Number(amount) / avg) };
    }
    return { isAnomaly: false };
  } catch (err) {
    console.error('❌ Anomaly check lỗi:', err.message);
    return { isAnomaly: false };
  }
}

const WEBHOOK_SECRET = 'my_super_secret_123';
// --- LOG QUÁ TRÌNH XỬ LÝ GIAO DỊCH (BANK) ---
app.post('/webhook/bank-transfer', async (req, res) => {
  console.log('\n--- 🚀 [BẮT ĐẦU NHẬN WEBHOOK TỪ SEPAY] ---');
  console.log('🔥 ĐÃ CHẠM VÀO WEBHOOK! Headers:', req.headers['x-api-key']);
  try {
    const {
      content,
      transferAmount,
      transfer_amount,
      amount_out,
      amount_in,
      transferType,
      gateway,
    } = req.body;

    const apiKey = req.headers['x-api-key'];
    const dynamicUserId = req.headers['x-user-id']; // ID lấy từ n8n gửi sang
    let userId = null;

    // 1. ƯU TIÊN KIỂM TRA API KEY (Dành cho n8n)
    if (apiKey === 'my_super_secret_123') {
      userId = dynamicUserId; // Lấy ID linh động n8n gửi
      console.log('✅ n8n xác thực thành công. User:', userId);
    }
    // 2. NẾU KHÔNG CÓ KEY -> MỚI KIỂM TRA TOKEN (Dành cho Dashboard)
    else {
      userId = requireUserId(req, res);
      if (!userId) return;
    }

    // 🕵️‍♂️ ĐÂY LÀ "CHỐT CHẶN" - PHẢI ĐƯA LÊN TRÊN CÙNG
    if (gateway === 'Chatbot AI') {
      console.log(
        '🔇 [CHATBOT]: Giao dịch này đến từ Chatbot, n8n đã check hạn mức xong. Không lưu trùng vào DB.',
      );
      return res.status(200).json({ status: 'Success', message: 'Ignored duplicate save for AI' });
    }

    // --- NẾU LÀ NGÂN HÀNG THẬT THÌ MỚI CHẠY TIẾP XUỐNG DƯỚI ---

    const currentUserName = await getUserName(userId);
    const finalAmount = parseFloat(
      transferAmount || transfer_amount || amount_out || amount_in || 0,
    );

    // 1. PHÂN BIỆT LOẠI GIAO DỊCH (VÀO hay RA)
    // SePay gửi "in" là tiền vào, "out" là tiền ra
    const isIncome = transferType === 'in';
    const transactionType = isIncome ? 'income' : 'expense';

    if (finalAmount === 0) return res.status(200).send('No amount');

    console.log(`💰 [${transactionType.toUpperCase()}] Số tiền: ${finalAmount}đ`);

    // 1. Tìm hoặc tạo tài khoản mặc định cho user qua account-service API.
    const defaultAccount = await getOrCreateDefaultAccount(userId, 'Tài khoản mặc định');
    const accountId = defaultAccount?.account_id || defaultAccount?.accountId;

    // Lưu ý: Không tự UPDATE balance trên bảng accounts nữa.
    // account_service đã có consumer `transaction.created` để tự cộng/trừ số dư
    // từ event do transaction_service phát ra (xem account_service/src/events/consumers/transaction_created.consumer.js).

    // NHỜ AI PHÂN LOẠI (Gửi thêm ngữ cảnh là Tiền vào hay Tiền ra)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const promptBankAI = `
      Bạn là hệ thống AI phân tích giao dịch ngân hàng thông minh của app Money Guard.
      Dưới đây là thông tin giao dịch nhận được từ ngân hàng:
      - Nội dung chuyển khoản gốc: "${content}"
      - Chiều giao dịch: ${
        isIncome ? 'TIỀN VÀO (Bạn nhận được tiền)' : 'TIỀN RA (Bạn chuyển tiền đi)'
      }

      [NHIỆM VỤ CỦA BẠN]:
      Hãy phân tích và trả về định dạng JSON theo đúng 2 yêu cầu sau:
      
      1. "clean_name": Làm sạch nội dung chuyển khoản cho dễ đọc. Lược bỏ các mã số giao dịch rác của ngân hàng (VD: MBBANK, FT230..., IBFT...). 
        (Ví dụ: "NGUYEN VAN A CHUYEN TIEN 123456" -> "${
          isIncome ? 'Nguyễn Văn A chuyển tiền' : 'Chuyển tiền cho Nguyễn Văn A'
        }")
      2. "category_name": Phân loại danh mục tự động. Dựa vào chiều giao dịch, hãy áp dụng quy tắc:
        ${
          isIncome
            ? '=> Đây là TIỀN VÀO: Hãy phân loại vào một trong các danh mục: "Lương", "Người khác chuyển", "Tiền thưởng", "Thu nhập khác".'
            : '=> Đây là TIỀN RA: Nếu thấy tên người, hãy xếp vào "Chuyển cho người khác". Nếu thấy tên cửa hàng/dịch vụ, hãy xếp vào "Ăn uống", "Mua sắm", "Hóa đơn", v.v...'
        }

      [RÀNG BUỘC BẮT BUỘC]:
      Tuyệt đối CHỈ xuất ra một chuỗi JSON duy nhất, KHÔNG có markdown, KHÔNG có thẻ \`\`\`json, KHÔNG giải thích thêm.
      Định dạng chuẩn: {"category_name": "...", "clean_name": "..."}
    `;

    let aiData;

    try {
      const aiResponse = await model.generateContent(promptBankAI);
      const text = aiResponse.response.text();

      // Dùng Regex tìm đúng khối JSON (Phòng hờ AI bị điên vẫn nhả markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI không trả về JSON hợp lệ');
      }
    } catch (e) {
      console.error('⚠️ Lỗi Parse JSON AI (Dùng dữ liệu gốc):', e.message);
      // Fallback: Nếu AI lỗi thì vẫn lưu DB bình thường với tên gốc
      aiData = {
        category_name: isIncome ? 'Thu nhập' : 'Khác',
        clean_name: content,
      };
    }

    // 2. Tìm hoặc tạo category qua category-service API.
    const category = await findOrCreateCategoryByName(userId, aiData.category_name, {
      type: transactionType,
      color: 'blue',
    });
    const categoryId = category?.category_id || category?.categoryId;

    // 3. Tạo giao dịch qua transaction-service API (event sẽ tự cập nhật balance).
    try {
      await createTransactionApi(userId, {
        account_id: accountId,
        category_id: categoryId,
        amount: finalAmount,
        transaction_type: transactionType === 'income' ? 'Income' : 'Expense',
        description: aiData.clean_name,
        date: new Date().toISOString(),
        note: `Nguồn: ${gateway || 'Bank'}`,
      });
    } catch (txErr) {
      console.error(
        '❌ Lỗi tạo giao dịch ngân hàng qua transaction-service:',
        txErr.response?.data || txErr.message,
      );
      throw txErr;
    }

    // 4. THÔNG BÁO THÔNG MINH (Thay đổi câu chữ dựa trên isIncome)
    let notificationMsg = '';
    if (isIncome) {
      notificationMsg = `💰 **Ting ting!** Money Guard thấy ${currentUserName} vừa **nhận được** **${finalAmount.toLocaleString()}đ** từ "${
        aiData.clean_name
      }". Chúc mừng ${currentUserName} có thêm thu nhập! 🥳`;
    } else {
      notificationMsg = `💸 **Ting ting!** Money Guard thấy ${currentUserName} vừa **chuyển đi** **${finalAmount.toLocaleString()}đ** cho "${
        aiData.clean_name
      }". Đã ghi vào sổ rồi nhé!`;
    }

    // ============================================================
    // 🔥 CHIẾN THUẬT SIÊU CHỦ ĐỘNG (PROACTIVE AI)
    // ============================================================

    // 1. Lấy sức khỏe tài chính thực tế từ Database
    const health = await getProactiveContext(userId);

    // 2. Money Guard tự động "soi" dữ liệu để đưa ra lời khuyên "đanh đá"
    let proactiveMsg = '';
    if (health.status.includes('🔴')) {
      proactiveMsg = `\n\n🚨 **TỔNG BÁO ĐỘNG**: ${currentUserName} ơi, hiện tại ${currentUserName} đang TIÊU VƯỢT THU NHẬP rồi! Cất ngay cái thẻ đi trước khi cái ví "đăng xuất" khỏi trái đất! 😤`;
    } else if (health.daysToEmpty <= 5 && health.balance > 0) {
      proactiveMsg = `\n\n⚠️ **CẢNH BÁO ĐÓI KÉM**: Với đà này ${currentUserName} chỉ còn đủ tiền sống trong **${health.daysToEmpty} ngày** nữa thôi. Chuẩn bị tinh thần ăn mì tôm cả tháng nhé! 🍜`;
    } else if (finalAmount > 1000000 && transactionType === 'expense') {
      proactiveMsg = `\n\n💸 **XÀI SANG QUÁ**: Món này tận **${finalAmount.toLocaleString()}đ**, ${currentUserName} có thực sự cần nó không hay chỉ là nhất thời? Suy nghĩ kỹ đi nhé! 🤔`;
    } else {
      proactiveMsg = `\n\n✅ **TỐT LẮM**: Duy trì phong độ này nhé ${currentUserName}, hiện ${currentUserName} vẫn còn sống sót được thêm **${health.daysToEmpty} ngày** nữa. Tiết kiệm là quốc sách! 💎`;
    }

    // 3. Gộp nội dung thông báo gốc + Lời cảnh báo chủ động của AI
    const finalMsg = notificationMsg + proactiveMsg;

    // 5.MỚI: LƯU VÀO LỊCH SỬ CHAT (Để khi F5 web nó vẫn hiện ra)
    try {
      await pool.query(
        'INSERT INTO ai_service.message_history (user_id, role, message) VALUES ($1, $2, $3)',
        [userId, 'model', finalMsg],
      );
      console.log('💾 Đã lưu thông báo ngân hàng vào lịch sử chat');
    } catch (chatErr) {
      console.error('❌ Lỗi lưu lịch sử chat ngân hàng:', chatErr.message);
    }

    // 6.Bắn socket và push thông báo
    io.emit('bank_notification', { message: finalMsg });
    console.log('📡 [PROACTIVE]: Đã bắn Socket cảnh báo về Web.');

    setTimeout(() => {
      io.emit('money-guard-sync');
      console.log('🔄 [SYNC] Đã báo hiệu cho FE cập nhật lại biểu đồ Thống kê');
    }, 1500);

    await addNotification(finalMsg, userId);

    if (typeof sendPushNotification === 'function') {
      sendPushNotification(notificationMsg);
    }

    console.log(`✅ Thành công: ${notificationMsg}`);
    res.status(200).json({ status: 'Success' });
  } catch (err) {
    console.error('❌ LỖI CHI TIẾT:', err);
    // Trả về lỗi chi tiết thay vì chữ "Error" chung chung để debug
    res.status(500).json({
      status: 'Error',
      message: err.message,
      stack: err.stack,
    });
  }
});

function requireUserId(req, res) {
  const userId = req.headers['x-user-id'];
  console.log('user', userId);
  if (userId == null || userId === '') {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return null;
  }
  return String(userId);
}

// --- API LẤY THỐNG KÊ CHO DASHBOARD ---
app.get('/stats', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Lấy Tổng Thu, Tổng Chi của tháng hiện tại
    const totalsRes = await pool.query(
      `
        SELECT 
          SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END) as total_income,
          SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END) as total_expense
        FROM transaction_service.transactions t
        JOIN account_service.accounts a ON t.account_id = a.account_id
        WHERE a.user_id = $1 
          AND EXTRACT(MONTH FROM t.date) = $2 
          AND EXTRACT(YEAR FROM t.date) = $3
      `,
      [userId, currentMonth, currentYear],
    );

    // 2. Lấy danh sách danh mục (Tách làm 2 loại)
    const categoryRes = await pool.query(
      `
      SELECT 
        COALESCE(c.category_name, 'Chưa phân loại') as category_name, 
        SUM(t.amount) as amount, 
        t.transaction_type
      FROM transaction_service.transactions t
      LEFT JOIN category_service.categories c ON t.category_id = c.category_id -- Dùng LEFT JOIN ở đây
      JOIN account_service.accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND EXTRACT(YEAR FROM t.date) = $3
      GROUP BY c.category_name, t.transaction_type
    `,
      [userId, currentMonth, currentYear],
    );

    // CHUẨN HÓA DỮ LIỆU TRẢ VỀ CHO FRONTEND
    const incomeCategories = categoryRes.rows.filter((r) => r.transaction_type === 'income');
    const expenseCategories = categoryRes.rows.filter((r) => r.transaction_type === 'expense');

    res.json({
      income: parseFloat(totalsRes.rows[0].total_income || 0),
      expense: parseFloat(totalsRes.rows[0].total_expense || 0),
      incomeCategories: incomeCategories, // Mảng dành cho tab Thu nhập
      expenseCategories: expenseCategories, // Mảng dành cho tab Chi tiêu
      month: currentMonth,
      year: currentYear,
    });
  } catch (err) {
    console.error('Lỗi lấy thống kê:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API lấy danh sách ngân sách tháng hiện tại
app.get('/budgets', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    const now = new Date();
    const result = await pool.query(
      `
      SELECT 
        c.category_name, 
        c.icon,
        COALESCE(SUM(t.amount), 0) as spent,
        (SELECT amount_limit FROM budgets_service.budgets b WHERE b.category_id = c.category_id AND b.month = $2 AND b.year = $3) as amount_limit
      FROM category_service.categories c
      LEFT JOIN transaction_service.transactions t ON c.category_id = t.category_id 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND EXTRACT(YEAR FROM t.date) = $3
      WHERE c.user_id = $1
      GROUP BY c.category_id, c.category_name, c.icon
    `,
      [userId, now.getMonth() + 1, now.getFullYear()],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// api giao dịch gần đây
app.get('/recent-transactions', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    const result = await pool.query(
      `
        SELECT 
          t.trans_id, 
          t.amount, 
          t.date as created_at, 
          t.transaction_type as type, 
          t.description,
          COALESCE(c.category_name, 'Khác') as category_name
        FROM transaction_service.transactions t
        JOIN account_service.accounts a ON t.account_id = a.account_id
        LEFT JOIN category_service.categories c ON t.category_id = c.category_id
        WHERE a.user_id = $1
        ORDER BY t.date DESC, t.trans_id DESC
        LIMIT 20
      `,
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy giao dịch gần đây:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// all giao dịch
app.get('/all-transactions', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `
        SELECT 
          t.trans_id, 
          t.amount, 
          t.date as created_at, 
          t.transaction_type as type, 
          t.description,
          COALESCE(c.category_name, 'Khác') as category_name,
          a.account_name
        FROM transaction_service.transactions t
        JOIN account_service.accounts a ON t.account_id = a.account_id
        LEFT JOIN category_service.categories c ON t.category_id = c.category_id
        WHERE a.user_id = $1
        ORDER BY t.date DESC, t.trans_id DESC
      `,
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy toàn bộ giao dịch:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route lấy toàn bộ lịch sử chat để hiện lên màn hình khi load trang
app.get('/chat-history', async (req, res) => {
  try {
    const { message, model: requestedModel } = req.body;

    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    const result = await pool.query(
      'SELECT role, message, created_at FROM ai_service.message_history WHERE user_id = $1 ORDER BY created_at ASC',
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === THÊM ROUTE NÀY VÀO SERVER ===
app.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.PUBLIC_VAPID_KEY;

  if (!publicKey) {
    console.error('❌ PUBLIC_VAPID_KEY chưa có trong .env');
    return res.status(500).json({ error: 'VAPID key not configured' });
  }

  res.json({ publicVapidKey: publicKey });
});

// 2. Endpoint để trình duyệt gửi "địa chỉ nhận tin" lên server
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Kiểm tra xem đã tồn tại chưa (tránh lưu trùng)
  const exists = subscriptions.some((sub) => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('🔔 Đã lưu subscription mới! Tổng:', subscriptions.length, 'thiết bị');
    console.log('Endpoint:', subscription.endpoint.substring(0, 60) + '...');
  } else {
    console.log('🟡 Subscription này đã tồn tại');
  }

  res.status(201).json({ success: true });
});

// Thêm route này vào server
app.get('/debug-subscriptions', (req, res) => {
  res.json({
    total: subscriptions.length,
    subscriptions: subscriptions.map((s) => ({
      endpoint: s.endpoint.substring(0, 80) + '...',
      keys: !!s.keys,
    })),
  });
});

// 3. Hàm bắn thông báo (Sẽ gọi trong Webhook ngân hàng)
const sendPushNotification = (message) => {
  console.log(`📲 Đang gửi Web Push đến ${subscriptions.length} thiết bị...`);

  const payload = JSON.stringify({
    title: '🏦 Money Guard THÔNG BÁO',
    body: message,
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968890.png',
  });

  subscriptions.forEach((sub, index) => {
    webpush
      .sendNotification(sub, payload)
      .then(() => console.log(`   ✅ Đã gửi Banner thành công cho thiết bị #${index + 1}`))
      .catch((err) => {
        console.error(`   ❌ Lỗi gửi Banner thiết bị #${index + 1}:`, err.message);
        // Nếu lỗi 410 (Gone) nghĩa là trình duyệt đã hủy đăng ký, nên xóa sub đó đi
      });
  });
};

// Lưu thông báo vào DB rồi bắn socket
async function addNotification(message, userId) {
  if (!userId) {
    console.warn('⚠️ addNotification: userId is missing, skip.');
    return;
  }
  await pool.query(
    'INSERT INTO ai_service.notifications (user_id, message, is_read) VALUES ($1, $2, $3)',
    [userId, message, false],
  );

  // Sau khi lưu DB thì mới bắn socket
  io.emit('new_notification', { message, time: new Date() });
}

// API Lấy thông báo (Lấy hết, không lọc is_read để không bị mất tin khi load lại)
app.get('/notifications', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    const result = await pool.query(
      'SELECT id, message, is_read, created_at FROM ai_service.notifications WHERE user_id = $1 ORDER BY created_at DESC ',
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API Đánh dấu đã đọc (Lưu ý đường dẫn phải có :id)
app.post('/notifications/read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    await pool.query(
      'UPDATE ai_service.notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi update thông báo:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});
// Route 2: Đánh dấu đọc TẤT CẢ (Không cần ID)
app.post('/notifications/read-all', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }
  await pool.query('UPDATE ai_service.notifications SET is_read = TRUE WHERE user_id = $1', [
    userId,
  ]);
  res.json({ success: true });
});

// API xoá tin thông báo
// Xóa 1 tin cụ thể theo ID
app.delete('/notifications/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    await pool.query('DELETE FROM ai_service.notifications WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xóa tất cả thông báo của người dùng
app.delete('/notifications/delete-all', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) {
      return;
    }
    await pool.query('DELETE FROM ai_service.notifications WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// --- HÀM HỖ TRỢ PHÁT HIỆN CHI TIÊU BẤT THƯỜNG ---
async function getAnomalyStatus(userId, categoryName, amount) {
  try {
    const res = await pool.query(
      `
      SELECT AVG(t.amount) as average 
      FROM transaction_service.transactions t
      JOIN category_service.categories c ON t.category_id = c.category_id
      JOIN account_service.accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 AND c.category_name ILIKE $2
    `,
      [userId, categoryName],
    );

    const avg = parseFloat(res.rows[0].average || 0);
    // Nếu tiêu gấp 3 lần trung bình hạng mục đó thì báo động
    if (avg > 0 && amount > avg * 3) {
      return { isAnomaly: true, factor: Math.round(amount / avg) };
    }
    return { isAnomaly: false };
  } catch (err) {
    return { isAnomaly: false };
  }
}

// --- HÀM TẠO NGỮ CẢNH SIÊU CHỦ ĐỘNG (Dán sau đoạn pool.connect) ---
async function getProactiveContext(userId) {
  const now = new Date();
  const month = now.getMonth() + 1;

  const stats = await pool.query(
    `
    SELECT 
      COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_inc,
      COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_exp
    FROM transaction_service.transactions t JOIN account_service.accounts a ON t.account_id = a.account_id
    WHERE a.user_id = $1 AND EXTRACT(MONTH FROM t.date) = $2 AND EXTRACT(YEAR FROM t.date) = $3
  `,
    [userId, month, now.getFullYear()],
  );

  const { total_inc, total_exp } = stats.rows[0];
  const balance = parseFloat(total_inc) - parseFloat(total_exp);

  const daysInMonth = new Date(now.getFullYear(), month, 0).getDate();
  const daysPassed = now.getDate() || 1; // Tránh chia cho 0
  const dailyAvg = parseFloat(total_exp) / daysPassed;
  const projectedExp = dailyAvg * daysInMonth;

  return {
    balance: balance,
    dailyAvg: Math.round(dailyAvg),
    status: projectedExp > total_inc ? '🔴 NGUY_HIỂM (Chi vượt Thu)' : '🟢 AN_TOÀN',
    daysToEmpty: dailyAvg > 0 && balance > 0 ? Math.floor(balance / dailyAvg) : 0,
    projectedTotal: Math.round(projectedExp),
  };
}

// --- API TẠO LINK LIÊN KẾT (CHỈNH THEO CHUẨN SEPAY) ---
app.get('/create-bank', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }
  try {
    const companyXid = process.env.BANKHUB_COMPANY_XID;

    if (!companyXid) {
      return res.status(500).json({ error: 'Thiếu BANKHUB_COMPANY_XID' });
    }

    const clientId = process.env.BANKHUB_CLIENT_ID;
    const clientSecret = process.env.BANKHUB_CLIENT_SECRET;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'application/json',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    };

    console.log('🔑 Bước 1: Đang lấy access token...');

    // ======================
    // STEP 1: GET TOKEN
    // ======================
    const tokenRes = await got.post('https://bankhub-api-sandbox.sepay.vn/v1/token', {
      headers: {
        ...headers,
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      https: { rejectUnauthorized: false },
    });

    const accessToken = tokenRes.body.access_token;

    console.log('✅ Đã lấy access_token');

    // ======================
    // STEP 2: CHECK COMPANY
    // ======================
    const companyRes = await axios.get('https://bankhub-api-sandbox.sepay.vn/v1/company', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('🏢 Company info:', companyRes.data);

    // ======================
    // STEP 3: CREATE LINK
    // ======================
    console.log('🔗 Bước 3: Đang tạo link token...');

    const linkRes = await got.post('https://bankhub-api-sandbox.sepay.vn/v1/link-token/create', {
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      json: {
        company_xid: companyXid,
        purpose: 'LINK_BANK_ACCOUNT',
        // callback về back end nếu deploy
        // còn đây là link localtunnel test
        completion_redirect_uri: `https://unnibbed-unthrilled-averi.ngrok-free.dev/api/callback/${userId}`,
        // completion_redirect_uri: `https://aercg-171-236-49-110.run.pinggy-free.link /api/callback/${userId}`,
        // external_id: `user_${userId}`,
        external_id: `user_${userId}_${Math.floor(Math.random() * 999999)}`,
      },
      responseType: 'json',
      https: { rejectUnauthorized: false },
    });

    console.log('✅ Tạo link thành công!');
    console.log('🔍 linkRes.body:', JSON.stringify(linkRes.body, null, 2));

    return res.json({
      url: linkRes.body.hosted_link_url,
      expires_at: linkRes.body.expires_at,
    });
  } catch (err) {
    console.error('--- LỖI CHI TIẾT ---');
    console.error('Message:', err.message);
    console.error('Response:', err.response?.body || err.response);

    return res.status(500).json({
      error: 'Lỗi API',
      message: err.message,
      detail: err.response?.body || null,
    });
  }
});

// ✅ THÊM MỚI: Route nhận data từ postMessage của iframe Bankhub
// Frontend gọi sau khi nhận event FINISHED_BANK_ACCOUNT_LINK
app.post('/save-bank-account', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  console.log('user bank', userId);
  const { account_number, account_type, bank_name } = req.body;

  console.log('💾 Nhận data từ postMessage:', { account_number, account_type, bank_name });

  if (!account_number) {
    return res.status(400).json({ error: 'Thiếu account_number' });
  }

  try {
    // Ghép tên tài khoản: "Tên ngân hàng - Số tài khoản" hoặc chỉ số tài khoản nếu không có bank_name
    const accName = bank_name ? `${bank_name} - ${account_number}` : account_number;

    // Kiểm tra trùng tên qua API (account-service không expose unique-conflict, nên check thủ công).
    const existing = await listAccounts(userId);
    const dup = (existing || []).find(
      (a) => String(a.account_name || a.accountName || '').trim() === accName.trim(),
    );
    if (dup) {
      console.log('⚠️ Tài khoản đã tồn tại, bỏ qua:', accName);
      return res.json({ success: true, message: 'Tài khoản đã tồn tại' });
    }

    const created = await createBankAccount(userId, accName);
    console.log(
      '✅ Đã lưu tài khoản:',
      accName,
      '| account_id:',
      created?.account_id || created?.accountId,
    );
    return res.json({ success: true, account_id: created?.account_id || created?.accountId });
  } catch (err) {
    console.error('❌ Lỗi lưu tài khoản qua account-service:', err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});

//
//
//

// callback — dùng làm fallback phòng khi Sepay vẫn redirect
// Nhưng fix lại: không báo 400 ngay, log hết ra để debug rồi redirect về dashboard
app.get('/api/callback/:userId', async (req, res) => {
  const { userId } = req.params;
  const { link_token, external_id } = req.query;

  console.log('🚨 ĐÃ NHẬN CALLBACK');
  console.log('- User ID gốc:', userId);
  console.log('- External ID nhận từ SePay:', external_id);

  if (!userId) {
    console.warn('⚠️ Không có userId trong callback');
    return res.redirect(
      'https://absolutely-elliott-sealed-owners.trycloudflare.com/dashboard?error=missing_user',
    );
  }

  // Không có link_token → data đã lưu qua postMessage rồi, redirect luôn
  if (!link_token) {
    console.log('ℹ️ Không có link_token — data đã lưu qua postMessage, redirect về dashboard');
    return res.redirect(
      'https://absolutely-elliott-sealed-owners.trycloudflare.com/dashboard?status=linked_success',
    );
  }

  // Có link_token → fetch thêm data từ Bankhub rồi lưu DB
  try {
    console.log(`🔗 [CALLBACK] Đang xử lý liên kết cho User: ${userId}`);

    const clientId = process.env.BANKHUB_CLIENT_ID;
    const clientSecret = process.env.BANKHUB_CLIENT_SECRET;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await got.post('https://bankhub-api-sandbox.sepay.vn/v1/token', {
      headers: { Authorization: `Basic ${authString}`, 'Content-Type': 'application/json' },
      responseType: 'json',
      https: { rejectUnauthorized: false },
    });
    const accessToken = tokenRes.body.access_token;

    const accountDetailRes = await axios.get(
      `https://bankhub-api-sandbox.sepay.vn/v1/link-token/${link_token}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log('🔍 DATA TỪ BANKHUB TRẢ VỀ:', JSON.stringify(accountDetailRes.data, null, 2));

    const responseData = accountDetailRes.data.data || accountDetailRes.data;
    const bankAccount = responseData.bank_account;

    if (!bankAccount) {
      throw new Error('Không tìm thấy thông tin bank_account trong trả về của SePay');
    }

    const accName = `${bankAccount.bank_name} - ${bankAccount.account_number}`;

    // Kiểm tra trùng tên trước khi tạo qua account-service.
    const existingAccs = await listAccounts(userId);
    const existed = (existingAccs || []).find(
      (a) => String(a.account_name || a.accountName || '').trim() === accName.trim(),
    );
    if (!existed) {
      await createBankAccount(userId, accName);
    }

    console.log('✅ Đã lưu tài khoản ngân hàng:', accName);
    return res.redirect(
      'https://absolutely-elliott-sealed-owners.trycloudflare.com/dashboard?status=linked_success',
    );
  } catch (err) {
    console.error('❌ Lỗi callback Bankhub:', err.message);
    return res.redirect(
      'https://absolutely-elliott-sealed-owners.trycloudflare.com/dashboard?status=linked_failed',
    );
  }
});
//
//
//
app.post('/chat', upload.single('image'), async (req, res) => {
  try {
    const { message, model: requestedModel, userId: telegramUserId } = req.body;

    // const { message } = req.body;
    const imageFile = req.file; // Lấy file ảnh nếu có
    const apiKey = req.headers['x-api-key'];

    let currentUserId = null;
    // const currentUserId = requireUserId(req, res);

    // --- SỬA LỖI 2: Đưa logic check API Key lên trước để né requireUserId ---
    if (apiKey === 'my_super_secret_123') {
      currentUserId = telegramUserId;
      console.log('🤖 [TELEGRAM]: Xác thực bằng API Key thành công cho User:', currentUserId);
    } else {
      // Chỉ gọi hàm này nếu không phải từ n8n/Telegram
      currentUserId = requireUserId(req, res);

      // Nếu không có token, hàm requireUserId đã gửi res.status(401) rồi
      // Chúng ta phải return ngay để không chạy code bên dưới nữa
      if (!currentUserId) return;

      console.log('💻 [WEB]: Xác thực bằng Token thành công cho User:', currentUserId);
    }

    // Kiểm tra nếu sau cả 2 bước vẫn không có ID (phòng hờ n8n gửi thiếu userId trong body)
    if (!currentUserId) {
      return res.status(400).json({ error: 'Missing User ID' });
    }

    const currentUserName = await getUserName(currentUserId);
    // CHẶN NGAY TỪ ĐẦU NẾU LỖI
    if (message.length > 30000) {
      return res.status(400).json({ error: 'Message quá dài (tối đa ~30k ký tự)' });
    }

    // Kiểm tra nếu cả chữ và ảnh đều trống thì báo lỗi
    if (!message && !imageFile) {
      return res.status(400).json({ error: 'Hãy nhập tin nhắn hoặc gửi ảnh nhé!' });
    }

    // Sanitize XSS
    if (message) {
      req.body.message = validator.escape(message);
    }

    // Check file size
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      // 5MB
      return res.status(400).json({
        error: 'Ảnh quá lớn! Tối đa 5MB.',
      });
    }

    // 🕵️‍♂️ CHỐT CHẶN DOUBLE SUBMIT: Kiểm tra nguyên cái tin nhắn
    const messageKey = `${currentUserId}-${message}`;
    const nowBlock = Date.now();

    if (lastUserMessage.content === messageKey && nowBlock - lastUserMessage.time < 3000) {
      console.log('🚫 Chặn Double Submit tin nhắn');
      return res.json({
        reply: 'Từ từ thôi, Money Guard đang xử lý tin nhắn trước đó rồi!',
      });
    }
    lastUserMessage = { time: nowBlock, content: messageKey };

    // Lưu lại tin nhắn vừa gửi để so sánh với tin tiếp theo
    lastSavedTransaction = { time: nowBlock, content: messageKey };

    // ==========================================
    // VỊ TRÍ 1: DÁN ĐOẠN LƯU TIN NHẮN USER TẠI ĐÂY
    // ==========================================
    try {
      await pool.query(
        'INSERT INTO ai_service.message_history (user_id, role, message) VALUES ($1, $2, $3)',
        [currentUserId, 'user', message || '[Gửi ảnh]'],
      );
      console.log('💾 Đã lưu tin nhắn user vào DB');
    } catch (err) {
      console.error('❌ Lỗi lưu tin nhắn user:', err.message);
    }

    // --- 2. LẤY DỮ LIỆU THẬT TỪ DATABASE ---
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDayName = daysOfWeek[now.getDay()];
    const currentDate = now.toLocaleDateString('en-CA');

    // QUERY 1: Lấy chi tiết hạng mục
    const categoryStatsRes = await pool.query(
      `
        SELECT 
            c.category_name, 
            COALESCE(SUM(t.amount), 0) as spent,
            (SELECT amount_limit FROM budgets_service.budgets b WHERE b.category_id = c.category_id AND b.month = $2 AND b.year = $3 AND b.user_id = $1) as limit_amount
        FROM category_service.categories c
        LEFT JOIN transaction_service.transactions t ON c.category_id = t.category_id 
            AND EXTRACT(MONTH FROM t.date) = $2 
            AND EXTRACT(YEAR FROM t.date) = $3
            AND t.transaction_type = 'expense'
        WHERE c.user_id = $1
        GROUP BY c.category_id, c.category_name
    `,
      [currentUserId, currentMonth, currentYear],
    );

    // QUERY 2: Lấy TỔNG CHI TIÊU và TỔNG SỐ GIAO DỊCH của cả tháng (Để tính stats tổng)
    const overallStatsRes = await pool.query(
      `
      SELECT 
          COUNT(CASE WHEN t.transaction_type = 'expense' THEN 1 END) as expense_count,
          COUNT(CASE WHEN t.transaction_type = 'income' THEN 1 END) as income_count,
          COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
          COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as total_income
      FROM transaction_service.transactions t
      JOIN account_service.accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND EXTRACT(YEAR FROM t.date) = $3
      `,
      [currentUserId, currentMonth, currentYear],
    );

    // Lấy tổng ngân sách mà đã cài đặt cho tháng này
    const budgetRes = await pool.query(
      `
        SELECT COALESCE(SUM(amount_limit), 0) as total_limit
        FROM budgets_service.budgets
        WHERE user_id = $1 AND month = $2 AND year = $3
      `,
      [currentUserId, currentMonth, currentYear],
    );

    //
    const row = overallStatsRes.rows[0];
    const totalExpense = parseFloat(row.total_expense);
    const totalIncome = parseFloat(row.total_income);
    const expenseCount = parseInt(row.expense_count) || 0; // Chỉ đếm số lần tiêu tiền
    const incomeCount = parseInt(row.income_count) || 0; // Chỉ đếm số lần nhận tiền
    const balance = totalIncome - totalExpense;
    const totalAmount = totalIncome + totalExpense; // Gán để tính trung bình chi tiêu hàng ngày

    // --- TÍNH TOÁN THỜI GIAN CHO DỰ BÁO ---
    // Tính trung bình mỗi ngày dựa trên số ngày đã qua trong tháng
    const dayOfMonth = now.getDate();
    const dailyAvg = totalExpense > 0 ? Math.round(totalExpense / dayOfMonth) : 0;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysLeft = daysInMonth - daysPassed;
    const projectedTotal = totalExpense + dailyAvg * daysLeft;

    const totalLimit = parseFloat(budgetRes.rows[0].total_limit);
    const remainingBudget = totalLimit - totalExpense;
    const dailyAllowance = daysLeft > 0 ? Math.round(remainingBudget / daysLeft) : 0;

    // Tạo báo cáo danh mục
    const categoryReport =
      categoryStatsRes.rows.length > 0
        ? categoryStatsRes.rows
            .map((r) => {
              const spent = Number(r.spent);
              const limit = r.limit_amount ? Number(r.limit_amount) : 0;
              const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
              let statusText = '';

              if (limit > 0 && spent > limit) {
                statusText = `🚨 [VƯỢT HẠN MỨC ${spent - limit}đ]`;
              } else if (limit > 0 && percent >= 80) {
                statusText = `⚠️ [SẮP CHẠM NGƯỠNG - Đã tiêu ${percent}%]`;
              }

              return `- ${r.category_name}: ${spent.toLocaleString('vi-VN')}đ / Hạn mức: ${
                limit > 0 ? limit.toLocaleString('vi-VN') + 'đ' : 'Chưa đặt'
              } ${statusText}`;
            })
            .join('\n')
        : 'Chưa có chi tiêu nào.';

    // Lấy 10 giao dịch gần nhất để AI biết lịch sử (Dùng cho Anomaly Detection & CRUD)
    const recentTransactionsRes = await pool.query(
      `
          SELECT t.trans_id, t.description, t.amount, t.date, c.category_name
          FROM transaction_service.transactions t
          JOIN category_service.categories c ON t.category_id = c.category_id
          JOIN account_service.accounts a ON t.account_id = a.account_id
          WHERE a.user_id = $1
          ORDER BY t.created_at DESC LIMIT 10
      `,
      [currentUserId],
    );

    const recentData = recentTransactionsRes.rows
      .map(
        (t) =>
          `ID:${t.trans_id} | ${t.date.toISOString().split('T')[0]} | ${
            t.description
          } | ${parseFloat(t.amount).toLocaleString()}đ`,
      )
      .join('\n');

    const stats = {
      total: totalAmount.toLocaleString('vi-VN') + 'đ',
      expense: totalExpense.toLocaleString('vi-VN') + 'đ',
      income: totalIncome.toLocaleString('vi-VN') + 'đ',
      balance: balance.toLocaleString('vi-VN') + 'đ',
      expense_count: expenseCount,
      income_count: incomeCount,
      count: expenseCount + incomeCount,
      avg: dailyAvg.toLocaleString('vi-VN') + 'đ',
      month: `${currentMonth}/${currentYear}`,
      age: 21,
      today: currentDate,
    };

    // --- LOGIC CHẶN AI ẢO GIÁC ---
    let adviceContext = '';
    if (totalExpense > totalIncome && totalIncome > 0) {
      adviceContext = `[CẢNH BÁO NGUY HIỂM]: ${currentUserName} đang tiêu vượt mức thu nhập (${stats.expense} > ${stats.income}). Hãy mắng thật gắt!`;
    } else if (totalIncome === 0 && totalExpense > 0) {
      adviceContext = `[GHI CHÚ]: ${currentUserName} chưa nhập thu nhập tháng này, chỉ toàn thấy chi ra thôi.`;
    }

    console.log(`📊 Đã nạp dữ liệu thật tháng ${stats.month} cho Money Guard: ${stats.total}`);
    console.log(
      `📊 Stats nạp cho Money Guard: [${stats.count} GD] | Chi: ${stats.expense} | Thu: ${stats.income}`,
    );
    // 3. Logic: Chỉ hiện số liệu nếu user hỏi về chi tiêu/tiền bạc
    const isAskingAboutMoney = /tiền|chi tiêu|báo cáo|bao nhiêu|tổng|tháng/i.test(message);

    let contextData = '';
    if (isAskingAboutMoney) {
      contextData = `[DỮ LIỆU TÀI CHÍNH THẬT]: Tháng ${stats.month}, Tổng chi ${stats.total}, ${stats.count} giao dịch.`;
    }

    // 🔥 GỌI NÃO BỘ CHỦ ĐỘNG TẠI ĐÂY
    const health = await getProactiveContext(currentUserId);

    // 2. Tạo Prompt tổng hợp ngữ cảnh
    const inputPrompt = `
    [THÔNG TIN HỆ THỐNG - TỐI MẬT]:
    [TÊN NGƯỜI DÙNG]: ${currentUserName}
    [DỮ LIỆU THẬT THÁNG ${stats.month}]:
    - Tổng cả thu và chi: ${stats.total}
    - Tổng Chi tháng này: ${stats.expense} (${stats.expense_count} lần chi)
    - Tổng Thu tháng này: ${stats.income} (${stats.income_count} lần nhận)
    - Số dư hiện tại: ${health.balance}
    - Giao dịch: ${stats.count}
    - Tình trạng: ${health.status}.
    - Tốc độ đốt tiền: ${health.dailyAvg}đ/ngày.
    - Dự báo: ${currentUserName} sẽ cạn sạch tiền sau ${health.daysToEmpty} ngày nữa.
    
    - Tổng ngân sách ${currentUserName} tự đặt (Budget): ${totalLimit.toLocaleString()}đ.
    - Người dùng đã tiêu hết: ${totalExpense.toLocaleString()}đ.
    - Quỹ còn lại ĐƯỢC PHÉP TIÊU: ${remainingBudget.toLocaleString()}đ.
    - Số ngày còn lại của tháng: ${daysLeft} ngày.
    - Hạn mức chi tiêu mỗi ngày KHÔNG ĐƯỢC VƯỢT QUÁ: ${dailyAllowance.toLocaleString()}đ.

    ${adviceContext}

    [NGỮ CẢNH HỆ THỐNG]:
    Dưới đây là dữ liệu tài chính của ${currentUserName}:
    - THỜI GIAN THỰC: Hôm nay là ${currentDayName}, ngày ${currentDate}.
    - Tháng: ${stats.month} | Tổng chi: ${stats.total} | Giao dịch: ${stats.count} | TB/ngày: ${
      stats.avg
    }
    - TIẾN ĐỘ THÁNG: Đã qua ${daysPassed} ngày, còn lại ${daysLeft} ngày.
    - DỰ BÁO CUỐI THÁNG (AI Prediction): ${projectedTotal.toLocaleString('vi-VN')}đ.
    - SO SÁNH DỰ BÁO: ${
      projectedTotal > totalIncome ? '🚨 Nguy cơ chi vượt thu!' : '✅ Vẫn trong tầm kiểm soát'
    }.
    - Báo cáo hạng mục & Ngân sách:
    ${categoryReport}
    - 5 Giao dịch gần nhất của ${currentUserName}:
    ${recentData}

    [YÊU CẦU XỬ LÝ NGÀY THÁNG]:
    1. Nếu ${currentUserName} nói "hôm nay" hoặc không nói ngày: Dùng ngày ${currentDate}.
    2. Nếu ${currentUserName} nói "hôm qua": Bạn tự tính toán lấy ngày ${currentDate} trừ đi 1 ngày.
    3. Nếu ${currentUserName} nói "hôm kia": Trừ đi 2 ngày.
    4. Nếu ${currentUserName} nói "thứ mấy" (vd: thứ 2 vừa rồi): Dựa vào hôm nay là ${currentDayName} để suy luận ra ngày chính xác.
    5. LUÔN luôn xuất ngày tháng cuối cùng ở định dạng YYYY-MM-DD bên trong thẻ <transaction>.
    
    [YÊU CẦU XỬ LÝ]:
    - Nếu câu hỏi của ${currentUserName} liên quan đến: "chi tiêu", "tiền bạc", "báo cáo", "tháng này", "bao nhiêu tiền", hoặc "tổng kết" -> Hãy lôi dữ liệu trên ra báo cáo chuyên nghiệp theo Rules (4 đoạn, có icon).
    - Nếu ${currentUserName} chỉ: "Chào hỏi", "Hỏi danh tính (bạn là ai)", "Nói chuyện phiếm" -> Tuyệt đối KHÔNG hiện số liệu chi tiêu. Hãy trả lời thân thiện, khích lệ và nhắc ${currentUserName} tập trung vào mục tiêu tài chính một cách khéo léo.
    - ƯU TIÊN: Nếu ${currentUserName} đang cung cấp số tiền cho một món đồ đã nhắc ở câu trước (ví dụ: ${currentUserName} gõ "100k"), hãy thực hiện trích xuất <transaction> ngay thay vì hiện báo cáo tổng.

    [NHIỆM VỤ MỞ RỘNG]:
    1. PHÁT HIỆN BẤT THƯỜNG: Nếu ${currentUserName} nhập món đồ cao hơn 3 lần mức trung bình các món trước, hãy cảnh báo và xác nhận lại để lưu database và nếu chỉnh database thì nhớ chỉnh luôn note của cái vừa chỉnh 🚨.
    2. DỰ BÁO: Nếu ${currentUserName} hỏi về tương lai, hãy lấy tổng chi chia cho ngày hiện tại để dự báo chi tiêu cuối tháng.
    3. NLP CRUD (SỬA/XÓA): 
       - Nếu ${currentUserName} muốn xóa (vd: "Xóa món phở nãy đi"), hãy tìm ID trong danh sách "Giao dịch gần nhất" và trả về thẻ <delete_transaction>{"id": ID_CẦN_XÓA}</delete_transaction>.
       - Tương tự cho Sửa: <update_transaction>{"id": ID, "amount": SỐ_TIỀN_MỚI}</update_transaction>.
    4. SMART BUDGET: Nếu chi tiêu hạng mục nào vượt quá Hạn mức, hãy "mắng" thật gắt và yêu cầu cắt giảm.
    5. Khi in ra số dư nếu âm thì phải có dấu - đằng trước balance

    [DỮ LIỆU DỰ BÁO]:
    - Tiêu xài tuần này tăng {{ n% }} so với tuần trước.
    - Các món thuộc nhóm 'Wants' chiếm {{ m% }} tổng chi.
    - Nếu không cắt giảm, ${currentUserName} sẽ nợ {{ X }} đồng vào cuối tháng.
    - Hãy dùng mô hình dự báo để chỉ ra ngày chính xác ${currentUserName} sẽ hết tiền.

    [CHỈ THỊ CỰC GẮT CHO AI]:
    1. Nếu "Quỹ còn lại" bị âm: Hãy mắng ${currentUserName} là 'Chiến thần phá gia chi tử' và yêu cầu dừng mọi khoản chi.
    2. Khi Người dùng hỏi 'Mua gì tự thưởng', hãy nhìn vào 'Hạn mức chi tiêu mỗi ngày' (${dailyAllowance}đ). 
    3. Tuyệt đối KHÔNG ĐƯỢC lấy số dư tài khoản (${
      stats.balance
    }) để khuyên ${currentUserName} tiêu xài. Phải giữ kỷ luật theo Ngân sách (Budget).
    
    [CÔNG VIỆC CỤ THỂ]:
    1. PHÁT HIỆN BẤT THƯỜNG: So sánh món đồ ${currentUserName} vừa nhập với "5 giao dịch gần nhất". Nếu giá cao gấp 3 lần trung bình, hãy dừng lại, mắng ${currentUserName} một trận và yêu cầu ${currentUserName} xác nhận: "Có thực sự muốn đốt tiền không?" mới được nhả thẻ <transaction>.
    - Nếu giá món đồ cao bất thường (gấp 3 lần trung bình): Bạn PHẢI mắng ${currentUserName} và hỏi xác nhận. 
    - TUYỆT ĐỐI KHÔNG được in thẻ <transaction> trong câu hỏi xác nhận này.
    - CHỈ KHI NÀO ${currentUserName} trả lời "Đúng rồi", "Lưu đi", "Xác nhận" thì bạn mới được in thẻ <transaction> ở câu trả lời sau đó.
    - NHƯNG: Nếu ${currentUserName} đã trả lời "Đúng rồi", "Lưu đi", "Xác nhận", "Ghi đi" hoặc các từ tương tự: 
    => BẠN PHẢI DỪNG VIỆC HỎI LẠI. 
    => BẠN PHẢI IN THẺ <transaction> NGAY LẬP TỨC ở cuối câu trả lời. 
    => Không được chần chừ, không được hỏi thêm lần 2, lần 3.

    2. KIỂM TRA TƯƠNG LAI: Nếu ${currentUserName} nhập ngày là tương lai (ví dụ hôm nay 31 mà nhập cho ngày 01 tháng sau), hãy hỏi: "${currentUserName} đang tính trước tương lai à? Chắc chắn thì Money Guard mới ghi sổ nhé".

    3. TRUY VẤN DỮ LIỆU (NLP QUERY): 
       - Nếu ${currentUserName} hỏi ví dụ "Tháng này uống Cafe bao nhiêu lần và bao nhiêu tiền?", hãy lục lại [Báo cáo hạng mục] và [5 giao dịch gần nhất] để trả lời chính xác. Nếu thông tin không đủ, hãy dựa vào dữ liệu đã có để ước tính.

    4. DỰ BÁO TÀI CHÍNH: Dựa vào tốc độ chi tiêu ${
      stats.avg
    }/ngày, hãy dự báo nếu cứ tiếp tục thế này thì cuối tháng ${currentUserName} sẽ thâm hụt bao nhiêu lúa.

    5. NLP CRUD (ĐIỀU KHIỂN CSDL QUA GIỌNG NÓI):
       - XÓA: Nếu ${currentUserName} nói "Xóa món...", hãy tìm ID trong danh sách gần nhất và trả về thẻ: <delete_transaction>{"id": ID}</delete_transaction>
       - SỬA: Nếu ${currentUserName} nói "Sửa món ID... thành...", trả về thẻ: <update_transaction>{"id": ID, "amount": SỐ_TIỀN_MỚI}</update_transaction>. Khi sửa, hãy tự động cập nhật note thành: "Đã điều chỉnh theo yêu cầu của ${currentUserName}".

       THIẾT LẬP NGÂN SÁCH (QUAN TRỌNG): Khi người dùng nói "Đặt ngân sách...", "Hạn mức cho mục X là...", "Tháng này chỉ tiêu Y cho Z"... 
         => BẠN BẮT BUỘC PHẢI nhả thẻ: <manage_budget>{"category_name": "tên_mục", "amount_limit": số_tiền, "month": ${currentMonth}, "year": ${currentYear}}</manage_budget>
         => Lưu ý: Phải xuất thẻ này ở CUỐI câu trả lời, không được thiếu!
         => CẢNH BÁO: Thẻ <manage_budget> CHỈ DÙNG để TẠO/ĐẶT/CẬP NHẬT (set) ngân sách có kèm số tiền. TUYỆT ĐỐI KHÔNG dùng thẻ này khi người dùng muốn XÓA / BỎ / HỦY / REMOVE ngân sách.
       XÓA NGÂN SÁCH: Khi người dùng nói "Xóa ngân sách...", "Bỏ hạn mức...", "Hủy ngân sách tháng này của mục X"... (KHÔNG có số tiền, hoặc rõ ràng yêu cầu xóa)
         => BẠN BẮT BUỘC PHẢI nhả thẻ: <query_db>{"type": "budget_delete", "category": "tên_hạng_mục", "month": ${currentMonth}, "year": ${currentYear}}</query_db>
         => TUYỆT ĐỐI KHÔNG được dùng <manage_budget> cho thao tác xóa.
       - Nếu người dùng muốn tạo danh mục (VD: "Tạo danh mục X"): 
         => Trả về thẻ: <manage_category>{"action": "create", "category_name": "X"}</manage_category>
       - Nếu người dùng muốn sửa tên danh mục (VD: "Đổi tên danh mục X thành Y"):
         => Trả về thẻ: <manage_category>{"action": "update", "old_name": "X", "new_name": "Y"}</manage_category>
       - Nếu người dùng muốn xóa danh mục (VD: "Xóa danh mục Z"):
         => Trả về thẻ: <manage_category>{"action": "delete", "category_name": "Z"}</manage_category>
       - QUY TẮC THỜI GIAN: Nếu người dùng không nói thời gian (ngày/tháng), mặc định lấy tháng và năm hiện tại: ${currentMonth}/${currentYear}. Nếu người dùng nói khoảng thời gian (VD: "từ 1-5 đến 30-5"), PHẢI kèm thêm trong thẻ: "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD".
       
    6. SMART BUDGET: Nếu hạng mục nào ở [Báo cáo hạng mục] ghi "Vượt hạn mức", hãy kích hoạt chế độ "Chửi gắt" ngay lập tức khi ${currentUserName} nhắc đến hạng mục đó.

    7. DỰ BÁO TÀI CHÍNH (PREDICTIVE AI): 
       - Khi ${currentUserName} hỏi "Dự báo", "Tháng này ổn không?", hãy dùng con số dự báo ${projectedTotal.toLocaleString()}đ để phân tích. 
       - Nếu số này lớn hơn Thu nhập (${
         stats.income
       }), hãy "dọa" ${currentUserName} về việc cuối tháng sẽ hết sạch tiền.

    8. SMART BUDGET (QUẢN LÝ NGÂN SÁCH): 
       - Nhìn vào [Báo cáo hạng mục], nếu thấy hạng mục nào có ghi "🚨 [VƯỢT HẠN MỨC]":
       - Mỗi khi ${currentUserName} nhắc đến hoặc nhập thêm món vào hạng mục đó, bạn PHẢI mắng ${currentUserName} thật gắt trước khi làm bất cứ việc gì khác. 
       - Dùng giọng điệu "sát thủ tài chính" để ngăn chặn ${currentUserName} tiêu thêm.
   
    9. ĐỐI VỚI THÁNG NÀY: Dữ liệu ĐÃ CÓ SẴN ở [DỮ LIỆU THẬT THÁNG ${
      stats.month
    }]. Khi ${currentUserName} hỏi "Tháng này tiêu bao nhiêu?", "Còn dư bao nhiêu?" -> HÃY ĐỌC DỮ LIỆU ĐÓ VÀ TRẢ LỜI LUÔN. TUYỆT ĐỐI KHÔNG dùng thẻ <query_db>.
    10. CHỈ DÙNG thẻ <query_db> KHI hỏi quá khứ hoặc chi tiết:
       - "Tháng trước tiêu bao nhiêu?" -> <query_db>{"type": "total_spending", "month": ${
         currentMonth - 1
       }, "year": ${currentYear}}</query_db>
       - "Tháng này ăn uống mấy lần?" -> <query_db>{"type": "category_spending", "category": "ăn uống", "month": ${currentMonth}, "year": ${currentYear}}</query_db>
       - "Hạn mức tiền ăn/xăng/... còn bao nhiêu?", "Tao tiêu lố ngân sách chưa?" -> <query_db>{"type": "budget_check", "category": "tên_hạng_mục", "month": ${currentMonth}, "year": ${currentYear}}</query_db>
       - "Ngân sách tháng này của tao thế nào?" -> <query_db>{"type": "budget_check", "month": ${currentMonth}, "year": ${currentYear}}</query_db>
       - "Xóa ngân sách ăn uống", "Bỏ hạn mức tiền xăng tháng này đi", "Hủy budget mục Cafe" -> <query_db>{"type": "budget_delete", "category": "tên_hạng_mục", "month": ${currentMonth}, "year": ${currentYear}}</query_db>
       - "Đặt ngân sách ăn uống 5 triệu tháng này" (chỉ khi KHÔNG tiện dùng <manage_budget>) -> <query_db>{"type": "budget_upsert", "category": "ăn uống", "amount": 5000000, "month": ${currentMonth}, "year": ${currentYear}}</query_db>
    
    Nếu ${currentUserName} vừa nhập một món đồ mà trong 7 ngày qua ${currentUserName} đã mua món đó hơn 3 lần (ví dụ Trà sữa), bạn PHẢI khịa ${currentUserName} về việc nghiện món này và tính tổng tiền ${currentUserName} đã 'cúng' cho món đó trong tuần.
    Dựa vào số dư ${
      health.balance
    }đ, Money Guard dự báo ${currentUserName} chỉ còn trụ được đến ngày X tháng này. Nếu muốn sống sót đến ngày 30, từ mai ${currentUserName} chỉ được tiêu tối đa Y đồng/ngày thôi!
    
    [CÂU HỎI CỦA ${currentUserName.toUpperCase()}]: "${message}"

    [QUY TẮC PHẢN HỒI]:
     Trình bày theo phong cách hiện đại, sử dụng icon 🚨, 💸, 🛡️, 📈. Tuyệt đối không để lộ mã JSON rác ra ngoài các thẻ quy định.
     Dù bạn đang nhập vai "mỏ hỗn" hay đang mắng người dùng, nếu người dùng đưa ra một con số để Ghi sổ hoặc Đặt ngân sách, bạn TUYỆT ĐỐI KHÔNG ĐƯỢC QUÊN xuất thẻ <transaction> hoặc <manage_budget>. Thiếu thẻ lệnh là bạn sẽ bị "đăng xuất" khỏi hệ thống!
     Nếu người dùng yêu cầu XÓA/BỎ/HỦY ngân sách, bạn BẮT BUỘC phải xuất thẻ <query_db>{"type":"budget_delete",...}</query_db> ở CUỐI câu trả lời — KHÔNG được thay bằng <manage_budget>, vì <manage_budget> sẽ làm thao tác upsert sai ý người dùng.
  `;

    if (message.length > 30000) {
      return res.status(400).json({ error: 'Message quá dài (tối đa ~30k ký tự)' });
    }

    // 3. Khởi tạo Model
    let modelToUse;
    if (requestedModel && requestedModel !== 'auto') {
      modelToUse = requestedModel; // Dùng con khách chọn
    } else {
      modelToUse = getBestModel(); // Tự động chọn con khỏe nhất
    }

    console.log(`🧠 Client yêu cầu não: ${requestedModel} | Thực tế sử dụng: ${modelToUse}`);

    // Chỗ gọi genAI.getGenerativeModel...
    const model = genAI.getGenerativeModel({
      model: modelToUse,
      systemInstruction: getMoneyGuardRules(currentUserName),
    });

    // --- BẮT ĐẦU ĐOẠN FIX LỊCH SỬ ---
    const chat = model.startChat({
      history: chatHistory.slice(-10),
    });

    // 4. Chuẩn bị dữ liệu gửi cho Google AI
    let promptParts = [inputPrompt];

    if (imageFile) {
      promptParts.push({
        text: `
          ĐÂY LÀ ẢNH CHỤP HÓA ĐƠN (BILL). 
          NHIỆM VỤ: 
          1. Đọc tên cửa hàng, ngày tháng và DANH SÁCH CHI TIẾT TỪNG MÓN.
          2. Với mỗi món trong bill, xuất một thẻ <transaction> riêng.
          Ví dụ: Bill 100k gồm Phở 60k, Cafe 40k -> Xuất 2 thẻ <transaction>.
          3. Nếu ảnh mờ, hãy báo ${currentUserName} chụp lại.
        `,
      });
      promptParts.push({
        inlineData: {
          data: imageFile.buffer.toString('base64'),
          mimeType: imageFile.mimetype,
        },
      });
    }

    // 5. Cơ chế Retry nếu lỗi 503
    const maxRetries = 3;
    let attempt = 0;
    let finalReply = '';

    while (attempt < maxRetries) {
      try {
        // --- 1. GỌI AI LẦN 1: PHÂN TÍCH Ý ĐỊNH ---
        const result = await chat.sendMessage(promptParts);
        const response = result.response;
        const reply = response.text();

        // --- 2. LOG CHI PHÍ AI (CHỈ LÀM 1 LẦN) ---
        const usage = response.usageMetadata;
        if (usage) {
          const pTokens = usage.promptTokenCount;
          const cTokens = usage.candidatesTokenCount;
          const totalT = usage.totalTokenCount;
          const cost = pTokens * 0.000000075 + cTokens * 0.0000003; // Giá 1.5 Flash

          await pool
            .query(
              'INSERT INTO ai_usage_logs (user_id, prompt_tokens, completion_tokens, total_tokens, cost_usd, model_name) VALUES ($1, $2, $3, $4, $5, $6)',
              [currentUserId, pTokens, cTokens, totalT, cost, 'gemini-1.5-flash'],
            )
            .catch((e) => console.error('Lỗi log cost:', e.message));

          console.log(`📊 AI Usage: $${cost.toFixed(8)} | Tokens: ${totalT}`);
        }

        // --- MỚI: XỬ LÝ TRUY VẤN DỮ LIỆU (NLP QUERY) ---
        const queryMatch = reply.match(/<query_db>(.*?)<\/query_db>/s);
        if (queryMatch) {
          try {
            const queryData = JSON.parse(queryMatch[1].trim());
            console.log('🔍 AI yêu cầu truy vấn:', queryData);

            let sql = '';
            let params = [currentUserId];

            // 1. Xử lý "Tuần trước" (Last Week)
            if (queryData.time_range === 'last_week') {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
                FROM transaction_service.transactions t JOIN account_service.accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 
                AND t.date >= date_trunc('week', CURRENT_DATE - INTERVAL '1 week')
                AND t.date < date_trunc('week', CURRENT_DATE)
                AND t.transaction_type = 'expense'`;
            }
            // 2. Xử lý khoảng ngày cụ thể (Ví dụ: 20-24 tháng 3)
            else if (queryData.start_date && queryData.end_date) {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
                FROM transaction_service.transactions t JOIN account_service.accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 
                AND t.date >= $2 AND t.date <= $3
                AND t.transaction_type = 'expense'`;
              params.push(queryData.start_date, queryData.end_date);
            }

            // 3. Tổng chi tiêu tháng
            else if (queryData.type === 'total_spending') {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total , COUNT(*) as count
                FROM transaction_service.transactions t JOIN account_service.accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 AND EXTRACT(MONTH FROM t.date) = $2 
                AND t.transaction_type = 'expense'`;
              params.push(queryData.month || currentMonth);
            }
            // 4. Tổng thu nhập tháng
            else if (queryData.type === 'total_spending') {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total , COUNT(*) as count
                FROM transaction_service.transactions t JOIN account_service.accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 AND EXTRACT(MONTH FROM t.date) = $2 
                AND t.transaction_type = 'income'`;
              params.push(queryData.month || currentMonth);
            }

            // 5. (MỚI) Truy vấn theo Hạng mục (VD: Tháng này uống Cafe bao nhiêu?)
            else if (queryData.type === 'category_spending' && queryData.category) {
              sql = `
                SELECT COALESCE(SUM(t.amount), 0) as total, COUNT(*) as count
                FROM transaction_service.transactions t 
                JOIN account_service.accounts a ON t.account_id = a.account_id
                JOIN account_service.categories c ON t.category_id = c.category_id
                WHERE a.user_id = $1 
                AND (c.category_name ILIKE $2 OR $2 ILIKE '%' || c.category_name || '%')
                AND EXTRACT(MONTH FROM t.date) = $3 
                AND EXTRACT(YEAR FROM t.date) = $4
                AND t.transaction_type = 'expense'`;

              const targetMonth = queryData.month || currentMonth;
              const targetYear = queryData.year || currentYear;
              params.push(`%${queryData.category}%`, targetMonth, targetYear);
            }

            // 6. (MỚI) Truy vấn ngày trong tuần tiêu nhiều nhất (Thứ mấy tiêu nhiều nhất?)
            else if (queryData.type === 'top_spending_day') {
              sql = `
                  SELECT 
                    CASE EXTRACT(DOW FROM t.date)
                      WHEN 0 THEN 'Chủ Nhật' WHEN 1 THEN 'Thứ 2' WHEN 2 THEN 'Thứ 3'
                      WHEN 3 THEN 'Thứ 4' WHEN 4 THEN 'Thứ 5' WHEN 5 THEN 'Thứ 6'
                      WHEN 6 THEN 'Thứ 7'
                    END as "day_name",
                    SUM(t.amount) as "total_day",
                    COUNT(*) as "count"
                  FROM transaction_service.transactions t 
                  JOIN account_service.accounts a ON t.account_id = a.account_id
                  WHERE a.user_id = $1 
                  AND EXTRACT(MONTH FROM t.date) = $2
                  AND t.transaction_type = 'expense'
                  GROUP BY "day_name"
                  ORDER BY "total_day" DESC
                  LIMIT 1`; // Chỉ lấy ngày đứng đầu

              params.push(currentMonth);
            }

            // 7. (MỚI) So sánh chi tiêu tuần này với tuần trước
            else if (queryData.type === 'compare_weeks') {
              sql = `
                  SELECT 
                    SUM(CASE WHEN t.date >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN t.amount ELSE 0 END)::bigint as this_week,
                    SUM(CASE WHEN t.date >= date_trunc('week', (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '1 week') 
                            AND t.date < date_trunc('week', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN t.amount ELSE 0 END)::bigint as last_week
                  FROM transaction_service.transactions t
                  JOIN account_service.accounts a ON t.account_id = a.account_id
                  WHERE a.user_id = $1 AND t.transaction_type = 'expense'
                `;
            }

            // 8. (MỚI) Truy vấn Ngân sách (Hạn mức so với chi tiêu thực tế)
            else if (queryData.type === 'budget_check') {
              sql = `
              SELECT 
                  c.category_name, 
                  b.amount_limit, 
                  COALESCE(SUM(t.amount), 0) as spent,
                  (b.amount_limit - COALESCE(SUM(t.amount), 0)) as remaining,
                  b.month,
                  b.year
              FROM budgets_service.budgets b
              JOIN category_service.categories c ON b.category_id = c.category_id
              LEFT JOIN transaction_service.transactions t ON c.category_id = t.category_id 
                  AND EXTRACT(MONTH FROM t.date) = b.month 
                  AND EXTRACT(YEAR FROM t.date) = b.year
                  AND t.transaction_type = 'expense'
              WHERE b.user_id = $1 
                AND b.month = $2 
                AND b.year = $3
                ${queryData.category ? 'AND (c.category_name ILIKE $4)' : ''}
              GROUP BY c.category_name, b.amount_limit, b.month, b.year`;

              params.push(queryData.month || currentMonth, queryData.year || currentYear);
              if (queryData.category) params.push(`%${queryData.category}%`);
            }

            // 9. XÓA NGÂN SÁCH — qua API budget-service
            // Dùng khi: "Xóa ngân sách tiền điện tháng này đi"
            else if (queryData.type === 'budget_delete') {
              console.log('🔍 [budget_delete qua API] queryData:', queryData);
              try {
                const cat = await findCategoryByName(currentUserId, queryData.category);
                if (cat) {
                  const budget = await findBudgetByCategoryAndMonth(
                    currentUserId,
                    cat.category_id,
                    Number(queryData.month || currentMonth),
                    Number(queryData.year || currentYear),
                  );
                  if (budget) {
                    await deleteBudgetApi(currentUserId, budget.budget_id);
                    console.log(
                      `🗑️ [budget_delete qua API] đã xóa budget ${budget.budget_id} của "${queryData.category}"`,
                    );
                  } else {
                    console.log(
                      `ℹ️ [budget_delete qua API] không tìm thấy budget của "${
                        queryData.category
                      }" tháng ${queryData.month || currentMonth}/${queryData.year || currentYear}`,
                    );
                  }
                }
              } catch (e) {
                console.log('❌ [budget_delete qua API] Lỗi:', e.response?.data || e.message);
              }
              sql = '';
              params = [];
            }

            // 10. THÊM HOẶC CẬP NHẬT NGÂN SÁCH (Upsert) — qua API budget-service
            // Dùng khi: "Đặt ngân sách ăn uống tháng này 5 triệu"
            else if (queryData.type === 'budget_upsert') {
              const start = queryData.start_date || `${currentYear}-${currentMonth}-01`;
              const end =
                queryData.end_date ||
                `${currentYear}-${currentMonth}-${new Date(
                  currentYear,
                  currentMonth,
                  0,
                ).getDate()}`;
              try {
                const cat = await findOrCreateCategoryByName(currentUserId, queryData.category, {
                  type: 'expense',
                });
                const categoryId = cat?.category_id || cat?.categoryId;
                await upsertBudget(currentUserId, {
                  title: queryData.category,
                  categoryId,
                  type: 'limit',
                  amountLimit: Number(queryData.amount),
                  dateStart: start,
                  dateEnd: end,
                  month: Number(currentMonth),
                  year: Number(currentYear),
                });
                console.log(
                  `💎 [budget_upsert qua API] "${queryData.category}" = ${queryData.amount}đ`,
                );
              } catch (e) {
                console.error('❌ [budget_upsert qua API] Lỗi:', e.response?.data || e.message);
              }
              // Đã xử lý hoàn toàn qua API → bỏ qua nhánh pool.query bên dưới.
              sql = '';
              params = [];
            }

            // 11. DANH SÁCH TẤT CẢ NGÂN SÁCH (Budget Summary)
            // Dùng khi: "Tháng này tôi đã chi tiêu thế nào so với ngân sách?"
            else if (queryData.type === 'budget_summary') {
              sql = `
              SELECT 
                  c.category_name,
                  b.amount_limit,
                  COALESCE(SUM(t.amount), 0) as spent,
                  CASE 
                      WHEN b.amount_limit > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.amount_limit) * 100, 2)
                      ELSE 0 
                  END as percent_used
              FROM budgets_service.budgets b
              JOIN category_service.categories c ON b.category_id = c.category_id
              LEFT JOIN transaction_service.transactions t ON c.category_id = t.category_id 
                  AND EXTRACT(MONTH FROM t.date) = b.month 
                  AND EXTRACT(YEAR FROM t.date) = b.year
                  AND t.transaction_type = 'expense'
              WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
              GROUP BY c.category_name, b.amount_limit`;

              params.push(queryData.month || currentMonth, queryData.year || currentYear);
            }

            // --- 12. TẠO HOẶC CẬP NHẬT DANH MỤC CHI TIÊU — qua API category-service ---
            // VD: "Tạo danh mục ăn uống" hoặc "Sửa danh mục cafe thành tiền nước"
            else if (queryData.type === 'category_upsert') {
              try {
                if (queryData.old_name) {
                  const target = await findCategoryByName(currentUserId, queryData.old_name);
                  if (target) {
                    await updateCategoryApi(currentUserId, target.category_id, {
                      ...target,
                      category_name: queryData.new_name,
                    });
                    console.log(
                      `✏️ [category_upsert qua API] đổi tên "${queryData.old_name}" → "${queryData.new_name}"`,
                    );
                  } else {
                    console.log(
                      `ℹ️ [category_upsert qua API] không tìm thấy danh mục "${queryData.old_name}" để sửa`,
                    );
                  }
                } else if (queryData.category_name) {
                  await findOrCreateCategoryByName(currentUserId, queryData.category_name, {
                    type: 'expense',
                  });
                  console.log(`✨ [category_upsert qua API] tạo "${queryData.category_name}"`);
                }
              } catch (e) {
                console.error('❌ [category_upsert qua API] Lỗi:', e.response?.data || e.message);
              }
              sql = '';
              params = [];
            }

            // --- 13. XÓA DANH MỤC — qua API category-service ---
            // VD: "Xóa danh mục game"
            else if (queryData.type === 'category_delete') {
              try {
                const target = await findCategoryByName(currentUserId, queryData.category_name);
                if (target) {
                  await deleteCategoryApi(currentUserId, target.category_id);
                  console.log(`🗑️ [category_delete qua API] đã xóa "${queryData.category_name}"`);
                } else {
                  console.log(
                    `ℹ️ [category_delete qua API] không tìm thấy "${queryData.category_name}"`,
                  );
                }
              } catch (e) {
                console.error('❌ [category_delete qua API] Lỗi:', e.response?.data || e.message);
              }
              sql = '';
              params = [];
            }

            // --- 14. TRUY VẤN CÓ KHOẢNG NGÀY (Nâng cấp) ---
            // Xử lý: "Chi tiêu ăn uống từ 1-5 đến 30-5"
            else if (queryData.type === 'category_spending_range' && queryData.category) {
              sql = `
                SELECT COALESCE(SUM(t.amount), 0) as total, COUNT(*) as count
                FROM transaction_service.transactions t 
                JOIN account_service.accounts a ON t.account_id = a.account_id
                JOIN account_service.categories c ON t.category_id = c.category_id
                WHERE a.user_id = $1 
                AND c.category_name ILIKE $2
                AND t.date >= $3::date AND t.date <= $4::date
                AND t.transaction_type = 'expense'`;

              // Logic: Nếu không có ngày thì mặc định tháng hiện tại, nếu có thì dùng
              const start = queryData.start_date || `${currentYear}-${currentMonth}-01`;
              const end =
                queryData.end_date ||
                `${currentYear}-${currentMonth}-${new Date(
                  currentYear,
                  currentMonth,
                  0,
                ).getDate()}`;

              params = [currentUserId, `%${queryData.category}%`, start, end];
            }

            if (sql) {
              const dbRes = await pool.query(sql, params);
              const dataFound = dbRes.rows[0];

              // 1. Chuẩn bị dữ liệu thô từ DB
              let dbResult = '[DỮ LIỆU TRUY VẤN TỪ HỆ THỐNG]:\n';

              if (dataFound) {
                // TRƯỜNG HỢP 1: So sánh tuần (Nếu có biến this_week)
                if (dataFound.hasOwnProperty('this_week')) {
                  const thisW = parseFloat(dataFound.this_week || 0);
                  const lastW = parseFloat(dataFound.last_week || 0);
                  const diff = thisW - lastW;
                  const status = diff > 0 ? 'TĂNG THÊM 📈' : 'GIẢM ĐƯỢC 📉';

                  dbResult += `- Chi tiêu tuần này (đến hiện tại): ${thisW.toLocaleString()}đ\n`;
                  dbResult += `- Chi tiêu cả tuần trước: ${lastW.toLocaleString()}đ\n`;
                  dbResult += `- Chênh lệch: Tuần này ${currentUserName} đang tiêu ${status} ${Math.abs(
                    diff,
                  ).toLocaleString()}đ so với tuần trước.`;
                }

                // TRƯỜNG HỢP 2: Ngày tiêu nhiều nhất (Nếu có biến day_name)
                else if (dataFound.day_name) {
                  dbResult += `- Ngày tiêu nhiều nhất trong tháng: ${dataFound.day_name}\n`;
                  dbResult += `- Số tiền đã đốt vào ngày đó: ${parseFloat(
                    dataFound.total_day,
                  ).toLocaleString()}đ\n`;
                  dbResult += `- Số giao dịch: ${dataFound.count || 0}`;
                }

                // TRƯỜNG HỢP 3: Báo cáo ngân sách (Nếu có biến amount_limit)
                else if (dataFound && dataFound.hasOwnProperty('amount_limit')) {
                  const limit = parseFloat(dataFound.amount_limit);
                  const spent = parseFloat(dataFound.spent);
                  const remain = parseFloat(dataFound.remaining);
                  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

                  dbResult += `[BÁO CÁO NGÂN SÁCH DANH MỤC ${dataFound.category_name.toUpperCase()}]:\n`;
                  dbResult += `- Hạn mức ${currentUserName} đặt: ${limit.toLocaleString()}đ\n`;
                  dbResult += `- Đã tiêu hết: ${spent.toLocaleString()}đ (${percent}% ngân sách)\n`;
                  dbResult += `- Quỹ còn lại được phép tiêu: ${remain.toLocaleString()}đ\n`;

                  if (remain < 0) {
                    dbResult += `🚨 CẢNH BÁO: ${currentUserName} đã TIÊU LỐ ${Math.abs(
                      remain,
                    ).toLocaleString()}đ so với kế hoạch!`;
                  } else if (percent >= 80) {
                    dbResult += `⚠️ Nhắc nhở: ${currentUserName} đã dùng gần hết hạn mức rồi (${percent}%).`;
                  }
                }

                // TRƯỜNG HỢP 4: Báo cáo ngân sách (Nếu có biến amount_limit)
                else if (dataFound && dataFound.hasOwnProperty('amount_limit')) {
                  const limit = parseFloat(dataFound.amount_limit);
                  const spent = parseFloat(dataFound.spent);
                  const remain = parseFloat(dataFound.remaining);
                  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

                  dbResult += `[BÁO CÁO NGÂN SÁCH DANH MỤC ${dataFound.category_name.toUpperCase()}]:\n`;
                  dbResult += `- Hạn mức Bảo đặt: ${limit.toLocaleString()}đ\n`;
                  dbResult += `- Đã tiêu hết: ${spent.toLocaleString()}đ (${percent}% ngân sách)\n`;
                  dbResult += `- Quỹ còn lại được phép tiêu: ${remain.toLocaleString()}đ\n`;

                  if (remain < 0) {
                    dbResult += `🚨 CẢNH BÁO: Bảo đã TIÊU LỐ ${Math.abs(
                      remain,
                    ).toLocaleString()}đ so với kế hoạch!`;
                  } else if (percent >= 80) {
                    dbResult += `⚠️ Nhắc nhở: Bảo đã dùng gần hết hạn mức rồi (${percent}%).`;
                  }
                }

                // TRƯỜNG HỢP 5: Tổng Thu/Chi (Hôm nay, Tháng này, Hạng mục)
                else {
                  dbResult += `- Tổng Thu: ${parseFloat(
                    dataFound.total_income || 0,
                  ).toLocaleString()}đ\n`;
                  dbResult += `- Tổng Chi: ${parseFloat(
                    dataFound.total_expense || dataFound.total || 0,
                  ).toLocaleString()}đ\n`;
                  dbResult += `- Số giao dịch tìm thấy: ${dataFound.count || 0}`;
                }
              } else {
                dbResult += `Money Guard đã lục tung sổ sách nhưng không tìm thấy dữ liệu nào cho yêu cầu này của ${currentUserName} cả! 🕵️‍♂️`;
              }
              // --- KẾT THÚC GOM CHUNG ---

              // 2. ÉP AI ĐỌC LẠI TOÀN BỘ inputPrompt KÈM DATA MỚI
              // Việc dán ${inputPrompt} ở đây sẽ bắt nó dùng đúng rules, icon và phong cách bạn muốn.
              const secondResult = await chat.sendMessage(
                `${dbResult}\n\n[YÊU CẦU]: Dựa vào dữ liệu vừa truy vấn ở trên, hãy thực hiện đúng vai trò Money Guard theo hướng dẫn chi tiết dưới đây (Tuyệt đối tuân thủ Format 4 đoạn và phong cách mắng gắt):\n${inputPrompt}`,
              );

              return res.json({ reply: secondResult.response.text() });
            }
          } catch (e) {
            console.error('❌ Lỗi xử lý Query DB:', e.message);
          }
        }

        // --- MỚI: KIỂM TRA BẤT THƯỜNG TRƯỚC KHI LƯU (ANOMALY) ---
        const transactionMatches = [...reply.matchAll(/<transaction>(.*?)<\/transaction>/gs)];
        if (transactionMatches.length > 0) {
          for (const m of transactionMatches) {
            const data = JSON.parse(m[1].trim());
            const anomaly = await getAnomalyStatus(currentUserId, data.category_name, data.amount);

            if (anomaly.isAnomaly && !message.includes('xác nhận') && !message.includes('Lưu đi')) {
              // Nếu bất thường, yêu cầu AI hỏi lại trước khi lưu
              const warnResult = await chat.sendMessage(
                `[CẢNH BÁO]: Món này cao gấp ${anomaly.factor} lần bình thường. Hãy dừng lại hỏi ${currentUserName} xem có nhầm không, KHÔNG được lưu lúc này.`,
              );
              return res.json({ reply: warnResult.response.text() });
            }
          }
        }

        // ==========================================
        // VỊ TRÍ 2: LƯU CÂU TRẢ LỜI MONEY GUARD
        // ==========================================
        try {
          // Trước khi lưu, mình xóa mấy cái thẻ rác đi để DB sạch đẹp
          const cleanMessageForDB = reply
            .replace(/<.*?>[\s\S]*?<\/.*?>/gs, '')
            .replace(/\{[\s\S]*?\}/gs, '')
            .trim();

          await pool.query(
            'INSERT INTO ai_service.message_history (user_id, role, message) VALUES ($1, $2, $3)',
            [currentUserId, 'model', cleanMessageForDB || 'Money Guard đã xử lý yêu cầu của bạn.'],
          );
          console.log('💾 Đã lưu phản hồi của Money Guard vào DB');
        } catch (err) {
          console.error('❌ Lỗi lưu tin nhắn model:', err.message);
        }
        // ==========================================

        // Lưu vào lịch sử để câu sau Chat còn nhớ
        chatHistory.push({ role: 'user', parts: [{ text: message }] });
        chatHistory.push({ role: 'model', parts: [{ text: reply }] });

        // --- LOGIC CHỈ TẠO DANH MỤC (Dùng cho yêu cầu thêm danh mục mới) ---
        const createCatMatch = reply.match(/<create_category>(.*?)<\/create_category>/s);
        if (createCatMatch && createCatMatch[1]) {
          try {
            const catData = JSON.parse(createCatMatch[1].trim());
            const catName = catData.category_name;
            const catType = catData.type || 'expense';

            const userId = requireUserId(req, res);
            if (!userId) {
              return;
            }

            if (catName) {
              const existed = await findCategoryByName(userId, catName);
              if (existed) {
                console.log(`🟡 Danh mục "${catName}" đã tồn tại rồi.`);
              } else {
                await createCategoryApi(userId, {
                  category_name: catName,
                  type: catType,
                  color: 'blue',
                });
                console.log(`✨ Đã tạo danh mục mới qua API: ${catName}`);
              }
            }
          } catch (e) {
            console.error('❌ Lỗi tạo danh mục qua API:', e.response?.data || e.message);
          }
        }

        // --- XỬ LÝ XÓA GIAO DỊCH QUA CHAT
        const deleteMatch = reply.match(/<delete_transaction>(.*?)<\/delete_transaction>/s);
        if (deleteMatch) {
          try {
            const { id } = JSON.parse(deleteMatch[1]);
            await deleteTransactionApi(currentUserId, id);
            console.log(`🗑️ Đã xóa giao dịch ID qua API: ${id}`);
          } catch (e) {
            console.error('❌ Lỗi xóa giao dịch qua API:', e.response?.data || e.message);
          }
        }

        // --- XỬ LÝ CẬP NHẬT GIAO DỊCH QUA CHAT
        const updateMatch = reply.match(/<update_transaction>(.*?)<\/update_transaction>/s);
        if (updateMatch) {
          try {
            const parsed = JSON.parse(updateMatch[1]);
            const {
              id,
              amount,
              description,
              note,
              date,
              transaction_type: rawType,
              transactionType: rawTypeCamel,
              category_id: rawCatId,
              categoryId: rawCatIdCamel,
              account_id: rawAccId,
              accountId: rawAccIdCamel,
            } = parsed;

            if (!id) {
              throw new Error('Thiếu transaction id trong <update_transaction>');
            }

            // Transaction service PUT /:id yêu cầu full payload (AccountId, Amount,
            // TransactionType, Date). Lấy đúng bản ghi cũ qua GET /:id để có account_id /
            // category_id chính xác, rồi merge các field AI muốn đổi.
            const existing = await getTransactionById(currentUserId, id, {
              includeDetails: false,
            });

            if (!existing) {
              throw new Error(`Không tìm thấy giao dịch ${id} của user ${currentUserId}`);
            }

            const existingAccountId = existing.account_id ?? existing.accountId;
            const existingCategoryId = existing.category_id ?? existing.categoryId;
            const existingAmount = existing.amount;
            const existingType = existing.transaction_type ?? existing.transactionType;
            const existingDate = existing.date;
            const existingDesc = existing.description;
            const existingNote = existing.note;

            const nextAccountId = rawAccId ?? rawAccIdCamel ?? existingAccountId;
            if (!nextAccountId) {
              throw new Error(
                `Giao dịch ${id} không có account_id (existing=${JSON.stringify(existing)})`,
              );
            }

            // category_id là optional ở DTO; cho phép AI set null để clear.
            const nextCategoryId =
              rawCatId !== undefined
                ? rawCatId
                : rawCatIdCamel !== undefined
                ? rawCatIdCamel
                : existingCategoryId ?? null;

            const mergedType = String(
              rawType ?? rawTypeCamel ?? existingType ?? 'expense',
            ).toLowerCase();
            const normalizedType = mergedType === 'income' ? 'Income' : 'Expense';

            const payload = {
              account_id: nextAccountId,
              category_id: nextCategoryId,
              amount: amount != null ? Number(amount) : Number(existingAmount ?? 0),
              transaction_type: normalizedType,
              description: description ?? existingDesc ?? '',
              date: date ?? existingDate ?? new Date().toISOString(),
              note: note ?? existingNote ?? '',
            };

            await updateTransactionApi(currentUserId, id, payload);
            console.log(
              `✏️ Đã cập nhật giao dịch ID qua API: ${id} → amount=${payload.amount}, type=${payload.transaction_type}`,
            );
          } catch (e) {
            console.error('❌ Lỗi cập nhật giao dịch qua API:', e.response?.data || e.message);
          }
        }

        // --- LOGIC XỬ LÝ ĐẶT NGÂN SÁCH (ĐÃ TỐI ƯU & RENDER NGAY) ---
        const budgetMatch = reply.match(/<manage_budget>(.*?)<\/manage_budget>/s);
        if (budgetMatch) {
          console.log('🔍 [BUDGET] Tìm thấy yêu cầu đặt ngân sách!');

          try {
            const bData = JSON.parse(budgetMatch[1].trim());

            // 1. LÀM SẠCH TÊN: Bỏ mấy chữ rác AI hay thêm vào
            let finalCatName = bData.category_name
              .replace(/Ngân sách|Hạn mức|khoản|mục|đặt|hãy|cho|tiền|của|tôi/gi, '')
              .trim();

            if (finalCatName.length > 0) {
              finalCatName = finalCatName.charAt(0).toUpperCase() + finalCatName.slice(1);
            } else {
              finalCatName = 'Chi tiêu khác'; // Phòng hờ người dùng gõ trống
            }

            const finalAmount = bData.amount_limit;
            const targetMonth = bData.month || new Date().getMonth() + 1;
            const targetYear = bData.year || new Date().getFullYear();

            // Xử lý ngày bắt đầu/kết thúc (chuyển sang kiểu datetime)
            const start = bData.start_date
              ? new Date(bData.start_date)
              : new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
            const lastDay = new Date(targetYear, targetMonth, 0).getDate();
            const end = bData.end_date
              ? new Date(bData.end_date)
              : new Date(targetYear, targetMonth - 1, lastDay, 23, 59, 59, 999);

            console.log(
              `📦 [BUDGET] Đang xử lý mục: "${finalCatName}" | Số tiền: ${finalAmount}đ | Thời gian: ${start.toISOString()} đến ${end.toISOString()}`,
            );

            // 2. Tìm hoặc tạo danh mục qua category-service API.
            const cat = await findOrCreateCategoryByName(currentUserId, finalCatName, {
              type: 'expense',
              color: 'orange',
            });
            const categoryId = cat?.category_id || cat?.categoryId;

            // 3. Upsert budget qua budget-service API.
            const upserted = await upsertBudget(currentUserId, {
              title: finalCatName,
              categoryId,
              type: 'limit',
              amountLimit: Number(finalAmount),
              dateStart: start.toISOString(),
              dateEnd: end.toISOString(),
              month: targetMonth,
              year: targetYear,
            });

            console.log('💎 [BUDGET] Upsert qua API thành công:', upserted);

            // 🔥 4. LỆNH "ẢO THUẬT": Bắn socket để màn hình Web tự load lại số
            io.emit('money-guard-sync'); // Lệnh này cực quan trọng để Dashboard nhảy số ngay

            await addNotification(
              `🎯 Money Guard đã đặt hạn mức "${finalCatName}": ${parseFloat(
                finalAmount,
              ).toLocaleString()}đ!`,
              currentUserId,
            );
          } catch (e) {
            console.error('❌ [BUDGET] Lỗi xử lý:', e.message);
          }
        }

        // --- LOGIC XỬ LÝ QUẢN LÝ DANH MỤC (CRUD CATEGORY qua API) ---
        const manageCatMatch = reply.match(/<manage_category>(.*?)<\/manage_category>/s);
        if (manageCatMatch) {
          console.log('📂 [CATEGORY] Tìm thấy yêu cầu quản lý danh mục!');
          try {
            const data = JSON.parse(manageCatMatch[1].trim());
            let touched = false;

            if (data.action === 'create') {
              const exists = await findCategoryByName(currentUserId, data.category_name);
              if (!exists) {
                await createCategoryApi(currentUserId, {
                  category_name: data.category_name,
                  type: 'expense',
                  icon: '💰',
                  color: 'blue',
                });
              }
              touched = true;
            } else if (data.action === 'update') {
              const target = await findCategoryByName(currentUserId, data.old_name);
              if (target) {
                await updateCategoryApi(currentUserId, target.category_id, {
                  ...target,
                  category_name: data.new_name,
                });
                touched = true;
              }
            } else if (data.action === 'delete') {
              const target = await findCategoryByName(currentUserId, data.category_name);
              if (target) {
                await deleteCategoryApi(currentUserId, target.category_id);
                touched = true;
              }
            }

            if (touched) {
              console.log('✅ [CATEGORY] Cập nhật qua API thành công!');
              io.emit('money-guard-sync');

              await addNotification(
                `✨ Money Guard đã thực hiện: ${data.action} danh mục "${
                  data.category_name || data.new_name
                }"!`,
                currentUserId,
              );
            }
          } catch (e) {
            console.error('❌ [CATEGORY] Lỗi xử lý qua API:', e.response?.data || e.message);
          }
        }

        // --- LOGIC LƯU VÀO DATABASE POSTGRESQL (ĐÃ FIX NHẬP NHIỀU MÓN) ---
        // 1. Tìm tất cả các thẻ transaction có trong câu trả lời
        const matches = [...reply.matchAll(/<transaction>(.*?)<\/transaction>/gs)];

        if (matches.length > 0) {
          for (const match of matches) {
            try {
              const data = JSON.parse(match[1].trim());

              const userId = requireUserId(req, res);
              if (!userId) {
                return;
              }
              let catNameFromAI = data.category_name;

              const transactionType = data.transaction_type || 'expense';

              // Làm sạch số tiền và ngày tháng (fix lỗi XX)
              let finalAmount = parseFloat(String(data.amount).replace(/[^0-9.-]+/g, '')) || 0;
              let finalDate = data.date;

              if (!finalDate || finalDate.includes('X')) {
                finalDate = new Date().toISOString().split('T')[0];
              }

              //
              //
              //
              let finalDateString = data.date;
              if (!finalDateString || finalDateString.includes('X')) {
                finalDateString = new Date().toISOString().split('T')[0];
              }

              // BẮT BUỘC: Ghép thêm Giờ:Phút:Giây thực tế lúc người dùng chat vào chuỗi ngày
              const now = new Date();
              const [year, month, day] = finalDateString.split('-').map(Number);
              const transactionDate = new Date(
                year,
                month - 1,
                day,
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
              );

              //
              //
              //
              const timeString = now.toTimeString().split(' ')[0]; // Lấy ra chuỗi "09:20:35"

              // Kết quả sẽ ra một chuỗi đầy đủ: "2026-04-14 09:20:35"
              // finalDate = `${finalDate} ${timeString}`;
              finalDate = `${finalDate} ${timeString}+07`;

              const transactionKey = `${data.description}-${data.amount}-${data.date}`;
              const nowTime = Date.now();

              // Nếu trùng nội dung và thời gian cách nhau chưa tới 5 giây thì bỏ qua
              if (
                lastSavedTransaction.content === transactionKey &&
                nowTime - lastSavedTransaction.time < 5000
              ) {
                console.log('🚫 Chặn lưu trùng giao dịch (Double Submit)');
                continue;
              }

              lastSavedTransaction = { time: nowTime, content: transactionKey };

              // 1. TÌM KIẾM THÔNG MINH:
              // Kiểm tra xem trong DB đã có danh mục nào "chứa" hoặc "giống" cái AI gửi về không
              // Ví dụ: AI gửi "Cơm gà" mà DB đã có "Cơm" -> dùng luôn "Cơm"
              let catRes = await pool.query(
                `SELECT category_id, category_name FROM category_service.categories 
                  WHERE (category_name ILIKE $1 OR $1 ILIKE '%' || category_name || '%') 
                  AND user_id = $2 LIMIT 1`,
                [catNameFromAI, userId],
              );

              let categoryId;
              if (catRes.rows.length > 0) {
                categoryId = catRes.rows[0].category_id;
                console.log(
                  `♻️  Gom nhóm: "${catNameFromAI}" vào danh mục sẵn có: "${catRes.rows[0].category_name}"`,
                );
              } else {
                // NẾU CHƯA CÓ -> TỰ ĐỘNG TÌM ICON PHÙ HỢP TRONG KHO ICONS
                console.log(`🔍 Đang tìm icon tự động cho danh mục mới: ${catNameFromAI}...`);

                const iconLookup = await pool.query(
                  `SELECT icon_id FROM category_service.icons 
                      WHERE $1 ILIKE '%' || name || '%' OR $1 ILIKE '%' || icon_code || '%' 
                      LIMIT 1`,
                  [catNameFromAI],
                );

                // Nếu thấy icon phù hợp thì lấy, không thì lấy icon mặc định (Bills)
                const finalIconId =
                  iconLookup.rows.length > 0
                    ? iconLookup.rows[0].icon_id
                    : 'f1995874-297d-460c-882d-136585918831'; // UUID icon mặc định (Bills)

                // Nếu tạo danh mục mới, phải tạo đúng loại (income/expense)
                // const newCat = await pool.query(
                //   'INSERT INTO category_service.categories (user_id, category_name, type, icon_id, color) VALUES ($1, $2, $3, $4, $5) RETURNING category_id',
                //   [userId, data.category_name, transactionType, finalIconId, 'blue'],
                // );
                const newCat = await findOrCreateCategoryByName(userId, data.category_name, {
                  type: transactionType,
                  icon_id: finalIconId,
                  color: 'blue',
                });
                categoryId = newCat.rows[0].category_id;
                console.log(`✨ Tạo danh mục mới: ${data.category_name}`);
              }

              // 2. LẤY ACCOUNT MẶC ĐỊNH (thay cho UUID hardcode trước đây).
              const acc = await getOrCreateDefaultAccount(userId, 'Tài khoản mặc định');
              const accountId = acc?.account_id || acc?.accountId;

              // 3. TẠO GIAO DỊCH QUA TRANSACTION-SERVICE API.
              await createTransactionApi(currentUserId, {
                account_id: accountId,
                category_id: categoryId,
                amount: Number(finalAmount),
                transaction_type: transactionType === 'income' ? 'Income' : 'Expense',
                description: data.description,
                date:
                  transactionDate instanceof Date
                    ? transactionDate.toISOString()
                    : new Date(transactionDate).toISOString(),
                note: data.note || '',
              });
              console.log(`✅ Đã lưu ${transactionType} qua API: ${data.description}`);

              io.emit('money-guard-sync');
              // ============================================================
              // GỬI TIN SANG N8N ĐỂ KIỂM TRA HẠN MỨC (CHỈ KHI TIÊU TIỀN)
              // ============================================================
              if (transactionType === 'expense') {
                try {
                  await axios.post(
                    'https://unnibbed-unthrilled-averi.ngrok-free.dev/webhook/money-guard',
                    {
                      userId: currentUserId,
                      transferAmount: finalAmount,
                      transferType: 'out',
                      content: data.description,
                      gateway: 'Chatbot AI',
                    },
                  );
                  console.log('📡 Đã báo cho n8n kiểm tra hạn mức chi tiêu tay.');
                } catch (n8nErr) {
                  console.error('❌ Lỗi gọi n8n:', n8nErr.message);
                }
              }
            } catch (itemErr) {
              console.error('❌ Lỗi lưu món:', itemErr.message);
            }
          }
        }

        await addNotification('Money Guard đã ghi sổ xong giao dịch của bạn! 🛡️', currentUserId);

        // Trả về reply cho client
        return res.json({ reply });
      } catch (err) {
        attempt++;
        if (err.status !== 503 && err.status !== 500) throw err;
        console.log(`Retry ${attempt}/${maxRetries} sau lỗi: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }

    // Hết retry → trả lỗi thân thiện cho client
    return res.status(503).json({
      error: 'Model đang quá tải (503), thử lại sau vài phút nhé! Hoặc thử model khác.',
    });
  } catch (err) {
    console.error('Gemini error full:', {
      message: err.message,
      status: err.status,
      details: err.response ? await err.response?.text?.() : null,
    });

    let status = err.status || 500;
    let clientMsg = 'Lỗi server AI, thử lại sau nhé';

    if (status === 503 || err.message?.includes('overloaded')) {
      clientMsg = 'Model đang quá tải, chờ chút rồi thử lại (hoặc đổi model)';
    } else if (status === 429) {
      // clientMsg = 'Quá giới hạn request, chờ 1 phút nhé';
      const waitMatch = err.message.match(/retry in ([\d.]+)s/);
      const waitTime = waitMatch ? parseFloat(waitMatch[1]) : 60;

      clientMsg = `AI đang bận vì vượt quá hạn mức, hãy đợi ${Math.round(
        waitTime,
      )} giây rồi thử lại nhé!`;
    } else if (status === 401 || status === 403) {
      clientMsg = 'API key không hợp lệ';
    }

    res.status(status).json({ error: clientMsg });
  }
});

//
//
//
app.get('/ai-deep-scan', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    console.log(`🔍 [SCAN] Bắt đầu quét cho User ID: ${userId}`);

    const result = await pool.query(
      `
      SELECT t.description, t.amount, t.date, c.category_name 
      FROM transaction_service.transactions t 
      JOIN category_service.categories c ON t.category_id = c.category_id
      JOIN account_service.accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 AND EXTRACT(MONTH FROM t.date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND t.transaction_type = 'expense'
    `,
      [userId],
    );

    console.log(`📊 [SCAN] Tìm thấy ${result.rows.length} giao dịch.`);

    if (result.rows.length === 0) {
      console.log('⚠️ [SCAN] Không có dữ liệu chi tiêu, trả về kết quả mặc định.');
      return res.json({
        score: 100,
        disease: 'Ví tiền sạch sẽ tuyệt đối',
        symptoms: ['Không có chi tiêu nào'],
        advice: 'Bạn chưa tiêu gì nên không có bệnh để khám!',
        future: 'Giàu sang phú quý',
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const prompt = `Phân tích hồ sơ bệnh án tài chính này: ${JSON.stringify(
      result.rows,
    )}. Trả về JSON duy nhất: {"score":0-100, "disease":"...", "symptoms":[], "advice":"...", "future":"..."}`;

    console.log('🧠 [SCAN] Đang gửi yêu cầu sang Gemini...');
    const aiRes = await model.generateContent(prompt);
    const text = aiRes.response.text();

    // LOG QUAN TRỌNG: Xem AI trả về chữ hay JSON
    console.log('📝 [SCAN] AI phản hồi thô:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const report = JSON.parse(jsonMatch[0]);
      console.log('✅ [SCAN] Parse JSON thành công!');
      res.json(report);
    } else {
      console.error('❌ [SCAN] AI không trả về đúng định dạng JSON!');
      res.status(500).json({ error: 'AI Format Error' });
    }
  } catch (err) {
    console.error('🚨 LỖI TẠI SERVER:', err); // Log lỗi hệ thống
    res.status(500).json({ error: err.message });
  }
});

app.post('/chat-stream', async (req, res) => {
  const { message } = req.body;

  const currentUserId = requireUserId(req, res);
  if (!currentUserId) {
    return;
  }
  const currentUserName = await getUserName(currentUserId);
  // Set headers cho SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-robotics-er-1.5-preview',
      systemInstruction: getMoneyGuardRules(currentUserName),
    });

    const chat = model.startChat({
      history: chatHistory.slice(-10),
    });

    // Stream response
    const result = await chat.sendMessageStream(message);

    let fullResponse = '';

    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;

      // Gửi từng chunk về client
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    // Kết thúc stream
    res.write(`data: ${JSON.stringify({ done: true, fullText: fullResponse })}\n\n`);
    res.end();

    // Lưu vào DB sau khi hoàn thành
    await pool.query(
      'INSERT INTO ai_service.message_history (user_id, role, message) VALUES ($1, $2, $3)',
      [currentUserId, 'user', message],
    );

    await pool.query(
      'INSERT INTO ai_service.message_history (user_id, role, message) VALUES ($1, $2, $3)',
      [currentUserId, 'model', fullResponse],
    );
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('❌ Uncaught Error:', err);

  // Gemini API errors
  if (err.message?.includes('quota') || err.status === 429) {
    return res.status(429).json({
      error: 'AI đang quá tải, vui lòng thử lại sau 1 phút! 🙏',
      retryAfter: 60,
    });
  }

  if (err.status === 503) {
    return res.status(503).json({
      error: 'Gemini AI tạm thời không khả dụng. Đang thử model dự phòng...',
    });
  }

  // Database errors
  if (err.code === '23505') {
    // Unique violation
    return res.status(400).json({
      error: 'Dữ liệu đã tồn tại!',
    });
  }

  // Default
  res.status(500).json({
    error: 'Có lỗi xảy ra, vui lòng thử lại!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
});

app.get('/ai-health', (req, res) => {
  res.json(getStatusData());
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server và Socket đang chạy tại cổng: ${PORT}`);
});
