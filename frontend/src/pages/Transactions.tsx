import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { transactionsApi } from "@/api/transaction.api";
import type { TransactionResponse } from "@/types/transaction";
import { AddTransactionModal } from "@/components/modals/AddTransactionModal";
import { EditTransactionModal } from "@/components/modals/EditTransactionModal";
import { DeleteTransactionModal } from "@/components/modals/DeleteTransactionModal";

export function Transactions() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionResponse | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionResponse | null>(null);

  const [filterType, setFilterType] = useState<"all" | "Income" | "Expense">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await transactionsApi.getTransactions({
        include_category: true,
      });
      setTransactions(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải danh sách giao dịch";
      setError(message);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionCreated = () => {
    setShowAddTransaction(false);
    fetchTransactions();
  };

  const handleTransactionUpdated = () => {
    setEditingTransaction(null);
    fetchTransactions();
  };

  const handleTransactionDeleted = () => {
    setDeletingTransaction(null);
    fetchTransactions();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      filterType === "all" || t.transactionType === filterType;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (t.description ?? "").toLowerCase().includes(searchLower) ||
      (t.categoryName ?? "").toLowerCase().includes(searchLower) ||
      (t.note ?? "").toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.transactionType === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.transactionType === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const filterButtonClass = (
    active: boolean,
    type?: "Income" | "Expense"
  ) => {
    if (active && type === "Income")
      return "!bg-green-500 text-white shadow-md";
    if (active && type === "Expense")
      return "!bg-red-500 text-white shadow-md";
    if (active)
      return "!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md";
    return "!bg-gray-100 text-gray-700 hover:!bg-gray-200";
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-500">Đang tải giao dịch...</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div>
            <p className="mb-1 text-lg font-medium text-gray-900">
              Không thể tải dữ liệu
            </p>
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
            <h1 className="mb-1 text-4xl font-bold text-gray-900">
              Giao dịch
            </h1>
            <p className="text-gray-600">
              Quản lý tất cả các giao dịch thu chi của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="flex h-12 w-12 items-center justify-center rounded-xl !bg-gray-100 text-gray-600 transition hover:!bg-gray-200 disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
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

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <p className="mb-2 text-sm text-gray-600">Tổng thu</p>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <p className="mb-2 text-sm text-gray-600">Tổng chi</p>
            <p className="text-2xl font-semibold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <p className="mb-2 text-sm text-gray-600">Số dư ròng</p>
            <p
              className={`text-2xl font-semibold ${
                totalIncome - totalExpense >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>

        {/* Filter & Search */}
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
                onClick={() => setFilterType("all")}
                className={`rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                  filterType === "all"
                )}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterType("Income")}
                className={`rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                  filterType === "Income",
                  "Income"
                )}`}
              >
                Thu
              </button>
              <button
                type="button"
                onClick={() => setFilterType("Expense")}
                className={`rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                  filterType === "Expense",
                  "Expense"
                )}`}
              >
                Chi
              </button>
            </div>
          </div>
        </div>

        {/* Transaction table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-4 text-gray-500">
                {transactions.length === 0
                  ? "Chưa có giao dịch nào"
                  : "Không tìm thấy giao dịch phù hợp"}
              </p>
              <button
                type="button"
                onClick={() => setShowAddTransaction(true)}
                className="font-medium !bg-transparent text-orange-500 hover:text-orange-600"
              >
                Thêm giao dịch đầu tiên
              </button>
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
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.transId}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {transaction.date}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              transaction.transactionType === "Income"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
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
                            {transaction.transactionType === "Income" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <span className="text-sm text-gray-800">
                            {transaction.categoryName ?? "Không danh mục"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {transaction.description || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            transaction.transactionType === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.transactionType === "Income"
                            ? "+"
                            : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTransaction(transaction)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl !bg-gray-100 text-gray-500 transition hover:!bg-orange-100 hover:text-orange-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeletingTransaction(transaction)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl !bg-gray-100 text-gray-500 transition hover:!bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
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
