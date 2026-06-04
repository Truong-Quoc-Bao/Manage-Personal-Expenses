import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Flame,
  PiggyBank,
  RefreshCw,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatMoney } from '../utils/format';
import { statsApi } from '../api/ai.api';
import { analyticsApi, type UserAnalytics } from '../api/analytics.api';
import { accountApi } from '../api/account.api';

type RealAccount = {
  account_id: string;
  account_name: string;
  balance: number;
  type: string;
  currency?: string;
};

type FallbackTransaction = {
  id: number | string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  account?: string;
};

const ACCOUNT_TYPE_ICON: Record<string, string> = {
  cash: '💵',
  bank: '🏦',
  ewallet: '📱',
  credit: '💳',
  saving: '🏧',
};

const accountIconOf = (type: string) => ACCOUNT_TYPE_ICON[type?.toLowerCase()] ?? '💼';

export function Dashboard() {
  const [accounts, setAccounts] = useState<RealAccount[]>([]);
  const [fallbackTxs, setFallbackTxs] = useState<FallbackTransaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Dashboard đang đồng bộ dữ liệu user_analytics...');

      const [resStats, resAll, resUA, resAccounts] = await Promise.all([
        statsApi.getStats().catch((err) => {
          console.warn('Stats API lỗi:', err?.message);
          return { data: null };
        }),
        statsApi.getAllTransactions().catch((err) => {
          console.warn('All transactions API lỗi:', err?.message);
          return { data: [] };
        }),
        analyticsApi.getUserAnalytics().catch((err) => {
          console.warn('user_analytics không khả dụng:', err?.message);
          return { data: { data: null } };
        }),
        accountApi.getAccounts().catch((err) => {
          console.warn('Get accounts lỗi:', err?.message);
          return { data: { data: [] } };
        }),
      ]);

      const ua: UserAnalytics | null = resUA?.data?.data ?? null;
      setUserAnalytics(ua);

      if (resStats?.data) setStats(resStats.data);

      const allTx: any[] = Array.isArray(resAll?.data) ? resAll.data : [];
      setFallbackTxs(
        allTx.map((t: any) => ({
          id: t.trans_id || t.id || Math.random(),
          type: t.type,
          category: t.category_name || 'Khác',
          amount: Math.abs(parseFloat(t.amount)),
          description: t.description || 'Không có mô tả',
          account: t.account_name || '',
          date: t.created_at || t.date,
        })),
      );

      const realAccounts: RealAccount[] = Array.isArray(resAccounts?.data?.data)
        ? resAccounts.data.data
        : [];
      setAccounts(realAccounts);

      console.log(
        `✅ Dashboard loaded: user_analytics ${ua ? 'OK' : 'EMPTY'}, ${
          realAccounts.length
        } account(s), ${allTx.length} transaction(s)`,
      );
    } catch (err) {
      console.error('Lỗi khi load dữ liệu Dashboard:', err);
      toast.error('Không thể tải dữ liệu Dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      console.log('📊 Dashboard: Nhận lệnh đồng bộ');

      // SỬA Ở ĐÂY: Đợi 500ms (0.5 giây) để Backend kịp tính toán xong số liệu mới
      setTimeout(() => {
        loadAllData();
      }, 500);

      toast.info('Dữ liệu tài chính đã được cập nhật!');
    };

    window.addEventListener('money-guard-sync', handleSync);
    window.addEventListener('dashboard_refresh', handleSync);
    return () => {
      window.removeEventListener('money-guard-sync', handleSync);
      window.removeEventListener('dashboard_refresh', handleSync);
    };
  }, [loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const hasUA = !!userAnalytics;

  const uaBalance = userAnalytics?.current_balance ?? 0;
  const uaMonthIncome = userAnalytics?.current_month?.income ?? 0;
  const uaMonthExpense = userAnalytics?.current_month?.expense ?? 0;
  const uaMonthSavings = userAnalytics?.current_month?.savings ?? 0;
  const uaSavingsRate = userAnalytics?.current_month?.savings_rate ?? 0;
  const uaStreakMonths = userAnalytics?.streak?.saving_months ?? 0;
  const uaStreakUnit = userAnalytics?.streak?.unit || 'tháng';
  const uaTopCategories = (userAnalytics?.top_categories ?? []).slice(0, 5);
  const uaBudgetAlerts = (userAnalytics?.budget_alert?.alerts ?? []).filter(
    (a) => a.status === 'warning' || a.status === 'critical' || a.status === 'exceeded',
  );
  const uaGoals = (userAnalytics?.goal_tracking?.goals ?? []).slice(0, 3);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyCount = fallbackTxs.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const fallbackTotalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const fallbackMonthlyIncome = fallbackTxs
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
      );
    })
    .reduce((s, t) => s + t.amount, 0);

  const fallbackMonthlyExpense = fallbackTxs
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
      );
    })
    .reduce((s, t) => s + t.amount, 0);

  const headerMonth = userAnalytics?.current_month?.month ?? stats?.month ?? now.getMonth() + 1;

  const displayIncome = fallbackMonthlyIncome || userAnalytics?.current_month?.income || 0;
  const displayExpense = fallbackMonthlyExpense || userAnalytics?.current_month?.expense || 0;
  const displayBalance =
    accounts.length > 0 ? fallbackTotalBalance : userAnalytics?.current_balance || 0;

  return (
    <main
      className={`min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-rose-50 px-8 py-8 transition-opacity ${
        isLoading ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div className="mx-auto max-w-7xl">
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
              {userAnalytics?.display_name
                ? `Xin chào, ${userAnalytics.display_name}! `
                : 'Xin chào! '}
              {hasUA
                ? `Tháng ${headerMonth} này bạn đã chi ${formatCurrency(displayExpense)}`
                : stats
                ? `Tháng ${stats.month} này bạn đã chi ${formatCurrency(stats.expense)}`
                : 'Đây là tổng quan tài chính của bạn.'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-7 md:grid-cols-3">
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
              {formatCurrency(
                hasUA ? uaBalance : stats ? stats.income - stats.expense : fallbackTotalBalance,
              )}
            </p>
            <p className="text-base text-gray-500 italic">
              {hasUA
                ? userAnalytics?.account_id?.length
                  ? `Tổng hợp ${userAnalytics.account_id.length} tài khoản`
                  : 'Tổng hợp toàn bộ tài khoản'
                : 'Cập nhật thời gian thực'}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-transform hover:scale-[1.02]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Thu nhập tháng {headerMonth}
              </span>
            </div>
            <p className="mb-2 text-4xl font-bold text-green-600">
              {formatCurrency(hasUA ? uaMonthIncome : stats ? stats.income : fallbackMonthlyIncome)}
            </p>
            <div className="flex items-center gap-1 text-base font-medium text-green-600">
              <ArrowUpRight className="h-5 w-5" />
              Dòng tiền dương
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-transform hover:scale-[1.02]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 shadow-rose-200 shadow-lg">
                <TrendingDown className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Chi tiêu tháng {headerMonth}
              </span>
            </div>
            <p className="mb-2 text-4xl font-bold text-red-600">
              {formatCurrency(
                hasUA ? uaMonthExpense : stats ? stats.expense : fallbackMonthlyExpense,
              )}
            </p>
            <div className="flex items-center gap-1 text-base font-medium text-red-600">
              <ArrowDownRight className="h-5 w-5" />
              Đã ghi sổ {monthlyCount} giao dịch
            </div>
          </div>
        </div>

        {hasUA && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-md">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tiết kiệm tháng
                </span>
              </div>
              <p
                className={`mb-1 text-3xl font-bold ${
                  uaMonthSavings >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(uaMonthSavings)}
              </p>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Tỷ lệ tiết kiệm</span>
                  <span className="font-semibold text-gray-700">{uaSavingsRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    style={{
                      width: `${Math.min(Math.max(uaSavingsRate, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-md">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Chuỗi tiết kiệm
                </span>
              </div>
              <p className="mb-1 text-3xl font-bold text-orange-500">{uaStreakMonths}</p>
              <p className="text-sm text-gray-500">{uaStreakUnit} dương liên tiếp</p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Top danh mục chi tiêu</h3>
              </div>
              {uaTopCategories.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có dữ liệu danh mục</p>
              ) : (
                <div className="space-y-2">
                  {uaTopCategories.map((cat, idx) => (
                    <div
                      key={cat.category_id || cat.category_name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-100 text-xs font-bold text-orange-600">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {cat.category_name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-rose-600">
                        {formatMoney(cat.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {hasUA && (uaBudgetAlerts.length > 0 || uaGoals.length > 0) && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {uaBudgetAlerts.length > 0 && (
              <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-bold text-gray-800">Cảnh báo ngân sách</h3>
                </div>
                <div className="space-y-3">
                  {uaBudgetAlerts.slice(0, 3).map((a) => (
                    <div
                      key={a.category_id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          {a.category_name}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            a.status === 'exceeded'
                              ? 'text-red-600'
                              : a.status === 'critical'
                              ? 'text-orange-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {a.percent_used.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${
                            a.status === 'exceeded'
                              ? 'bg-red-500'
                              : a.status === 'critical'
                              ? 'bg-orange-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(a.percent_used, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatMoney(a.current_spent)} / {formatMoney(a.budget_limit)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uaGoals.length > 0 && (
              <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  <h3 className="text-base font-bold text-gray-800">Mục tiêu tài chính</h3>
                </div>
                <div className="space-y-3">
                  {uaGoals.map((g) => {
                    const progress =
                      g.target_amount > 0
                        ? Math.min((g.current_amount / g.target_amount) * 100, 100)
                        : 0;
                    return (
                      <div key={g.goal_id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{g.title}</span>
                          <span className="text-xs font-bold text-gray-600">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatMoney(g.current_amount)} / {formatMoney(g.target_amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1e293b]">Giao dịch gần nhất</h2>
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
              {fallbackTxs.length > 0 ? (
                fallbackTxs.slice(0, 5).map((t) => (
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
                            {formatDateTime(t.date)}
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
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có giao dịch nào.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ví của bạn</h2>
            {accounts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Chưa có ví nào. Hãy thêm trong trang Tài khoản.
              </p>
            ) : (
              <div className="space-y-4">
                {accounts.map((acc) => (
                  <div
                    key={acc.account_id}
                    className="relative p-4 rounded-2xl border border-slate-100 bg-slate-50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{accountIconOf(acc.type)}</span>
                      <span className="font-bold text-gray-700">{acc.account_name}</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(Number(acc.balance || 0))}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-gray-400 italic">
                  Xem thống kê chi tiết theo từng tài khoản tại trang{' '}
                  <a href="/statistics" className="text-orange-500 font-semibold hover:underline">
                    Thống kê
                  </a>
                  .
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
