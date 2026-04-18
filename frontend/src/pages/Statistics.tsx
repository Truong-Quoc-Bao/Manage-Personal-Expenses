import React from "react";
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function Statistics() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [view, setView] = useState<"category" | "trend">("category");

  const categoryData = [
    { name: "Ăn uống", value: 3500000, color: "#f97316" },
    { name: "Di chuyển", value: 1200000, color: "#3b82f6" },
    { name: "Giải trí", value: 800000, color: "#8b5cf6" },
    { name: "Mua sắm", value: 1500000, color: "#ec4899" },
    { name: "Hóa đơn", value: 1500000, color: "#06b6d4" },
  ];

  const trendData = [
    { month: "T1", income: 15000000, expense: 8000000 },
    { month: "T2", income: 16000000, expense: 7500000 },
    { month: "T3", income: 15000000, expense: 8500000 },
    { month: "T4", income: 17000000, expense: 9000000 },
    { month: "T5", income: 15500000, expense: 8200000 },
    { month: "T6", income: 16500000, expense: 8800000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-800 mb-1">Thống kê</h1>
        <p className="text-gray-600">Phân tích chi tiêu và thu nhập của bạn</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod("month")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  period === "month"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setPeriod("quarter")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  period === "quarter"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Quý này
              </button>
              <button
                onClick={() => setPeriod("year")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  period === "year"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Năm nay
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-2">Xem theo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setView("category")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  view === "category"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Theo danh mục
              </button>
              <button
                onClick={() => setView("trend")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  view === "trend"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Xu hướng
              </button>
            </div>
          </div>
        </div>
      </div>

      {view === "category" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl text-gray-800 mb-6">Phân bổ chi tiêu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl text-gray-800 mb-6">
              Chi tiết theo danh mục
            </h2>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const percentage = (category.value / totalExpense) * 100;
                return (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {index < 3 && <span>{["🥇", "🥈", "🥉"][index]}</span>}
                        <span className="text-sm text-gray-800">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-800">
                        {formatCurrency(category.value)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-800">Tổng chi tiêu</span>
                <span className="text-xl text-red-600">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl text-gray-800 mb-6">Xu hướng thu chi</h2>
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
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                }}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm text-green-700 mb-1">Thu nhập trung bình</p>
              <p className="text-2xl text-green-600">
                {formatCurrency(
                  trendData.reduce((sum, item) => sum + item.income, 0) /
                    trendData.length
                )}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm text-red-700 mb-1">Chi tiêu trung bình</p>
              <p className="text-2xl text-red-600">
                {formatCurrency(
                  trendData.reduce((sum, item) => sum + item.expense, 0) /
                    trendData.length
                )}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-700 mb-1">Tiết kiệm trung bình</p>
              <p className="text-2xl text-blue-600">
                {formatCurrency(
                  trendData.reduce(
                    (sum, item) => sum + (item.income - item.expense),
                    0
                  ) / trendData.length
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
