import React, { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  User,
  Tag,
  AlertTriangle,
  Target,
  Flame,
  Loader2,
  Brain,
  Calendar,
  Receipt,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Star,
} from 'lucide-react';
import { analyticsApi, type DashboardCache } from '../api/analytics.api';
import { accountApi } from '../api/account.api';
import { formatDateTime } from '../utils/format';

type CategoryBreakdown = {
  category_id: string;
  category_name: string;
  amount: number;
};

type WeeklyTrend = { week: number; income: number; expense: number };
type DailyCashflow = { day: number; income: number; expense: number };

type TopExpense = {
  trans_id: string;
  description: string | null;
  amount: number;
  category_id: string;
};

type MonthlyReport = {
  _id: string;
  year: number;
  month: number;
  summary: {
    total_income: number;
    total_expense: number;
    savings: number;
    savings_rate: number;
    transaction_count: number;
  };
  income_by_category?: CategoryBreakdown[];
  expense_by_category: CategoryBreakdown[];
  weekly_trend: WeeklyTrend[];
  daily_cashflow?: DailyCashflow[];
  top_expenses?: TopExpense[];
  comparison?: Record<string, unknown>;
  ai_report?: { generated?: boolean; content?: string | null };
  status?: 'generated' | 'pending' | 'failed';
  generated_at?: string | null;
  updated_at?: string | null;
};

type UserAnalyticsTopCategory = {
  category_id: string;
  category_name: string;
  total_amount: number;
};

type UserAnalyticsGoal = {
  goal_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: 'in_progress' | 'completed' | 'exceeded' | 'failed';
  note?: string | null;
};

type BudgetAlertItem = {
  category_id: string;
  category_name: string;
  budget_limit: number;
  current_spent: number;
  percent_used: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
  alerted_at?: string | null;
};

type UserAnalyticsData = {
  user_id?: string;
  display_name?: string;
  account_id?: string[];
  total_income?: number;
  total_expense?: number;
  current_balance?: number;
  current_month?: {
    year?: number;
    month?: number;
    income?: number;
    expense?: number;
    savings?: number;
    savings_rate?: number;
  };
  top_categories?: UserAnalyticsTopCategory[];
  ai_insights?: {
    generated?: boolean;
    content?: string | null;
    generated_at?: string | null;
  };
  budget_alert?: {
    enabled?: boolean;
    alerts?: BudgetAlertItem[];
    last_checked?: string | null;
  };
  goal_tracking?: { goals?: UserAnalyticsGoal[] };
  streak?: { saving_months?: number; unit?: string };
};

type DailyBreakdown = {
  day: number;
  amount: number;
  trans_id?: string[];
};

type CategorySummaryItem = {
  _id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  category_name: string;
  category_type: string;
  year: number;
  month: number;
  total_amount: number;
  transaction_count: number;
  budget_limit?: number;
  is_over_budget?: boolean;
  daily_breakdown?: DailyBreakdown[];
  updated_at?: string | null;
};

const EXPENSE_COLORS = ['#f97316', '#ef4444', '#ec4899', '#f59e0b', '#fb7185', '#f43f5e'];

const INCOME_COLORS = ['#06b6d4', '#3b82f6', '#14b8a6', '#0ea5e9', '#10b981', '#22c55e'];

type TabId = 'monthly' | 'user_analytics' | 'category_summary' | 'account_overview';

type AccountInfo = {
  account_id: string;
  account_name: string;
  type: string;
  balance: number;
  currency?: string;
};

const ACCOUNT_TYPE_ICON: Record<string, string> = {
  cash: '💵',
  bank: '🏦',
  ewallet: '📱',
  credit: '💳',
  saving: '🏧',
};

const accountIconOf = (type: string) => ACCOUNT_TYPE_ICON[type?.toLowerCase()] ?? '💼';

