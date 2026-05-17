import axios from 'axios';

const ACCOUNT_URL = process.env.ACCOUNT_SERVICE_URL || 'http://account-service:3002';
const CATEGORY_URL = process.env.CATEGORY_SERVICE_URL || 'http://category-service:3003';
const TRANSACTION_URL = process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:3007';
const BUDGET_URL = process.env.BUDGET_SERVICE_URL || 'http://budget-service:3008';
const USER_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';

const DEFAULT_TIMEOUT = Number(process.env.AI_HTTP_TIMEOUT || 15000);

const makeClient = (baseURL) =>
  axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
  });

const accountApi = makeClient(ACCOUNT_URL);
const categoryApi = makeClient(CATEGORY_URL);
const transactionApi = makeClient(TRANSACTION_URL);
const budgetApi = makeClient(BUDGET_URL);
const userApi = makeClient(USER_URL);

const userHeader = (userId) => ({ 'X-User-Id': String(userId) });

const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
};

// ===========================================================================
// USER SERVICE
// ===========================================================================
export async function getUserProfile(userId) {
  const res = await userApi.get('/profile', { headers: userHeader(userId) });
  return unwrap(res);
}

// ===========================================================================
// ACCOUNT SERVICE
// ===========================================================================
export async function listAccounts(userId) {
  const res = await accountApi.get('/', { headers: userHeader(userId) });
  return unwrap(res) || [];
}

export async function createAccount(userId, { accountName, type = 'bank', balance = 0, currency = 'VND' }) {
  const res = await accountApi.post(
    '/',
    { accountName, type, balance, currency },
    { headers: userHeader(userId) },
  );
  return unwrap(res);
}

// Lấy account đầu tiên của user, tự tạo nếu chưa có.
export async function getOrCreateDefaultAccount(userId, accountName = 'Tài khoản mặc định') {
  const accounts = await listAccounts(userId);
  if (Array.isArray(accounts) && accounts.length > 0) {
    return accounts[0];
  }
  return await createAccount(userId, { accountName, type: 'bank', balance: 0, currency: 'VND' });
}

// ===========================================================================
// CATEGORY SERVICE
// ===========================================================================
export async function listCategories(userId) {
  const res = await categoryApi.get('/categories', { headers: userHeader(userId) });
  return unwrap(res) || [];
}

export async function createCategory(userId, { category_name, type = 'expense', icon_id = "f1995874-297d-460c-882d-136585918831", color = 'blue' }) {
  const payload = {
    category_name,
    type,
    color,
    icon_id
  };
  const res = await categoryApi.post('/category', payload, { headers: userHeader(userId) });
  return unwrap(res);
}

export async function updateCategory(userId, categoryId, payload) {
  const res = await categoryApi.put(`/category/${categoryId}`, payload, {
    headers: userHeader(userId),
  });
  return unwrap(res);
}

export async function deleteCategory(userId, categoryId) {
  const res = await categoryApi.delete(`/category/${categoryId}`, { headers: userHeader(userId) });
  return unwrap(res);
}

// Helper: chuẩn hóa tên (bỏ dấu tiếng Việt + lowercase + trim) để so khớp linh hoạt.
const normalizeName = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/gi, 'd')
    .trim()
    .toLowerCase();

// Helper: tìm category theo tên (case-insensitive, bỏ dấu, partial match) trong danh sách của user.
export async function findCategoryByName(userId, name) {
  if (!name) return null;
  const list = await listCategories(userId);
  const targetRaw = String(name).trim().toLowerCase();
  const targetNorm = normalizeName(name);
  if (!targetRaw && !targetNorm) return null;

  // 1. exact match có dấu
  const exact = list.find((c) => String(c.category_name || '').toLowerCase() === targetRaw);
  if (exact) return exact;

  // 2. exact match sau khi bỏ dấu
  const exactNorm = list.find((c) => normalizeName(c.category_name) === targetNorm);
  if (exactNorm) return exactNorm;

  // 3. partial match sau khi bỏ dấu (2 chiều)
  return (
    list.find((c) => {
      const cn = normalizeName(c.category_name);
      if (!cn || !targetNorm) return false;
      return cn.includes(targetNorm) || targetNorm.includes(cn);
    }) || null
  );
}

// Tìm-hoặc-tạo category theo tên.
export async function findOrCreateCategoryByName(userId, name, { type = 'expense', icon = '🏦', color = 'blue', icon_id ="f1995874-297d-460c-882d-136585918831" } = {}) {
  const found = await findCategoryByName(userId, name);
  if (found) return found;
  return await createCategory(userId, { category_name: name, type, icon, color, icon_id });
}

// ===========================================================================
// TRANSACTION SERVICE
// ===========================================================================
// Trả về object { items, totalCount, page, pageSize } (response dạng PaginatedResultDto từ .NET).
export async function listTransactionsPage(userId, filters = {}) {
  const params = {
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? filters.page_size ?? 50,
    include_details: filters.includeDetails ?? filters.include_details ?? true,
  };
  if (filters.transactionType || filters.transaction_type)
    params.transaction_type = filters.transactionType || filters.transaction_type;
  if (filters.categoryId || filters.category_id)
    params.category_id = filters.categoryId || filters.category_id;
  if (filters.accountId || filters.account_id)
    params.account_id = filters.accountId || filters.account_id;
  if (filters.dateFrom || filters.date_from)
    params.date_from = (filters.dateFrom || filters.date_from);
  if (filters.dateTo || filters.date_to) params.date_to = (filters.dateTo || filters.date_to);

  const res = await transactionApi.get('/', { params, headers: userHeader(userId) });
  const body = res?.data || {};
  // .NET trả về camelCase mặc định: { items, totalCount, page, pageSize, totalPages }
  const items = body.items || body.Items || [];
  return {
    items,
    totalCount: body.totalCount ?? body.TotalCount ?? items.length,
    page: body.page ?? params.page,
    pageSize: body.pageSize ?? params.page_size,
  };
}

