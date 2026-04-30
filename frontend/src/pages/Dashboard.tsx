import { useEffect, useState } from "react";
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

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

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

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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

  return (
    <>
      <main className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-rose-50 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Chào mừng trở lại! Đây là tổng quan tài chính của bạn.
              </p>
            </div>

            <button
              onClick={() => setShowAddTransaction(true)}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-orange-500 hover:to-rose-500 hover:shadow-xl"
            >
              <Plus className="h-6 w-6" />
              Thêm giao dịch
            </button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-7 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Tổng số dư
                </span>
              </div>
              <p className="mb-2 text-4xl font-semibold text-gray-900">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-base text-gray-500">Tất cả tài khoản</p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Thu nhập tháng này
                </span>
              </div>
              <p className="mb-2 text-4xl font-semibold text-green-600">
                {formatCurrency(monthlyIncome)}
              </p>
              <div className="flex items-center gap-1 text-base font-medium text-green-600">
                <ArrowUpRight className="h-5 w-5" />
                +12% so với tháng trước
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-500">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Chi tiêu tháng này
                </span>
              </div>
              <p className="mb-2 text-4xl font-semibold text-red-600">
                {formatCurrency(monthlyExpense)}
              </p>
              <div className="flex items-center gap-1 text-base font-medium text-red-600">
                <ArrowDownRight className="h-5 w-5" />
                +5% so với tháng trước
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
            <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Giao dịch gần đây
                </h2>
                <a
                  href="/transactions"
                  className="text-base font-medium text-orange-500 hover:text-orange-600"
                >
                  Xem tất cả
                </a>
              </div>

              <div className="space-y-5">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-2xl p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-7 w-7" />
                        ) : (
                          <TrendingDown className="h-7 w-7" />
                        )}
                      </div>

                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-base text-gray-500">
                          {transaction.category} • {transaction.account}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-base text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Tài khoản</h2>
                <a
                  href="/accounts"
                  className="text-base font-medium text-orange-500 hover:text-orange-600"
                >
                  Quản lý
                </a>
              </div>

              <div className="space-y-5">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 transition hover:from-gray-100 hover:to-gray-200"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-2xl">{account.icon}</span>
                      <p className="text-lg font-medium text-gray-900">
                        {account.name}
                      </p>
                    </div>

                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(account.balance)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {account.type === "cash"
                        ? "Tiền mặt"
                        : account.type === "bank"
                        ? "Ngân hàng"
                        : "Ví điện tử"}
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
