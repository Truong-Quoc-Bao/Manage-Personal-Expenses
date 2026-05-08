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

export function Statistics() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const [view, setView] = useState<"category" | "trend">("category");

  const [chartType, setChartType] = useState<"expense" | "income">("expense");

  const [reports, setReports] = useState<MonthlyReport[]>([]);

  const [loading, setLoading] = useState(true);

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
      {
        totalIncome: 0,
        totalExpense: 0,
        savings: 0,
      }
    );
  }, [selectedReports]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();

    selectedReports.forEach((report) => {
      report.expense_by_category?.forEach((item) => {
        map.set(
          item.category_name,
          (map.get(item.category_name) || 0) + item.amount
        );
      });
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [selectedReports]);

  const incomeCategoryData = useMemo(() => {
    const map = new Map<string, number>();

    selectedReports.forEach((report) => {
      report.income_by_category?.forEach((item) => {
        map.set(
          item.category_name,
          (map.get(item.category_name) || 0) + item.amount
        );
      });
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [selectedReports]);

  const displayData =
    chartType === "expense" ? categoryData : incomeCategoryData;

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

  const totalIncome = incomeCategoryData.reduce(
    (sum, item) => sum + item.value,
    0
  );

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
      ? trendData.reduce((sum, item) => sum + item.expense, 0) /
        trendData.length
      : 0;

  const avgSaving = avgIncome - avgExpense;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const tabButtonClass = (active: boolean) =>
    `rounded-xl px-4 py-2 font-medium transition ${
      active
        ? "!bg-gradient-to-r !from-orange-400 !to-rose-400 !text-white shadow-md"
        : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải thống kê...
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Chưa có dữ liệu thống kê.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-1 text-4xl font-bold text-gray-900">Thống kê</h1>

        <p className="text-gray-600">Phân tích chi tiêu và thu nhập của bạn</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <p className="text-sm text-green-700">Tổng thu nhập</p>

          <p className="mt-1 text-2xl font-semibold text-green-600">
            {formatCurrency(summaryData.totalIncome)}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-700">Tổng chi tiêu</p>

          <p className="mt-1 text-2xl font-semibold text-red-600">
            {formatCurrency(summaryData.totalExpense)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm text-blue-700">Tiết kiệm</p>

          <p className="mt-1 text-2xl font-semibold text-blue-600">
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
                onClick={() => setPeriod("month")}
                className={tabButtonClass(period === "month")}
              >
                Tháng gần nhất
              </button>

              <button
                type="button"
                onClick={() => setPeriod("quarter")}
                className={tabButtonClass(period === "quarter")}
              >
                3 tháng gần nhất
              </button>

              <button
                type="button"
                onClick={() => setPeriod("year")}
                className={tabButtonClass(period === "year")}
              >
                12 tháng gần nhất
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Xem theo
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setView("category")}
                className={tabButtonClass(view === "category")}
              >
                Theo danh mục
              </button>

              <button
                type="button"
                onClick={() => setView("trend")}
                className={tabButtonClass(view === "trend")}
              >
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
                {chartType === "expense"
                  ? "Phân bổ chi tiêu"
                  : "Phân bổ thu nhập"}
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

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
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
              {chartType === "expense"
                ? "Chi tiết chi tiêu"
                : "Chi tiết thu nhập"}
            </h2>

            <div className="space-y-4">
              {displayData.map((category, index) => {
                const percentage =
                  totalDisplay > 0 ? (category.value / totalDisplay) * 100 : 0;

                return (
                  <div key={category.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {index < 3 && <span>{["🥇", "🥈", "🥉"][index]}</span>}

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

              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Thu nhập"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />

              <Bar
                dataKey="expense"
                name="Chi tiêu"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="mb-1 text-sm font-medium text-green-700">
                Thu nhập trung bình
              </p>

              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(avgIncome)}
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="mb-1 text-sm font-medium text-red-700">
                Chi tiêu trung bình
              </p>

              <p className="text-2xl font-semibold text-red-600">
                {formatCurrency(avgExpense)}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-1 text-sm font-medium text-blue-700">
                Tiết kiệm trung bình
              </p>

              <p className="text-2xl font-semibold text-blue-600">
                {formatCurrency(avgSaving)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