// Helper: gom tất cả transaction (paginate cho tới hết hoặc chạm safety cap).
export async function listAllTransactions(userId, filters = {}) {
  const all = [];
  const pageSize = filters.pageSize ?? filters.page_size ?? 200;
  let page = 1;
  for (let i = 0; i < 50; i += 1) {
    const res = await listTransactionsPage(userId, { ...filters, page, pageSize });
    if (!res.items.length) break;
    all.push(...res.items);
    if (res.items.length < pageSize) break;
    page += 1;
  }
  return all;
}

export async function createTransaction(userId, payload) {
  // payload theo CreateTransactionRequestDto: AccountId, CategoryId, Amount, TransactionType, Description, Date, Note
  const res = await transactionApi.post('/', payload, { headers: userHeader(userId) });
  return res?.data;
}

// Lấy 1 transaction theo id. Trả về null nếu 404, throw nếu lỗi khác.
export async function getTransactionById(userId, transactionId, { includeDetails = false } = {}) {
  try {
    const res = await transactionApi.get(`/${transactionId}`, {
      params: { include_details: includeDetails },
      headers: userHeader(userId),
    });
    return res?.data || null;
  } catch (err) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function updateTransactionApi(userId, transactionId, payload) {
  const res = await transactionApi.put(`/${transactionId}`, payload, {
    headers: userHeader(userId),
  });
  return res?.data;
}

export async function deleteTransactionApi(userId, transactionId) {
  const res = await transactionApi.delete(`/${transactionId}`, { headers: userHeader(userId) });
  return res?.data;
}

// ===========================================================================
// BUDGET SERVICE
// ===========================================================================
export async function listBudgets(userId, { categoryId, dateStart } = {}) {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (dateStart) params.dateStart = dateStart;
  const res = await budgetApi.get('/', { params, headers: userHeader(userId) });
  return unwrap(res) || [];
}

// Helper: lấy budget theo tháng/năm (filter cục bộ vì service không expose query này).
// Dùng quy tắc "overlap": budget áp dụng cho tháng X nếu khoảng [date_start, date_end]
// của budget có giao với khoảng [đầu_tháng_X, cuối_tháng_X]. Cách này không phụ thuộc
// timezone của Node process (tránh bug khi container chạy UTC nhưng dữ liệu được tạo
// theo giờ Việt Nam +07).
export async function listBudgetsByMonth(userId, month, year) {
  const list = await listBudgets(userId);
  const m = Number(month);
  const y = Number(year);
  // Khoảng tháng tính theo UTC để so sánh nhất quán.
  const monthStart = Date.UTC(y, m - 1, 1, 0, 0, 0, 0);
  const monthEnd = Date.UTC(y, m, 1, 0, 0, 0, 0) - 1; // ms cuối tháng

  return list.filter((b) => {
    if (!b.date_start) return false;
    const start = new Date(b.date_start).getTime();
    const end = b.date_end ? new Date(b.date_end).getTime() : start;
    if (Number.isNaN(start)) return false;
    // overlap: start <= monthEnd && end >= monthStart
    return start <= monthEnd && end >= monthStart;
  });
}

export async function createBudget(userId, { title, categoryId, type = 'limit', amountLimit, dateStart, dateEnd }) {
  const res = await budgetApi.post(
    '/',
    { title, categoryId, type, amountLimit, dateStart, dateEnd },
    { headers: userHeader(userId) },
  );
  return unwrap(res);
}

export async function updateBudgetApi(userId, budgetId, payload) {
  const res = await budgetApi.put(`/${budgetId}`, payload, { headers: userHeader(userId) });
  return unwrap(res);
}

export async function deleteBudgetApi(userId, budgetId) {
  const res = await budgetApi.delete(`/${budgetId}`, { headers: userHeader(userId) });
  return unwrap(res);
}

// Helper: tìm budget theo (categoryId, month, year). Trả về budget đầu tiên match.
export async function findBudgetByCategoryAndMonth(userId, categoryId, month, year) {
  const list = await listBudgetsByMonth(userId, month, year);
  return list.find((b) => String(b.category_id) === String(categoryId)) || null;
}

// Upsert budget theo (categoryId, month, year): nếu đã có thì PUT, không thì POST.
export async function upsertBudget(userId, { title, categoryId, type = 'limit', amountLimit, dateStart, dateEnd, month, year }) {
  const existing = await findBudgetByCategoryAndMonth(userId, categoryId, month, year);
  if (existing) {
    return await updateBudgetApi(userId, existing.budget_id, {
      title,
      categoryId,
      type,
      amountLimit,
      dateStart,
      dateEnd,
    });
  }
  return await createBudget(userId, {
    title,
    categoryId,
    type,
    amountLimit,
    dateStart,
    dateEnd,
  });
}
