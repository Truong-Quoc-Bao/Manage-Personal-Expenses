import React, { useEffect, useMemo, useState } from "react";
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
} from "recharts";
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
} from "lucide-react";
import { analyticsApi } from "../api/analytics.api";

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
  expense_by_category: {
    category_id: string;
    category_name: string;
    amount: number;
  }[];
  income_by_category?: {
    category_id: string;
    category_name: string;
    amount: number;
  }[];
  weekly_trend: {
    week: number;
    income: number;
    expense: number;
  }[];
};

type UserAnalyticsData = {
  user_id?: string;
  display_name?: string;
  total_income?: number;
  total_expense?: number;
  current_balance?: number;
  current_month?: { income?: number; expense?: number; savings?: number };
  top_categories?: { category_name: string; amount: number; type: string }[];
  ai_insights?: string[];
  budget_alert?: { is_over_budget?: boolean; message?: string };
  goal_tracking?: { goal_name?: string; current?: number; target?: number }[];
  streak?: { current_streak?: number; longest_streak?: number; type?: string };
};

type CategorySummaryItem = {
  _id: string;
  category_id: string;
  category_name: string;
  category_type: string;
  year: number;
  month: number;
  total_amount: number;
  transaction_count: number;
  budget_limit?: number;
  is_over_budget?: boolean;
};

const EXPENSE_COLORS = [
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#f59e0b",
  "#fb7185",
  "#f43f5e",
];

const INCOME_COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#14b8a6",
  "#0ea5e9",
  "#10b981",
  "#22c55e",
];

type TabId = "monthly" | "user_analytics" | "category_summary";

