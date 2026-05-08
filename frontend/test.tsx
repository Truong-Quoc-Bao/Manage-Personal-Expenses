import { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  RefreshCw, // Thêm icon refresh
} from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';
import { DeleteTransactionModal } from '../components/modals/DeleteTransactionModal';
import { transactionStore, accountStore, type Transaction } from '../store/mockData';
import { statsApi } from '../api/ai.api'; // Import statsApi để gọi dữ liệu từ AI

export function Transactions() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>(transactionStore.getAll());
  const [accounts, setAccounts] = useState(accountStore.getAll());
  const [isLoading, setIsLoading] = useState(false); // Trạng thái load

  // ==========================================
  // 1. LOGIC ĐỒNG BỘ DỮ LIỆU TỪ SERVER (AI)
  // ==========================================
  const fetchTransactionsFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📜 Transactions: Đang nạp dữ liệu mới từ Server...');
      const res = await statsApi.getRecentTransactions();

      if (res.data && res.data.length > 0) {
        // Map lại dữ liệu Server cho khớp với giao diện Transactions
        const mappedData: Transaction[] = res.data.map((t: any) => ({
          id: t.id || t.trans_id,
          type: t.type,
          category: t.category_name || t.category || 'Khác',
          amount: Math.abs(parseFloat(t.amount)),
          date: new Date(t.created_at || t.date).toLocaleDateString('vi-VN'),
          description: t.description || 'Giao dịch từ AI',
          account: t.account_name || 'Tiền mặt',
          note: t.note || '',
        }));
        setTransactions(mappedData);
      }
    } catch (error) {
      console.error('Lỗi tải giao dịch:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📡 "Ăng-ten" đón sóng từ AI Chat (money-guard-sync)
  useEffect(() => {
    fetchTransactionsFromServer(); // Load lần đầu

    const handleSync = () => {
      console.log('📜 Transactions: Nhận lệnh cập nhật danh sách!');
      fetchTransactionsFromServer();
    };

    window.addEventListener('money-guard-sync', handleSync);
    return () => window.removeEventListener('money-guard-sync', handleSync);
  }, [fetchTransactionsFromServer]);

  // Vẫn giữ subscribe store để dùng cho thêm thủ công (Manual)
  useEffect(() => {
    const unsubscribeTransactions = transactionStore.subscribe(setTransactions);
    const unsubscribeAccounts = accountStore.subscribe(setAccounts);
    return () => {
      unsubscribeTransactions();
      unsubscribeAccounts();
    };
  }, []);

  // ==========================================
  // 2. CÁC THAO TÁC (THÊM, SỬA, XÓA)
  // ==========================================

  const handleAddTransaction = (transactionData: any) => {
    // Logic thêm thủ công (giữ nguyên của Bảo)
    const newTransaction: Transaction = {
      id: Date.now(),
      type: transactionData.type,
      category: transactionData.category,
      amount: parseFloat(transactionData.amount),
      date: transactionData.date,
      description: transactionData.description,
      account: transactionData.account,
      note: transactionData.note,
    };
    transactionStore.add(newTransaction);
    setShowAddTransaction(false);
    toast.success('Đã thêm giao dịch thành công!');
  };

  // ... (handleEdit và handleDelete giữ nguyên của Bảo) ...

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filterButtonClass = (active: boolean, type?: 'income' | 'expense') => {
    if (active && type === 'income') return '!bg-green-500 text-white shadow-md';
    if (active && type === 'expense') return '!bg-red-500 text-white shadow-md';
    if (active) return '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md';
    return '!bg-gray-100 text-gray-700 hover:!bg-gray-200';
  };

  return (
    <>
      <div
        className={`mx-auto max-w-7xl transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900 flex items-center gap-3">
              Giao dịch
              {isLoading && <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />}
            </h1>
            <p className="text-gray-600">Quản lý tất cả các giao dịch thu chi của bạn</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddTransaction(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
          >
            <Plus className="h-5 w-5" />
            Thêm giao dịch
          </button>
        </div>

        {/* Tổng kết thẻ Stats */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg border-l-4 border-l-green-500">
            <p className="mb-2 text-sm text-gray-600 font-bold uppercase tracking-wider">
              Tổng thu bộ lọc
            </p>
            <p className="text-2xl font-black text-green-600">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg border-l-4 border-l-red-500">
            <p className="mb-2 text-sm text-gray-600 font-bold uppercase tracking-wider">
              Tổng chi bộ lọc
            </p>
            <p className="text-2xl font-black text-red-600">{formatCurrency(totalExpense)}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg border-l-4 border-l-orange-500">
            <p className="mb-2 text-sm text-gray-600 font-bold uppercase tracking-wider">
              Số dư ròng
            </p>
            <p
              className={`text-2xl font-black ${
                totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>

        {/* Bộ lọc và Tìm kiếm */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mô tả hoặc danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`rounded-xl px-6 py-3 font-bold transition ${filterButtonClass(
                  filterType === 'all',
                )}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterType('income')}
                className={`rounded-xl px-6 py-3 font-bold transition ${filterButtonClass(
                  filterType === 'income',
                  'income',
                )}`}
              >
                Thu
              </button>
              <button
                type="button"
                onClick={() => setFilterType('expense')}
                className={`rounded-xl px-6 py-3 font-bold transition ${filterButtonClass(
                  filterType === 'expense',
                  'expense',
                )}`}
              >
                Chi
              </button>
            </div>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-4 text-gray-500 italic">Không tìm thấy giao dịch nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr className="text-gray-500 font-bold">
                    <th className="px-6 py-4 text-left text-xs uppercase">Ngày</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Danh mục</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Mô tả</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Tài khoản</th>
                    <th className="px-6 py-4 text-right text-xs uppercase">Số tiền</th>
                    <th className="px-6 py-4 text-center text-xs uppercase">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="transition hover:bg-orange-50/30">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 font-medium">
                        {transaction.date}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                          </div>
                          <span className="text-sm font-bold text-gray-700 uppercase">
                            {transaction.category}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {transaction.description}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {transaction.account}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span
                          className={`text-[15px] font-black ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTransaction(transaction)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTransaction(transaction)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onSubmit={handleAddTransaction}
        />
      )}

      {/* {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleEditTransaction}
        />
      )}

      {deletingTransaction && (
        <DeleteTransactionModal
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirm={handleDeleteTransaction}
        />
      )} */}
    </>
  );
}
