import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
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

    // Add transaction to store
    transactionStore.add(newTransaction);

    // Update account balance
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

    const typeLabel =
      transactionData.type === "income" ? "thu nhập" : "chi tiêu";
    toast.success(`Đã thêm giao dịch ${typeLabel} thành công!`);
  };

  const handleEditTransaction = (transactionData: any) => {
    if (editingTransaction) {
      // Revert old transaction balance
      const oldAccount = accounts.find(
        (acc) => acc.name === editingTransaction.account
      );
      if (oldAccount) {
        const oldBalanceChange =
          editingTransaction.type === "income"
            ? -editingTransaction.amount
            : editingTransaction.amount;
        accountStore.update(oldAccount.id, {
          balance: oldAccount.balance + oldBalanceChange,
        });
      }

      // Apply new transaction balance
      const newAccount = accounts.find(
        (acc) => acc.name === transactionData.account
      );
      if (newAccount) {
        const newBalanceChange =
          transactionData.type === "income"
            ? parseFloat(transactionData.amount)
            : -parseFloat(transactionData.amount);
        accountStore.update(newAccount.id, {
          balance: newAccount.balance + newBalanceChange,
        });
      }

      transactionStore.update(editingTransaction.id, transactionData);
      setEditingTransaction(null);
      toast.success("Đã cập nhật giao dịch thành công!");
    }
  };

  const handleDeleteTransaction = () => {
    if (deletingTransaction) {
      // Revert transaction balance
      const account = accounts.find(
        (acc) => acc.name === deletingTransaction.account
      );
      if (account) {
        const balanceChange =
          deletingTransaction.type === "income"
            ? -deletingTransaction.amount
            : deletingTransaction.amount;
        accountStore.update(account.id, {
          balance: account.balance + balanceChange,
        });
      }

      transactionStore.remove(deletingTransaction.id);
      toast.success("Đã xóa giao dịch thành công!");
      setDeletingTransaction(null);
    }
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

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl text-gray-800 mb-1">Giao dịch</h1>
            <p className="text-gray-600">
              Quản lý tất cả các giao dịch thu chi của bạn
            </p>
          </div>
          <button
            onClick={() => setShowAddTransaction(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Thêm giao dịch
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Tổng thu</p>
            <p className="text-2xl text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Tổng chi</p>
            <p className="text-2xl text-red-600">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Số dư ròng</p>
            <p
              className={`text-2xl ${
                totalIncome - totalExpense >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mô tả hoặc danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  filterType === "all"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType("income")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  filterType === "income"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Thu
              </button>
              <button
                onClick={() => setFilterType("expense")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  filterType === "expense"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chi
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">Không tìm thấy giao dịch nào</p>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="text-orange-500 hover:text-orange-600"
              >
                Thêm giao dịch đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                      Tài khoản
                    </th>
                    <th className="px-6 py-4 text-right text-xs text-gray-600 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-center text-xs text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.account}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingTransaction(transaction)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTransaction(transaction)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modals */}
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