export function Statistics() {
  const [activeTab, setActiveTab] = useState<TabId>("monthly");
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [view, setView] = useState<"category" | "trend">("category");
  const [chartType, setChartType] = useState<"expense" | "income">("expense");
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [userAnalytics, setUserAnalytics] = useState<UserAnalyticsData | null>(null);
  const [userAnalyticsLoading, setUserAnalyticsLoading] = useState(false);

  const [categorySummary, setCategorySummary] = useState<CategorySummaryItem[]>([]);
  const [categorySummaryLoading, setCategorySummaryLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getMonthlyReports();
        setReports(res.data?.data || []);
      } catch (error) {
        console.error("Get monthly reports failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (activeTab === "user_analytics" && !userAnalytics) {
      setUserAnalyticsLoading(true);
      analyticsApi
        .getUserAnalytics()
        .then((res) => setUserAnalytics(res.data?.data || null))
        .catch((err) => console.error("Get user analytics failed:", err))
        .finally(() => setUserAnalyticsLoading(false));
    }
  }, [activeTab, userAnalytics]);

  useEffect(() => {
    if (activeTab === "category_summary" && categorySummary.length === 0) {
      setCategorySummaryLoading(true);
      analyticsApi
        .getCategorySummary()
        .then((res) => setCategorySummary(res.data?.data || []))
        .catch((err) => console.error("Get category summary failed:", err))
        .finally(() => setCategorySummaryLoading(false));
    }
  }, [activeTab, categorySummary.length]);

  const selectedReports = useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => b.year * 12 + b.month - (a.year * 12 + a.month)
    );
    if (period === "month") return sorted.slice(0, 1);
    if (period === "quarter") return sorted.slice(0, 3);
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
      { totalIncome: 0, totalExpense: 0, savings: 0 }
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

  const displayData = chartType === "expense" ? categoryData : incomeCategoryData;
  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeCategoryData.reduce((sum, item) => sum + item.value, 0);
  const totalDisplay = chartType === "expense" ? totalExpense : totalIncome;

  const trendData = useMemo(() => {
    if (period === "month" && currentReport) {
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
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const tabButtonClass = (active: boolean) =>
    `rounded-xl px-4 py-2 font-medium transition ${
      active
        ? "!bg-gradient-to-r !from-orange-400 !to-rose-400 !text-white shadow-md"
        : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
    }`;

  const latestCategorySummary = useMemo(() => {
    if (!categorySummary.length) return [];
    const maxPeriod = categorySummary.reduce(
      (max, item) => {
        const val = item.year * 12 + item.month;
        return val > max ? val : max;
      },
      0
    );
    return categorySummary.filter(
      (item) => item.year * 12 + item.month === maxPeriod
    );
  }, [categorySummary]);

  const expenseCategories = latestCategorySummary.filter(
    (c) => c.category_type === "Expense" || c.category_type === "expense"
  );
  const incomeCategories = latestCategorySummary.filter(
    (c) => c.category_type === "Income" || c.category_type === "income"
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
          onClick={() => setActiveTab("monthly")}
          className={`inline-flex items-center gap-2 ${tabButtonClass(activeTab === "monthly")}`}
        >
          <BarChart3 className="h-4 w-4" />
          Báo cáo tháng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("user_analytics")}
          className={`inline-flex items-center gap-2 ${tabButtonClass(activeTab === "user_analytics")}`}
        >
          <User className="h-4 w-4" />
          Tổng quan cá nhân
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("category_summary")}
          className={`inline-flex items-center gap-2 ${tabButtonClass(activeTab === "category_summary")}`}
        >
          <Tag className="h-4 w-4" />
          Danh mục chi tiêu
        </button>
      </div>

      {/* ====== TAB: Monthly Reports ====== */}
      {activeTab === "monthly" && (
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
                      <button type="button" onClick={() => setPeriod("month")} className={tabButtonClass(period === "month")}>
                        Tháng gần nhất
                      </button>
                      <button type="button" onClick={() => setPeriod("quarter")} className={tabButtonClass(period === "quarter")}>
                        3 tháng gần nhất
                      </button>
                      <button type="button" onClick={() => setPeriod("year")} className={tabButtonClass(period === "year")}>
                        12 tháng gần nhất
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Xem theo</label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setView("category")} className={tabButtonClass(view === "category")}>
                        Theo danh mục
                      </button>
                      <button type="button" onClick={() => setView("trend")} className={tabButtonClass(view === "trend")}>
                        Xu hướng
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {view === "category" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {chartType === "expense" ? "Phân bổ chi tiêu" : "Phân bổ thu nhập"}
                      </h2>
                      <div className="flex rounded-xl bg-gray-100 p-1">
                        <button
                          type="button"
                          onClick={() => setChartType("expense")}
                          className={`rounded-lg px-3 py-1.5 text-sm transition ${
                            chartType === "expense"
                              ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow"
                              : "text-gray-600"
                          }`}
                        >
                          Chi tiêu
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartType("income")}
                          className={`rounded-lg px-3 py-1.5 text-sm transition ${
                            chartType === "income"
                              ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow"
                              : "text-gray-600"
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
                                chartType === "expense"
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
                          {chartType === "expense" ? "Tổng chi tiêu" : "Tổng thu nhập"}
                        </span>
                        <span
                          className={`text-xl font-semibold ${
                            chartType === "expense" ? "text-red-600" : "text-cyan-600"
                          }`}
                        >
                          {formatCurrency(totalDisplay)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                      {chartType === "expense" ? "Chi tiết chi tiêu" : "Chi tiết thu nhập"}
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
                                  <span className="text-sm">
                                    {["🥇", "🥈", "🥉"][index]}
                                  </span>
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
                                      chartType === "expense"
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
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Xu hướng thu chi
                  </h2>
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
            </>
          )}
        </>
      )}

      {/* ====== TAB: User Analytics ====== */}
      {activeTab === "user_analytics" && (
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
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Tháng hiện tại</h2>
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
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Streak */}
                  {userAnalytics.streak && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Chuỗi hoạt động</h2>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-orange-500">
                            {userAnalytics.streak.current_streak || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Hiện tại</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-gray-400">
                            {userAnalytics.streak.longest_streak || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Kỷ lục</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Budget Alert */}
                  {userAnalytics.budget_alert?.message && (
                    <div
                      className={`rounded-2xl p-6 shadow-lg border ${
                        userAnalytics.budget_alert.is_over_budget
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            userAnalytics.budget_alert.is_over_budget
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Cảnh báo ngân sách
                        </h2>
                      </div>
                      <p
                        className={`text-sm ${
                          userAnalytics.budget_alert.is_over_budget
                            ? "text-red-700"
                            : "text-green-700"
                        }`}
                      >
                        {userAnalytics.budget_alert.message}
                      </p>
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
                        key={cat.category_name}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                            style={{
                              backgroundColor:
                                EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                            }}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {cat.category_name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {userAnalytics.ai_insights && userAnalytics.ai_insights.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Phân tích từ AI
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {userAnalytics.ai_insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-purple-50 border border-purple-100 p-4"
                      >
                        <p className="text-sm text-purple-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal Tracking */}
              {userAnalytics.goal_tracking && userAnalytics.goal_tracking.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Mục tiêu tài chính</h2>
                  </div>
                  <div className="space-y-4">
                    {userAnalytics.goal_tracking.map((goal, idx) => {
                      const progress =
                        goal.target && goal.target > 0
                          ? Math.min(((goal.current || 0) / goal.target) * 100, 100)
                          : 0;
                      return (
                        <div key={idx}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">
                              {goal.goal_name || `Mục tiêu ${idx + 1}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(goal.current || 0)} / {formatCurrency(goal.target || 0)}
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-xs text-gray-500">
                            {progress.toFixed(1)}%
                          </p>
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
      {activeTab === "category_summary" && (
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
                        {expenseCategories.map((cat) => (
                          <tr key={cat._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-800">
                                {cat.category_name}
                              </span>
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
                              {cat.budget_limit
                                ? formatCurrency(cat.budget_limit)
                                : "—"}
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
                        ))}
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
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
