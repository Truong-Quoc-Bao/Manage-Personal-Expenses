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
import { transactionStore, type Transaction } from "../store/mockData";
import { accountApi } from "../api/account.api";
import { analyticsApi } from "../api/analytics.api";

type AccountApiItem = {
  account_id: string;
  account_name: string;
  type: string;
  balance: number | string;
  currency?: string | null;
};

type MonthlyReport = {
  summary?: {
    total_income?: number;
    total_expense?: number;
    savings?: number;
  };
};

export function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Giữ giao dịch gần đây bằng mockData
  const [transactions, setTransactions] = useState<Transaction[]>(
    transactionStore.getAll()
  );

  // Account + analytics dùng API thật
  const [accounts, setAccounts] = useState<AccountApiItem[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeTransactions = transactionStore.subscribe(setTransactions);

    return () => {
      unsubscribeTransactions();
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const accountsRes = await accountApi.getAccounts();
        console.log("DASHBOARD ACCOUNTS:", accountsRes.data);
        setAccounts(accountsRes.data?.data || []);
      } catch (error) {
        console.error("Get accounts failed:", error);
        toast.error("Không thể tải tài khoản!");
      }

      try {
        const monthlyReportRes = await analyticsApi.getMonthlyReports();

        const reports = monthlyReportRes.data?.data || [];

        const sortedReports = [...reports].sort(
          (a, b) => b.year * 12 + b.month - (a.year * 12 + a.month)
        );

        setMonthlyReport(sortedReports[0] || null);
      } catch (error) {
        console.error("Get monthly report failed:", error);
        setMonthlyReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const monthlyIncome = monthlyReport?.summary?.total_income || 0;
  const monthlyExpense = monthlyReport?.summary?.total_expense || 0;

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "cash":
        return "💵";
      case "bank":
        return "🏦";
      case "ewallet":
        return "📱";
      case "credit":
        return "💳";
      default:
        return "💰";
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "cash":
        return "Tiền mặt";
      case "bank":
        return "Ngân hàng";
      case "ewallet":
        return "Ví điện tử";
      case "credit":
        return "Thẻ tín dụng";
      default:
        return type;
    }
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
              className="flex items-center gap-3 rounded-2xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500 hover:shadow-xl"
            >
              <Plus className="h-6 w-6" />
              Thêm giao dịch
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-lg">
              Đang tải dữ liệu dashboard...
            </div>
          ) : (
            <>
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
                    Dữ liệu từ analytics
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
                    Dữ liệu từ analytics
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
                    <h2 className="text-2xl font-bold text-gray-900">
                      Tài khoản
                    </h2>
                    <a
                      href="/accounts"
                      className="text-base font-medium text-orange-500 hover:text-orange-600"
                    >
                      Quản lý
                    </a>
                  </div>

                  <div className="space-y-5">
                    {accounts.length === 0 ? (
                      <p className="text-gray-500">Chưa có tài khoản nào.</p>
                    ) : (
                      accounts.map((account) => (
                        <div
                          key={account.account_id}
                          className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 transition hover:from-gray-100 hover:to-gray-200"
                        >
                          <div className="mb-3 flex items-center gap-3">
                            <span className="text-2xl">
                              {getAccountIcon(account.type)}
                            </span>
                            <p className="text-lg font-medium text-gray-900">
                              {account.account_name}
                            </p>
                          </div>

                          <p className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(Number(account.balance || 0))}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {getAccountTypeLabel(account.type)}
                            {account.currency ? ` • ${account.currency}` : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
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