export function Statistics() {
  const [activeTab, setActiveTab] = useState<TabId>('monthly');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [view, setView] = useState<'category' | 'trend'>('category');
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [userAnalytics, setUserAnalytics] = useState<UserAnalyticsData | null>(null);
  const [userAnalyticsLoading, setUserAnalyticsLoading] = useState(false);

  const [categorySummary, setCategorySummary] = useState<CategorySummaryItem[]>([]);
  const [categorySummaryLoading, setCategorySummaryLoading] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const [accountCaches, setAccountCaches] = useState<DashboardCache[]>([]);
  const [accountList, setAccountList] = useState<AccountInfo[]>([]);
  const [accountStatsLoading, setAccountStatsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // bắn socket
  useEffect(() => {
    const handleSync = () => {
      console.log('📊 Statistics: Đang làm mới báo cáo...');
      // Gọi lại các hàm load dữ liệu tùy theo tab đang mở
      if (activeTab === 'monthly')
        analyticsApi.getMonthlyReports().then((res) => setReports(res.data?.data || []));
      if (activeTab === 'user_analytics')
        analyticsApi.getUserAnalytics().then((res) => setUserAnalytics(res.data?.data || null));
      if (activeTab === 'category_summary')
        analyticsApi.getCategorySummary().then((res) => setCategorySummary(res.data?.data || []));
    };

    window.addEventListener('money-guard-sync', handleSync);
    return () => window.removeEventListener('money-guard-sync', handleSync);
  }, [activeTab]); // Lắng nghe theo tab để refresh đúng chỗ

  //
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getMonthlyReports();
        setReports(res.data?.data || []);
      } catch (error) {
        console.error('Get monthly reports failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (activeTab === 'user_analytics' && !userAnalytics) {
      setUserAnalyticsLoading(true);
      analyticsApi
        .getUserAnalytics()
        .then((res) => setUserAnalytics(res.data?.data || null))
        .catch((err) => console.error('Get user analytics failed:', err))
        .finally(() => setUserAnalyticsLoading(false));
    }
  }, [activeTab, userAnalytics]);

  useEffect(() => {
    if (activeTab === 'category_summary' && categorySummary.length === 0) {
      setCategorySummaryLoading(true);
      analyticsApi
        .getCategorySummary()
        .then((res) => setCategorySummary(res.data?.data || []))
        .catch((err) => console.error('Get category summary failed:', err))
        .finally(() => setCategorySummaryLoading(false));
    }
  }, [activeTab, categorySummary.length]);

  useEffect(() => {
    if (activeTab !== 'account_overview' || accountCaches.length > 0) return;

    setAccountStatsLoading(true);
    Promise.all([
      analyticsApi.getDashboardCache().catch((err) => {
        console.warn('Get dashboard_cache failed:', err?.message);
        return { data: { data: [] } };
      }),
      accountApi.getAccounts().catch((err) => {
        console.warn('Get accounts failed:', err?.message);
        return { data: { data: [] } };
      }),
    ])
      .then(([cacheRes, accRes]) => {
        const cacheData = cacheRes?.data?.data;
        const caches: DashboardCache[] = Array.isArray(cacheData)
          ? cacheData
          : cacheData
          ? [cacheData]
          : [];
        setAccountCaches(caches);

        const accs = Array.isArray(accRes?.data?.data) ? accRes.data.data : [];
        setAccountList(accs);

        if (!selectedAccountId && caches.length > 0) {
          setSelectedAccountId(caches[0].account_id);
        }
      })
      .finally(() => setAccountStatsLoading(false));
  }, [activeTab, accountCaches.length, selectedAccountId]);

  const accountById = useMemo(() => {
    const map = new Map<string, AccountInfo>();
    accountList.forEach((a) => map.set(a.account_id, a));
    return map;
  }, [accountList]);

  const accountAggregate = useMemo(() => {
    return accountCaches.reduce(
      (acc, c) => {
        acc.balance += c.summary?.current_balance ?? 0;
        acc.income += c.summary?.monthly_income ?? 0;
        acc.expense += c.summary?.monthly_expense ?? 0;
        acc.savings += c.summary?.monthly_savings ?? 0;
        return acc;
      },
      { balance: 0, income: 0, expense: 0, savings: 0 },
    );
  }, [accountCaches]);

  const topSpendingAccountId = useMemo(() => {
    let best: { id: string; exp: number } | null = null;
    accountCaches.forEach((c) => {
      const exp = c.summary?.monthly_expense ?? 0;
      if (exp > 0 && (!best || exp > best.exp)) {
        best = { id: c.account_id, exp };
      }
    });
    return best?.id ?? null;
  }, [accountCaches]);

  const selectedCache = useMemo(
    () => accountCaches.find((c) => c.account_id === selectedAccountId) ?? accountCaches[0] ?? null,
    [accountCaches, selectedAccountId],
  );

  const selectedReports = useMemo(() => {
    const sorted = [...reports].sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month));
    if (period === 'month') return sorted.slice(0, 1);
    if (period === 'quarter') return sorted.slice(0, 3);
    return sorted.slice(0, 12);
  }, [reports, period]);

  const currentReport = selectedReports[0];

  const summaryData = useMemo(() => {
    return selectedReports.reduce(
      (acc, report) => ({
        totalIncome: acc.totalIncome + report.summary.total_income,
        totalExpense: acc.totalExpense + report.summary.total_expense,
        savings: acc.savings + report.summary.savings,
      }),
      { totalIncome: 0, totalExpense: 0, savings: 0 },
    );
  }, [selectedReports]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    selectedReports.forEach((report) => {
      report.expense_by_category?.forEach((item) => {
        map.set(item.category_name, (map.get(item.category_name) || 0) + item.amount);
      });
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [selectedReports]);

  const incomeCategoryData = useMemo(() => {
    const map = new Map<string, number>();
    selectedReports.forEach((report) => {
      report.income_by_category?.forEach((item) => {
        map.set(item.category_name, (map.get(item.category_name) || 0) + item.amount);
      });
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [selectedReports]);

  const displayData = chartType === 'expense' ? categoryData : incomeCategoryData;
  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeCategoryData.reduce((sum, item) => sum + item.value, 0);
  const totalDisplay = chartType === 'expense' ? totalExpense : totalIncome;

  const trendData = useMemo(() => {
    if (period === 'month' && currentReport) {
      return currentReport.weekly_trend.map((item) => ({
        month: `Tuần ${item.week}`,
        income: item.income,
        expense: item.expense,
      }));
    }
    return selectedReports
      .slice()
      .reverse()
      .map((report) => ({
        month: `T${report.month}/${report.year}`,
        income: report.summary.total_income,
        expense: report.summary.total_expense,
      }));
  }, [selectedReports, currentReport, period]);

  const avgIncome =
    trendData.length > 0
      ? trendData.reduce((sum, item) => sum + item.income, 0) / trendData.length
      : 0;
  const avgExpense =
    trendData.length > 0
      ? trendData.reduce((sum, item) => sum + item.expense, 0) / trendData.length
      : 0;
  const avgSaving = avgIncome - avgExpense;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const tabButtonClass = (active: boolean) =>
    `rounded-xl px-4 py-2 font-medium transition ${
      active
        ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 !text-white shadow-md'
        : '!bg-gray-100 !text-gray-700 hover:!bg-gray-200'
    }`;

  const latestCategorySummary = useMemo(() => {
    if (!categorySummary.length) return [];
    const maxPeriod = categorySummary.reduce((max, item) => {
      const val = item.year * 12 + item.month;
      return val > max ? val : max;
    }, 0);
    return categorySummary.filter((item) => item.year * 12 + item.month === maxPeriod);
  }, [categorySummary]);

  const expenseCategories = latestCategorySummary.filter(
    (c) => c.category_type === 'Expense' || c.category_type === 'expense',
  );
  const incomeCategories = latestCategorySummary.filter(
    (c) => c.category_type === 'Income' || c.category_type === 'income',
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-500">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-1 text-4xl font-bold text-gray-900">Thống kê</h1>
        <p className="text-gray-600">Phân tích chi tiêu và thu nhập của bạn</p>
      </div>

      {/* Main Tab Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`inline-flex items-center gap-2 ${tabButtonClass(activeTab === 'monthly')}`}
        >
          <BarChart3 className="h-4 w-4" />
          Báo cáo tháng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('user_analytics')}
          className={`inline-flex items-center gap-2 ${tabButtonClass(
            activeTab === 'user_analytics',
          )}`}
        >
          <User className="h-4 w-4" />
          Tổng quan cá nhân
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('category_summary')}
          className={`inline-flex items-center gap-2 ${tabButtonClass(
            activeTab === 'category_summary',
          )}`}
        >
          <Tag className="h-4 w-4" />
          Danh mục chi tiêu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account_overview')}
          className={`inline-flex items-center gap-2 ${tabButtonClass(
            activeTab === 'account_overview',
          )}`}
        >
          <Briefcase className="h-4 w-4" />
          Theo tài khoản
        </button>
      </div>

      {/* ====== TAB: Monthly Reports ====== */}
      {activeTab === 'monthly' && (
        <>
          {!currentReport ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              Chưa có dữ liệu thống kê.
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-green-500">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-700 font-medium">Tổng thu nhập</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summaryData.totalIncome)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-red-500">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700 font-medium">Tổng chi tiêu</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summaryData.totalExpense)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    <p className="text-sm text-blue-700 font-medium">Tiết kiệm</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summaryData.savings)}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Khoảng thời gian
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPeriod('month')}
                        className={tabButtonClass(period === 'month')}
                      >
                        Tháng gần nhất
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeriod('quarter')}
                        className={tabButtonClass(period === 'quarter')}
                      >
                        3 tháng gần nhất
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeriod('year')}
                        className={tabButtonClass(period === 'year')}
                      >
                        12 tháng gần nhất
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Xem theo</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setView('category')}
                        className={tabButtonClass(view === 'category')}
                      >
                        Theo danh mục
                      </button>
                      <button
                        type="button"
                        onClick={() => setView('trend')}
                        className={tabButtonClass(view === 'trend')}
                      >
                        Xu hướng
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {view === 'category' ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {chartType === 'expense' ? 'Phân bổ chi tiêu' : 'Phân bổ thu nhập'}
                      </h2>
                      <div className="flex rounded-xl bg-gray-100 p-1">
                        <button
                          type="button"
                          onClick={() => setChartType('expense')}
                          className={`rounded-lg px-3 py-1.5 text-sm transition ${
                            chartType === 'expense'
                              ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow'
                              : 'text-gray-600'
                          }`}
                        >
                          Chi tiêu
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartType('income')}
                          className={`rounded-lg px-3 py-1.5 text-sm transition ${
                            chartType === 'income'
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow'
                              : 'text-gray-600'
                          }`}
                        >
                          Thu nhập
                        </button>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={displayData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          dataKey="value"
                        >
                          {displayData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                chartType === 'expense'
                                  ? EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                  : INCOME_COLORS[index % INCOME_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          {chartType === 'expense' ? 'Tổng chi tiêu' : 'Tổng thu nhập'}
                        </span>
                        <span
                          className={`text-xl font-semibold ${
                            chartType === 'expense' ? 'text-red-600' : 'text-cyan-600'
                          }`}
                        >
                          {formatCurrency(totalDisplay)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                      {chartType === 'expense' ? 'Chi tiết chi tiêu' : 'Chi tiết thu nhập'}
                    </h2>
                    <div className="space-y-4">
                      {displayData.map((category, index) => {
                        const percentage =
                          totalDisplay > 0 ? (category.value / totalDisplay) * 100 : 0;
                        return (
                          <div key={category.name}>
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {index < 3 && (
                                  <span className="text-sm">{['🥇', '🥈', '🥉'][index]}</span>
                                )}
                                <span className="text-sm font-medium text-gray-800">
                                  {category.name}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {formatCurrency(category.value)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor:
                                      chartType === 'expense'
                                        ? EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                        : INCOME_COLORS[index % INCOME_COLORS.length],
                                  }}
                                />
                              </div>
                              <span className="w-12 text-right text-xs text-gray-600">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">Xu hướng thu chi</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis
                        stroke="#6b7280"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                      <Legend />
                      <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                      <p className="mb-1 text-sm font-medium text-green-700">Thu nhập trung bình</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {formatCurrency(avgIncome)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                      <p className="mb-1 text-sm font-medium text-red-700">Chi tiêu trung bình</p>
                      <p className="text-2xl font-semibold text-red-600">
                        {formatCurrency(avgExpense)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="mb-1 text-sm font-medium text-blue-700">Tiết kiệm trung bình</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {formatCurrency(avgSaving)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Cashflow Chart (only when viewing single month) */}
              {period === 'month' &&
                currentReport?.daily_cashflow &&
                currentReport.daily_cashflow.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Dòng tiền theo ngày — Tháng {currentReport.month}/{currentReport.year}
                      </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={currentReport.daily_cashflow}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#6b7280" />
                        <YAxis
                          stroke="#6b7280"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value ?? 0))}
                          labelFormatter={(label) => `Ngày ${label}`}
                        />
                        <Legend />
                        <Bar
                          dataKey="income"
                          name="Thu nhập"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="expense"
                          name="Chi tiêu"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              {/* Top Expenses */}
              {currentReport?.top_expenses && currentReport.top_expenses.length > 0 && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-rose-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Chi tiêu lớn nhất trong tháng
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {currentReport.top_expenses.map((tx, idx) => (
                      <div
                        key={tx.trans_id}
                        className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-sm font-bold text-rose-600">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {tx.description || '(Không có mô tả)'}
                            </p>
                            <p className="text-xs text-gray-500">Mã: {tx.trans_id.slice(0, 8)}…</p>
                          </div>
                        </div>
                        <span className="text-base font-bold text-rose-600">
                          -{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison vs previous month */}
              {currentReport?.comparison && Object.keys(currentReport.comparison).length > 0 && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-gray-900">So sánh với tháng trước</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(currentReport.comparison).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {typeof value === 'number'
                            ? value.toLocaleString('vi-VN')
                            : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Report */}
              {currentReport?.ai_report?.content && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Báo cáo AI tháng {currentReport.month}/{currentReport.year}
                      </h2>
                    </div>
                    {currentReport.status && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          currentReport.status === 'generated'
                            ? 'bg-green-100 text-green-700'
                            : currentReport.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {currentReport.status === 'generated'
                          ? 'Đã tạo'
                          : currentReport.status === 'pending'
                          ? 'Đang chờ'
                          : 'Thất bại'}
                      </span>
                    )}
                  </div>
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <p className="whitespace-pre-line text-sm text-purple-900">
                      {currentReport.ai_report.content}
                    </p>
                  </div>
                  {currentReport.generated_at && (
                    <p className="mt-3 text-right text-xs text-gray-400">
                      Tạo lúc {new Date(currentReport.generated_at).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ====== TAB: User Analytics ====== */}
      {activeTab === 'user_analytics' && (
        <>
          {userAnalyticsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-gray-500">Đang tải phân tích cá nhân...</p>
              </div>
            </div>
          ) : !userAnalytics ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              Chưa có dữ liệu phân tích cá nhân.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display Name */}
              {userAnalytics.display_name && (
                <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 p-5 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Xin chào</p>
                      <p className="text-xl font-bold text-white">{userAnalytics.display_name}</p>
                      {userAnalytics.account_id && userAnalytics.account_id.length > 0 && (
                        <p className="text-xs text-white/70 mt-0.5">
                          {userAnalytics.account_id.length} tài khoản đang theo dõi
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Overview Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-green-500">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium text-green-700">Tổng thu nhập</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(userAnalytics.total_income || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-red-500">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-red-700">Tổng chi tiêu</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(userAnalytics.total_expense || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    <p className="text-sm font-medium text-blue-700">Số dư hiện tại</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(userAnalytics.current_balance || 0)}
                  </p>
                </div>
              </div>

              {/* Current Month + Streak */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {userAnalytics.current_month && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Tháng hiện tại</h2>
                      {userAnalytics.current_month.year && userAnalytics.current_month.month && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {userAnalytics.current_month.month}/{userAnalytics.current_month.year}
                        </span>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                        <span className="text-sm font-medium text-green-700">Thu nhập</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(userAnalytics.current_month.income || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                        <span className="text-sm font-medium text-red-700">Chi tiêu</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(userAnalytics.current_month.expense || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                        <span className="text-sm font-medium text-blue-700">Tiết kiệm</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(userAnalytics.current_month.savings || 0)}
                        </span>
                      </div>
                      {typeof userAnalytics.current_month.savings_rate === 'number' && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Tỷ lệ tiết kiệm
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {userAnalytics.current_month.savings_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                              style={{
                                width: `${Math.min(
                                  Math.max(userAnalytics.current_month.savings_rate, 0),
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Streak */}
                  {userAnalytics.streak && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Chuỗi tháng tiết kiệm
                        </h2>
                      </div>
                      <div className="flex items-end gap-3">
                        <p className="text-5xl font-bold text-orange-500 leading-none">
                          {userAnalytics.streak.saving_months || 0}
                        </p>
                        <p className="pb-2 text-sm text-gray-500">
                          {userAnalytics.streak.unit || 'tháng'} liên tiếp dương
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Budget Alert (real schema: alerts[]) */}
                  {userAnalytics.budget_alert?.alerts &&
                    userAnalytics.budget_alert.alerts.length > 0 && (
                      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h2 className="text-lg font-semibold text-gray-900">
                              Cảnh báo ngân sách
                            </h2>
                          </div>
                          {userAnalytics.budget_alert.last_checked && (
                            <span className="text-xs text-gray-400">
                              {new Date(userAnalytics.budget_alert.last_checked).toLocaleDateString(
                                'vi-VN',
                              )}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {userAnalytics.budget_alert.alerts.slice(0, 4).map((alert) => {
                            const styleByStatus: Record<
                              BudgetAlertItem['status'],
                              { bg: string; text: string; bar: string; label: string }
                            > = {
                              ok: {
                                bg: 'bg-green-50 border-green-100',
                                text: 'text-green-700',
                                bar: 'bg-green-400',
                                label: 'An toàn',
                              },
                              warning: {
                                bg: 'bg-amber-50 border-amber-100',
                                text: 'text-amber-700',
                                bar: 'bg-amber-400',
                                label: 'Cảnh báo',
                              },
                              critical: {
                                bg: 'bg-orange-50 border-orange-100',
                                text: 'text-orange-700',
                                bar: 'bg-orange-500',
                                label: 'Sắp vượt',
                              },
                              exceeded: {
                                bg: 'bg-red-50 border-red-100',
                                text: 'text-red-700',
                                bar: 'bg-red-500',
                                label: 'Đã vượt',
                              },
                            };
                            const s = styleByStatus[alert.status];
                            return (
                              <div
                                key={alert.category_id}
                                className={`rounded-xl border p-3 ${s.bg}`}
                              >
                                <div className="mb-1.5 flex items-center justify-between">
                                  <span className={`text-sm font-medium ${s.text}`}>
                                    {alert.category_name}
                                  </span>
                                  <span
                                    className={`rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase ${s.text}`}
                                  >
                                    {s.label}
                                  </span>
                                </div>
                                <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
                                  <span>
                                    {formatCurrency(alert.current_spent)} /{' '}
                                    {formatCurrency(alert.budget_limit)}
                                  </span>
                                  <span className="font-semibold">
                                    {alert.percent_used.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/60">
                                  <div
                                    className={`h-full rounded-full ${s.bar}`}
                                    style={{
                                      width: `${Math.min(alert.percent_used, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Top Categories */}
              {userAnalytics.top_categories && userAnalytics.top_categories.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Danh mục chi tiêu nhiều nhất
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {userAnalytics.top_categories.map((cat, idx) => (
                      <div
                        key={cat.category_id || cat.category_name}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                            style={{
                              backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                            }}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {cat.category_name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(cat.total_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insights (real schema: { generated, content, generated_at }) */}
              {userAnalytics.ai_insights?.content && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h2 className="text-lg font-semibold text-gray-900">Phân tích từ AI</h2>
                    </div>
                    {userAnalytics.ai_insights.generated_at && (
                      <span className="text-xs text-gray-400">
                        Tạo lúc{' '}
                        {new Date(userAnalytics.ai_insights.generated_at).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <p className="whitespace-pre-line text-sm text-purple-900">
                      {userAnalytics.ai_insights.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Goal Tracking (real schema: goal_tracking.goals[]) */}
              {userAnalytics.goal_tracking?.goals &&
                userAnalytics.goal_tracking.goals.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-orange-500" />
                      <h2 className="text-lg font-semibold text-gray-900">Mục tiêu tài chính</h2>
                    </div>
                    <div className="space-y-5">
                      {userAnalytics.goal_tracking.goals.map((goal) => {
                        const progress =
                          goal.target_amount > 0
                            ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                            : 0;
                        const statusBadge: Record<
                          UserAnalyticsGoal['status'],
                          { color: string; label: string; icon: React.ReactNode }
                        > = {
                          in_progress: {
                            color: 'bg-blue-100 text-blue-700',
                            label: 'Đang thực hiện',
                            icon: <Target className="h-3 w-3" />,
                          },
                          completed: {
                            color: 'bg-green-100 text-green-700',
                            label: 'Hoàn thành',
                            icon: <CheckCircle2 className="h-3 w-3" />,
                          },
                          exceeded: {
                            color: 'bg-emerald-100 text-emerald-700',
                            label: 'Vượt mục tiêu',
                            icon: <TrendingUp className="h-3 w-3" />,
                          },
                          failed: {
                            color: 'bg-red-100 text-red-700',
                            label: 'Thất bại',
                            icon: <AlertTriangle className="h-3 w-3" />,
                          },
                        };
                        const badge = statusBadge[goal.status];
                        return (
                          <div key={goal.goal_id}>
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{goal.title}</p>
                                {goal.deadline && (
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    Hạn: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.color}`}
                              >
                                {badge.icon}
                                {badge.label}
                              </span>
                            </div>
                            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {formatCurrency(goal.current_amount)} /{' '}
                                {formatCurrency(goal.target_amount)}
                              </span>
                              <span className="font-semibold text-gray-700">
                                {progress.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            {goal.note && (
                              <p className="mt-2 text-xs italic text-gray-500">“{goal.note}”</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </>
      )}

      {/* ====== TAB: Category Summary ====== */}
      {activeTab === 'category_summary' && (
        <>
          {categorySummaryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-gray-500">Đang tải tổng hợp danh mục...</p>
              </div>
            </div>
          ) : latestCategorySummary.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              Chưa có dữ liệu tổng hợp danh mục.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Period Info */}
              {latestCategorySummary[0] && (
                <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 p-5 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Kỳ thống kê</p>
                      <p className="text-xl font-bold text-white">
                        Tháng {latestCategorySummary[0].month}/{latestCategorySummary[0].year}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Categories */}
              {expenseCategories.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Danh mục chi tiêu
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600">
                            Danh mục
                          </th>
                          <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-gray-600">
                            Số tiền
                          </th>
                          <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600">
                            Giao dịch
                          </th>
                          <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-gray-600">
                            Ngân sách
                          </th>
                          <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {expenseCategories.map((cat) => {
                          const isOpen = expandedCategoryId === cat._id;
                          const hasBreakdown =
                            cat.daily_breakdown && cat.daily_breakdown.length > 0;
                          return (
                            <React.Fragment key={cat._id}>
                              <tr
                                className={`transition ${
                                  hasBreakdown
                                    ? 'cursor-pointer hover:bg-gray-50'
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() =>
                                  hasBreakdown && setExpandedCategoryId(isOpen ? null : cat._id)
                                }
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {hasBreakdown && (
                                      <span className="text-gray-400">
                                        {isOpen ? (
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        ) : (
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                      </span>
                                    )}
                                    <span className="text-sm font-medium text-gray-800">
                                      {cat.category_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-semibold text-red-600">
                                    {formatCurrency(cat.total_amount)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                    {cat.transaction_count}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                  {cat.budget_limit ? formatCurrency(cat.budget_limit) : '—'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {cat.is_over_budget ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                      <AlertTriangle className="h-3 w-3" />
                                      Vượt
                                    </span>
                                  ) : cat.budget_limit ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                      Trong hạn
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </td>
                              </tr>
                              {isOpen && hasBreakdown && (
                                <tr className="bg-gray-50">
                                  <td colSpan={5} className="px-4 py-4">
                                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                      <Calendar className="h-3.5 w-3.5" />
                                      Phân bổ theo ngày
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10">
                                      {cat
                                        .daily_breakdown!.slice()
                                        .sort((a, b) => a.day - b.day)
                                        .map((d) => (
                                          <div
                                            key={d.day}
                                            className="rounded-lg border border-gray-200 bg-white p-2 text-center"
                                            title={`${d.trans_id?.length || 0} giao dịch ngày ${
                                              d.day
                                            }`}
                                          >
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                              Ngày {d.day}
                                            </p>
                                            <p className="mt-0.5 text-xs font-semibold text-gray-800">
                                              {formatCurrency(d.amount)}
                                            </p>
                                            {d.trans_id && d.trans_id.length > 0 && (
                                              <p className="text-[10px] text-gray-400">
                                                {d.trans_id.length} GD
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Income Categories */}
              {incomeCategories.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Danh mục thu nhập
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600">
                            Danh mục
                          </th>
                          <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-gray-600">
                            Số tiền
                          </th>
                          <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-gray-600">
                            Giao dịch
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {incomeCategories.map((cat) => (
                          <tr key={cat._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-800">
                                {cat.category_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(cat.total_amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                {cat.transaction_count}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Category Pie Chart */}
              {expenseCategories.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Biểu đồ phân bổ chi tiêu
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategories.map((c) => ({
                          name: c.category_name,
                          value: c.total_amount,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        dataKey="value"
                      >
                        {expenseCategories.map((_, index) => (
                          <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ====== TAB: Account Overview (per-account dashboard_cache) ====== */}
      {activeTab === 'account_overview' && (
        <>
          {accountStatsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-gray-500">Đang tải thống kê theo tài khoản...</p>
              </div>
            </div>
          ) : accountCaches.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              Chưa có dữ liệu thống kê theo tài khoản.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Aggregate summary across all accounts */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    <p className="text-sm font-medium text-blue-700">Tổng số dư</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(accountAggregate.balance)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{accountCaches.length} tài khoản</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-green-500">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium text-green-700">Thu tháng</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(accountAggregate.income)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-red-500">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-red-700">Chi tháng</p>
                  </div>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(accountAggregate.expense)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg border-t-4 border-t-cyan-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="h-5 w-5 text-cyan-500" />
                    <p className="text-sm font-medium text-cyan-700">Tiết kiệm tháng</p>
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      accountAggregate.savings >= 0 ? 'text-cyan-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(accountAggregate.savings)}
                  </p>
                </div>
              </div>

              {/* Per-account cards (clickable to select) */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  So sánh các tài khoản
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {accountCaches.map((cache) => {
                    const info = accountById.get(cache.account_id);
                    const isTop = cache.account_id === topSpendingAccountId;
                    const isActive = cache.account_id === selectedCache?.account_id;
                    const expRatio =
                      accountAggregate.expense > 0
                        ? (cache.summary?.monthly_expense ?? 0) / accountAggregate.expense
                        : 0;
                    return (
                      <button
                        type="button"
                        key={cache.account_id}
                        onClick={() => setSelectedAccountId(cache.account_id)}
                        className={`relative text-left rounded-2xl border p-4 transition ${
                          isActive
                            ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-rose-50 shadow-md'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {isTop && (
                          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                            <Star className="h-3 w-3" />
                            Chi nhiều nhất
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{accountIconOf(info?.type ?? '')}</span>
                          <span className="font-bold text-gray-800 truncate">
                            {info?.account_name ?? cache.account_id.slice(0, 8) + '…'}
                          </span>
                        </div>
                        <p className="text-lg font-black text-slate-900 mb-2">
                          {formatCurrency(cache.summary?.current_balance ?? 0)}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Thu tháng</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(cache.summary?.monthly_income ?? 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Chi tháng</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(cache.summary?.monthly_expense ?? 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Tỷ lệ chi</span>
                            <span className="font-semibold text-gray-700">
                              {(expRatio * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                            style={{ width: `${Math.min(expRatio * 100, 100)}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail panel for selected account */}
              {selectedCache && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {accountIconOf(accountById.get(selectedCache.account_id)?.type ?? '')}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {accountById.get(selectedCache.account_id)?.account_name ??
                            `Tài khoản ${selectedCache.account_id.slice(0, 8)}…`}
                        </h2>
                        <p className="text-xs text-gray-500">Chi tiết thống kê theo tài khoản</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Số dư hiện tại</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(selectedCache.summary?.current_balance ?? 0)}
                      </p>
                    </div>
                  </div>

                  {/* Stat row */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="text-xs font-medium text-green-700">Thu tháng</p>
                      <p className="mt-1 text-base font-bold text-green-600">
                        {formatCurrency(selectedCache.summary?.monthly_income ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-700">Chi tháng</p>
                      <p className="mt-1 text-base font-bold text-red-600">
                        {formatCurrency(selectedCache.summary?.monthly_expense ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-700">Tiết kiệm</p>
                      <p
                        className={`mt-1 text-base font-bold ${
                          (selectedCache.summary?.monthly_savings ?? 0) >= 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(selectedCache.summary?.monthly_savings ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-orange-50 p-3">
                      <p className="text-xs font-medium text-orange-700">Tỷ lệ tiết kiệm</p>
                      <p className="mt-1 text-base font-bold text-orange-600">
                        {(selectedCache.summary?.savings_rate ?? 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Streak */}
                  {selectedCache.streak && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-3">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-orange-600">
                          {selectedCache.streak.saving_months ?? 0}
                        </span>{' '}
                        {selectedCache.streak.unit ?? 'tháng'} tiết kiệm dương liên tiếp
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top categories of this account */}
                    <div>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
                        Top danh mục chi tiêu
                      </h3>
                      {selectedCache.top_categories?.length ? (
                        <div className="space-y-2">
                          {selectedCache.top_categories.map((cat, idx) => {
                            const total = selectedCache.top_categories.reduce(
                              (s, c) => s + (c.total_amount ?? 0),
                              0,
                            );
                            const pct = total > 0 ? (cat.total_amount / total) * 100 : 0;
                            return (
                              <div key={cat.category_id || cat.category_name}>
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                                      style={{
                                        backgroundColor:
                                          EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                                      }}
                                    >
                                      {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                      {cat.category_name}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-rose-600">
                                    {formatCurrency(cat.total_amount)}
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Chưa có dữ liệu danh mục.</p>
                      )}
                    </div>

                    {/* Recent transactions of this account */}
                    <div>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
                        Giao dịch gần nhất
                      </h3>
                      {selectedCache.recent_transactions?.length ? (
                        <div className="space-y-2">
                          {selectedCache.recent_transactions
                            .slice()
                            .sort((a, b) => (a.date < b.date ? 1 : -1))
                            .slice(0, 6)
                            .map((t) => (
                              <div
                                key={t.trans_id}
                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                      t.type === 'expense'
                                        ? 'bg-red-100 text-red-500'
                                        : 'bg-green-100 text-green-500'
                                    }`}
                                  >
                                    {t.type === 'expense' ? (
                                      <ArrowUpRight className="h-4 w-4" />
                                    ) : (
                                      <ArrowDownRight className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 line-clamp-1">
                                      {t.description || '(Không có mô tả)'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatDateTime(t.date)}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`text-sm font-bold ${
                                    t.type === 'expense' ? 'text-red-600' : 'text-green-600'
                                  }`}
                                >
                                  {t.type === 'expense' ? '-' : '+'}
                                  {formatCurrency(t.amount)}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Chưa có giao dịch nào.</p>
                      )}
                    </div>
                  </div>

                  {/* Chart: spending share by account (this account's slice) */}
                  {selectedCache.top_categories?.length ? (
                    <div className="mt-6">
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
                        Biểu đồ phân bổ chi tiêu
                      </h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={selectedCache.top_categories.map((c) => ({
                              name: c.category_name,
                              value: c.total_amount,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            outerRadius={90}
                            dataKey="value"
                          >
                            {selectedCache.top_categories.map((_, index) => (
                              <Cell
                                key={index}
                                fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Cross-account expense comparison bar chart */}
              {accountCaches.length > 1 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    So sánh thu chi giữa các tài khoản (tháng hiện tại)
                  </h2>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={accountCaches.map((c) => ({
                        name:
                          accountById.get(c.account_id)?.account_name ?? c.account_id.slice(0, 8),
                        income: c.summary?.monthly_income ?? 0,
                        expense: c.summary?.monthly_expense ?? 0,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis
                        stroke="#6b7280"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                      <Legend />
                      <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
