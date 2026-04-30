import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { AddTransactionModal } from "../components/modals/AddTransactionModal";
import { EditTransactionModal } from "../components/modals/EditTransactionModal";
import { DeleteTransactionModal } from "../components/modals/DeleteTransactionModal";
import {
  transactionStore,
  accountStore,
  type Transaction,
} from "../store/mockData";

export function Transactions() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(
    transactionStore.getAll()
  );
  const [accounts, setAccounts] = useState(accountStore.getAll());

  useEffect(() => {
    const unsubscribeTransactions = transactionStore.subscribe(setTransactions);
    const unsubscribeAccounts = accountStore.subscribe(setAccounts);

    return () => {
      unsubscribeTransactions();
      unsubscribeAccounts();
    };
  }, []);

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

    const account = accounts.find(
      (acc) => acc.name === transactionData.account
    );

    if (account) {
      const balanceChange =
        transactionData.type === "income"
          ? newTransaction.amount
          : -newTransaction.amount;

      accountStore.update(account.id, {
        balance: account.balance + balanceChange,
      });
    }

    setShowAddTransaction(false);
    toast.success("Đã thêm giao dịch thành công!");
  };

  const handleEditTransaction = (transactionData: any) => {
    if (!editingTransaction) return;

    transactionStore.update(editingTransaction.id, transactionData);
    setEditingTransaction(null);
    toast.success("Đã cập nhật giao dịch thành công!");
  };

  const handleDeleteTransaction = () => {
    if (!deletingTransaction) return;

    transactionStore.remove(deletingTransaction.id);
    setDeletingTransaction(null);
    toast.success("Đã xóa giao dịch thành công!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const filterButtonClass = (active: boolean, type?: "income" | "expense") => {
    if (active && type === "income") {
      return "!bg-green-500 text-white shadow-md";
    }

    if (active && type === "expense") {
      return "!bg-red-500 text-white shadow-md";
    }

    if (active) {
      return "!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md";
    }

    return "!bg-gray-100 text-gray-700 hover:!bg-gray-200";
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900">Giao dịch</h1>
            <p className="text-gray-600">
              Quản lý tất cả các giao dịch thu chi của bạn
            </p>
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
                onClick={() => setFilterType("income")}
                className={`rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                  filterType === "income",
                  "income"
                )}`}
              >
                Thu
              </button>

              <button
                type="button"
                onClick={() => setFilterType("expense")}
                className={`rounded-xl px-6 py-3 font-medium transition ${filterButtonClass(
                  filterType === "expense",
                  "expense"
                )}`}
              >
                Chi
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-4 text-gray-500">Không tìm thấy giao dịch nào</p>

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
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600">
                      Tài khoản
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
                      key={transaction.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {transaction.date}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>

                          <span className="text-sm text-gray-800">
                            {transaction.category}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {transaction.description}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {transaction.account}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTransaction(transaction)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl !bg-gray-100 text-gray-500 transition hover:!bg-orange-100 hover:text-orange-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTransaction(transaction)}
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
          onSubmit={handleAddTransaction}
        />
      )}

      {editingTransaction && (
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
      )}
    </>
  );
}
