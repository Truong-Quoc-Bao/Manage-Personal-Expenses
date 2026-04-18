import { useState, useEffect } from "react";
import React from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { AddTransactionModal } from "../components/modals/AddTransactionModal";
import {
  transactionStore,
  accountStore,
  type Transaction,
} from "../store/mockData";

export function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
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

  // Calculate stats dynamically
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate monthly income and expense
  const monthlyIncome = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === "income" &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === "expense" &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
  };

  // Get recent transactions (top 5)
  const recentTransactions = transactions.slice(0, 5);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl text-gray-800 mb-1">Dashboard</h1>
            <p className="text-gray-600">
              Chào mừng trở lại! Đây là tổng quan tài chính của bạn.
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Tổng số dư</span>
            </div>
            <p className="text-2xl text-gray-800 mb-1">
              {formatCurrency(stats.totalBalance)}
            </p>
            <p className="text-sm text-gray-500">Tất cả tài khoản</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Thu nhập tháng này</span>
            </div>
            <p className="text-2xl text-green-600 mb-1">
              {formatCurrency(stats.monthlyIncome)}
            </p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12% so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Chi tiêu tháng này</span>
            </div>
            <p className="text-2xl text-red-600 mb-1">
              {formatCurrency(stats.monthlyExpense)}
            </p>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <ArrowDownRight className="w-4 h-4" />
              <span>+5% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-800">Giao dịch gần đây</h2>
              <a
                href="/app/transactions"
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Xem tất cả
              </a>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : (
                        <TrendingDown className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {transaction.account}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accounts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-800">Tài khoản</h2>
              <a
                href="/app/accounts"
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Quản lý
              </a>
            </div>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.name}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{account.icon}</span>
                    <p className="text-gray-800">{account.name}</p>
                  </div>
                  <p className="text-xl text-gray-800">
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {account.type === "cash"
                      ? "Tiền mặt"
                      : account.type === "bank"
                      ? "Ngân hàng"
                      : "Ví điện tử"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </>
  );
}
