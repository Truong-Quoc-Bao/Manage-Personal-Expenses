import { useEffect, useState, useCallback } from 'react'; // Thêm useCallback
import React from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { transactionStore, accountStore } from '../store/mockData';
import { formatDateTime, formatMoney } from '../utils/format';
import { statsApi } from '../api/ai.api';

interface Transaction {
  id: number | string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  account: string;
  note?: string;
  created_at?: string;
}

export function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(transactionStore.getAll());
  const [accounts, setAccounts] = useState(accountStore.getAll());
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Dashboard đang đồng bộ tất cả nguồn dữ liệu...');

      // Gọi đồng thời cả 3 API để đạt tốc độ tối đa
      const [resStats, resAll, resRecents] = await Promise.all([
        statsApi.getStats(),
        statsApi.getAllTransactions(),
        statsApi.getRecentTransactions(),
      ]);

      // ✅ 1. Ưu tiên lấy Stats tổng quát từ server
      if (resStats.data) {
        setStats(resStats.data);
      }

      // ✅ 2. Cập nhật Transactions bằng mảng TOÀN BỘ (resAll)
      // Việc dùng resAll thay vì resRecents ở đây giúp biến transactions.length
      // ở dưới Card hiện đúng số tổng (ví dụ 50, 100) thay vì chỉ hiện 20.
      if (resAll.data && resAll.data.length > 0) {
        const allServerTransactions = resAll.data.map((t: any) => ({
          id: t.trans_id || t.id || Math.random(),
          type: t.type,
          category: t.category_name || 'Khác',
          amount: Math.abs(parseFloat(t.amount)),
          description: t.description || 'Không có mô tả',
          account: t.account_name || 'Ví chính',
          created_at: t.created_at,
          date: t.created_at,
        }));

        setTransactions(allServerTransactions);
      } else {
        setTransactions(transactionStore.getAll());
      }

      setAccounts(accountStore.getAll());

      // Note: resRecents có thể dùng để log hoặc kiểm tra nhanh nếu cần,
      // nhưng resAll đã bao gồm cả resRecents rồi nên ta ưu tiên resAll.
      console.log('✅ Đã tải', resAll.data.length, 'giao dịch.');
    } catch (err) {
      console.error('Lỗi khi load dữ liệu Dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ THEO DÕI STORE (Cho các giao dịch thêm thủ công bằng nút bấm)
  useEffect(() => {
    const unsubscribeTransactions = transactionStore.subscribe(setTransactions);
    const unsubscribeAccounts = accountStore.subscribe(setAccounts);
    return () => {
      unsubscribeTransactions();
      unsubscribeAccounts();
    };
  }, []);

  // ✅ "ĂNG-TEN" ĐÓN SÓNG TỪ AI CHAT
  useEffect(() => {
    const handleSync = () => {
      console.log('📊 Dashboard: Nhận lệnh đồng bộ từ AI (money-guard-sync)');
      loadAllData(); // Chạy hàm load lại toàn bộ dữ liệu
      toast.info('Dữ liệu tài chính đã được cập nhật!');
    };

    // Lắng nghe cả 2 loại sự kiện cho chắc ăn
    window.addEventListener('money-guard-sync', handleSync);
    window.addEventListener('dashboard_refresh', handleSync);

    return () => {
      window.removeEventListener('money-guard-sync', handleSync);
      window.removeEventListener('dashboard_refresh', handleSync);
    };
  }, [loadAllData]);

  // Load lần đầu khi mở trang
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- CÁC LOGIC TÍNH TOÁN (Giữ nguyên của Bảo) ---
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Logic này sẽ tự nhảy khi setTransactions được gọi trong loadAllData
  const monthlyIncome = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'income' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleAddTransaction = (transactionData: any) => {
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
    const account = accounts.find((acc) => acc.name === transactionData.account);
    if (account) {
      const balanceChange =
        transactionData.type === 'income' ? newTransaction.amount : -newTransaction.amount;
      accountStore.update(account.id, { balance: account.balance + balanceChange });
    }
    setShowAddTransaction(false);
    toast.success('Đã thêm giao dịch thành công!');
    // Sau khi thêm thủ công cũng nên refresh stats
    loadAllData();
  };

  // Lọc ra những giao dịch thuộc THÁNG NÀY
  const monthlyTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  // SỐ LƯỢNG giao dịch trong tháng này (Đây là con số bạn muốn hiện thay cho số 20)
  const monthlyCount = monthlyTransactions.length;

  return (
    <>
      <main
        className={`min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-rose-50 px-8 py-8 transition-opacity ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900 flex items-center gap-3">
                Dashboard
                {isLoading && (
                  <span className="text-sm font-normal text-orange-500 animate-pulse">
                    (Đang đồng bộ...)
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-600">
                Chào Bảo!{' '}
                {stats
                  ? `Tháng ${stats.month} này Bảo đã chi ${formatCurrency(stats.expense)}`
                  : 'Đây là tổng quan tài chính của bạn.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddTransaction(true)}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-orange-500 hover:to-rose-500 hover:shadow-xl active:scale-95"
            >
              <Plus className="h-6 w-6" />
              Thêm giao dịch
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-7 md:grid-cols-3">
            {/* Tổng số dư - Ưu tiên lấy từ Stats API nếu có, không thì dùng store */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-200 shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Tổng số dư
                </span>
              </div>
              <p className="mb-2 text-4xl font-bold text-gray-900">
                {formatCurrency(stats ? stats.income - stats.expense : totalBalance)}
              </p>
              <p className="text-base text-gray-500 italic">Cập nhật thời gian thực</p>
            </div>

            {/* Thu nhập */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thu nhập tháng {stats?.month || ''}
                </span>
              </div>
              <p className="mb-2 text-4xl font-bold text-green-600">
                {formatCurrency(stats ? stats.income : monthlyIncome)}
              </p>
              <div className="flex items-center gap-1 text-base font-medium text-green-600">
                <ArrowUpRight className="h-5 w-5" />
                Dòng tiền dương
              </div>
            </div>

            {/* Chi tiêu */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 shadow-rose-200 shadow-lg">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiêu tháng {stats?.month || ''}
                </span>
              </div>
              <p className="mb-2 text-4xl font-bold text-red-600">
                {formatCurrency(stats ? stats.expense : monthlyExpense)}
              </p>
              <div className="flex items-center gap-1 text-base font-medium text-red-600">
                <ArrowDownRight className="h-5 w-5" />
                Đã ghi sổ {monthlyCount} giao dịch
              </div>
            </div>
          </div>

          {/* ... Phần Transactions và Accounts bên dưới giữ nguyên ... */}
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
            {/* Coppy lại phần render cũ của Bảo vào đây */}
            <section className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1e293b]">Giao dịch gần nhất</h2>

                {/* 🔥 LINK LƯỚT LƯỚT (Sliding Underline Effect) */}
                <a
                  href="/transactions"
                  className="relative group text-sm font-bold text-gray-400 py-1 overflow-hidden"
                >
                  <span className="flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                    Xem tất cả <ChevronRight size={14} />
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 -translate-x-[110%] group-hover:translate-x-0 transition-transform duration-300"></span>
                </a>
              </div>

              <div className="space-y-6">
                {transactions.slice(0, 20).map((t) => (
                  <div key={t.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                          t.type === 'expense'
                            ? 'bg-red-50 text-red-400'
                            : 'bg-green-50 text-green-400'
                        }`}
                      >
                        {t.type === 'expense' ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownRight size={20} />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <p className="text-[15px] font-bold text-gray-800 leading-tight mb-1">
                          {t.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-500 uppercase">
                            {t.category}
                          </span>
                          <span className="text-xs text-gray-400 font-medium tracking-tight">
                            {formatDateTime(t.date)} {/* Sử dụng Utils của Bảo */}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-16px font-black ${
                          t.type === 'expense' ? 'text-[#e11d48]' : 'text-green-600'
                        }`}
                      >
                        {t.type === 'expense' ? '-' : '+'}
                        {formatMoney(t.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ví của Bảo</h2>
              <div className="space-y-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{acc.icon}</span>
                      <span className="font-bold text-gray-700">{acc.name}</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(acc.balance)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </>
  );
}
