import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Wallet,
  Tag,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { transactionsApi } from '@/api/transaction.api';
import { accountApi } from '@/api/account.api';
import { categoryApi } from '@/api/category.api';
import type { TransactionResponse, PaginatedResult } from '@/types/transaction';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import { DeleteTransactionModal } from '@/components/modals/DeleteTransactionModal';

interface AccountOption {
  account_id: string;
  account_name: string;
}

interface CategoryOption {
  category_id: string;
  category_name: string;
}

export function Transactions() {
  const navigate = useNavigate();
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<TransactionResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionResponse | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'Income' | 'Expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterAccountId, setFilterAccountId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const [pendingDateFrom, setPendingDateFrom] = useState('');
  const [pendingDateTo, setPendingDateTo] = useState('');
  const [pendingAccountId, setPendingAccountId] = useState('');
  const [pendingCategoryId, setPendingCategoryId] = useState('');

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    accountApi.getAccounts().then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setAccounts(Array.isArray(data) ? data : []);
    });
    categoryApi.getCategories().then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        page_size: pageSize,
      };

      if (filterType !== 'all') params.transaction_type = filterType;
      if (dateFrom) params.date_from = `${dateFrom}T00:00:00Z`;
      if (dateTo) params.date_to = `${dateTo}T23:59:59Z`;
      if (filterAccountId) params.account_id = filterAccountId;
      if (filterCategoryId) params.category_id = filterCategoryId;

      const { data } = await transactionsApi.getTransactions(params);
      setPaginatedData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách giao dịch';
      setError(message);
      toast.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterType, dateFrom, dateTo, filterAccountId, filterCategoryId]);

  useEffect(() => {
    const handleAISync = async () => {
      console.log('📜 Transactions: Nhận lệnh từ AI! Đang đồng bộ...');
      const syncToast = toast.loading('Money Guard đang cập nhật giao dịch mới...');
      setFilterType('all');
      setSearchQuery('');
      setCurrentPage(1);
      await fetchTransactions();
      toast.dismiss(syncToast);
      toast.success('Dữ liệu đã được AI ghi sổ!', {
        icon: (
          <div className="bg-green-500 rounded-full p-1">
            <Plus className="text-white h-3 w-3" />
          </div>
        ),
        duration: 3000,
      });
    };

    window.addEventListener('money-guard-sync', handleAISync);
    return () => window.removeEventListener('money-guard-sync', handleAISync);
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, dateFrom, dateTo, filterAccountId, filterCategoryId]);

  const handleTransactionCreated = () => {
    setShowAddTransaction(false);
    fetchTransactions();
    toast.success('Tạo giao dịch thành công!', { duration: 3000 });
    window.dispatchEvent(new Event('dashboard_refresh'));
  };

  const handleTransactionUpdated = () => {
    setEditingTransaction(null);
    fetchTransactions();
    toast.success('Cập nhật giao dịch thành công!', { duration: 3000 });
    window.dispatchEvent(new Event('dashboard_refresh'));
  };

  const handleTransactionDeleted = () => {
    setDeletingTransaction(null);
    fetchTransactions();
    toast.success('Xóa giao dịch thành công!', { duration: 3000 });
    window.dispatchEvent(new Event('dashboard_refresh'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const transactions = paginatedData?.items ?? [];
  const totalPages = paginatedData?.totalPages ?? 0;
  const totalCount = paginatedData?.totalCount ?? 0;

  const displayedTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (t.description ?? '').toLowerCase().includes(searchLower) ||
      (t.categoryName ?? '').toLowerCase().includes(searchLower) ||
      (t.accountName ?? '').toLowerCase().includes(searchLower) ||
      (t.note ?? '').toLowerCase().includes(searchLower)
    );
  });

  const filterButtonClass = (active: boolean, type?: 'Income' | 'Expense') => {
    if (active && type === 'Income') return '!bg-green-500 text-white shadow-md';
    if (active && type === 'Expense') return '!bg-red-500 text-white shadow-md';
    if (active) return '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md';
    return '!bg-gray-100 text-gray-700 hover:!bg-gray-200';
  };

  const clearFilters = () => {
    setFilterType('all');
    setDateFrom('');
    setDateTo('');
    setFilterAccountId('');
    setFilterCategoryId('');
    setPendingDateFrom('');
    setPendingDateTo('');
    setPendingAccountId('');
    setPendingCategoryId('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const applyDateAccountFilters = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setFilterAccountId(pendingAccountId);
    setFilterCategoryId(pendingCategoryId);
    setCurrentPage(1);
  };

  const setDatePreset = (preset: 'today' | 'week' | 'month') => {
    const now = new Date();
    const to = now.toISOString().split('T')[0];
    let from: string;
    if (preset === 'today') {
      from = to;
    } else if (preset === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = d.toISOString().split('T')[0];
    } else {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
    setPendingDateFrom(from);
    setPendingDateTo(to);
    setDateFrom(from);
    setDateTo(to);
  };

  const filtersDirty =
    pendingDateFrom !== dateFrom ||
    pendingDateTo !== dateTo ||
    pendingAccountId !== filterAccountId ||
    pendingCategoryId !== filterCategoryId;

  const hasActiveFilters =
    filterType !== 'all' || dateFrom || dateTo || filterAccountId || filterCategoryId;

  if (loading && !paginatedData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-500">Đang tải giao dịch...</p>
        </div>
      </div>
    );
  }

  if (error && !paginatedData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div>
            <p className="mb-1 text-lg font-medium text-gray-900">Không thể tải dữ liệu</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchTransactions}
            className="inline-flex items-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900 flex items-center gap-3">
              Giao dịch
              {loading && <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />}
            </h1>
            <p className="text-gray-600">Quản lý tất cả các giao dịch thu chi của bạn</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="flex h-12 w-12 items-center justify-center rounded-xl !bg-gray-100 text-gray-600 transition hover:!bg-gray-200 disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddTransaction(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
            >
              <Plus className="h-5 w-5" />
              Thêm giao dịch
            </button>
          </div>
        </div>

        {/* Quick overview banner with date presets */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 shadow-lg">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Tổng cộng</p>
                <p className="text-xl font-bold text-white">{totalCount} giao dịch</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/70" />
              <button
                type="button"
                onClick={() => setDatePreset('today')}
                className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setDatePreset('week')}
                className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                7 ngày qua
              </button>
              <button
                type="button"
                onClick={() => setDatePreset('month')}
                className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                Tháng này
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search + type filter */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mô tả, danh mục, tài khoản..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                    filterType === 'all',
                  )}`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('Income')}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                    filterType === 'Income',
                    'Income',
                  )}`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Thu
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('Expense')}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                    filterType === 'Expense',
                    'Expense',
                  )}`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Chi
                </button>
              </div>
            </div>

            {/* Row 2: Date filter + Account + Category filter */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={pendingDateFrom}
                  onChange={(e) => setPendingDateFrom(e.target.value)}
                  className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="date"
                  value={pendingDateTo}
                  onChange={(e) => setPendingDateTo(e.target.value)}
                  className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-5 w-5 shrink-0 text-gray-400" />
                <select
                  value={pendingAccountId}
                  onChange={(e) => setPendingAccountId(e.target.value)}
                  className="h-10 min-w-[160px] rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Tất cả tài khoản</option>
                  {accounts.map((acc) => (
                    <option key={acc.account_id} value={acc.account_id}>
                      {acc.account_name}
                    </option>
                  ))}
                </select>

                <Tag className="h-5 w-5 shrink-0 text-gray-400" />
                <select
                  value={pendingCategoryId}
                  onChange={(e) => setPendingCategoryId(e.target.value)}
                  className="h-10 min-w-[160px] rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={applyDateAccountFilters}
                  disabled={!filtersDirty}
                  className="inline-flex items-center gap-1.5 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-4 py-2 text-sm font-semibold text-white shadow transition hover:!from-orange-500 hover:!to-rose-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Áp dụng
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-xl !bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:!bg-gray-200"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transaction table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {displayedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-4 text-gray-500">
                {totalCount === 0 ? 'Chưa có giao dịch nào' : 'Không tìm thấy giao dịch phù hợp'}
              </p>
              {totalCount === 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(true)}
                  className="font-medium !bg-transparent text-orange-500 hover:text-orange-600"
                >
                  Thêm giao dịch đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600">
                      Ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600">
                      Danh mục
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600">
                      Tài khoản
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600">
                      Mô tả
                    </th>
                    <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-600">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {displayedTransactions.map((transaction) => (
                    <tr key={transaction.transId} className="transition hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              transaction.transactionType === 'Income'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                            style={
                              transaction.categoryColor
                                ? {
                                    backgroundColor: `${transaction.categoryColor}20`,
                                    color: transaction.categoryColor,
                                  }
                                : undefined
                            }
                          >
                            {transaction.transactionType === 'Income' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <span className="text-sm text-gray-800">
                            {transaction.categoryName ?? 'Không danh mục'}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          <Wallet className="h-3 w-3" />
                          {transaction.accountName ?? '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {transaction.description || '—'}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            transaction.transactionType === 'Income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.transactionType === 'Income' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <div className="flex shrink-0 items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/transactions/${transaction.transId}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Xem</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingTransaction(transaction)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-orange-800 transition hover:bg-orange-100"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTransaction(transaction)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> —{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span>{' '}
                trong tổng <span className="font-medium">{totalCount}</span> giao dịch
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl !bg-white border border-gray-300 text-gray-600 transition hover:!bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push('ellipsis');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl border text-sm font-medium transition ${
                          currentPage === item
                            ? '!bg-orange-500 border-orange-500 text-white shadow'
                            : '!bg-white border-gray-300 text-gray-700 hover:!bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl !bg-white border border-gray-300 text-gray-600 transition hover:!bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onCreated={handleTransactionCreated}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdated={handleTransactionUpdated}
        />
      )}

      {deletingTransaction && (
        <DeleteTransactionModal
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onDeleted={handleTransactionDeleted}
        />
      )}
    </>
  );
}
