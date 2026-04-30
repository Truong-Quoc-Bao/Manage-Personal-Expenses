import React, { useEffect, useState } from "react";
import { Plus, Wallet, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddAccountModal } from "../components/modals/AddAccountModal";
import { EditAccountModal } from "../components/modals/EditAccountModal";
import { DeleteAccountModal } from "../components/modals/DeleteAccountModal";
import { accountStore, type Account } from "../store/mockData";

export function Accounts() {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(accountStore.getAll());

  useEffect(() => {
    const unsubscribe = accountStore.subscribe(setAccounts);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleAddAccount = (accountData: any) => {
    const newAccount: Account = {
      id: Date.now(),
      name: accountData.name,
      balance: parseFloat(accountData.balance),
      type: accountData.type,
      icon: accountData.icon,
      currency: accountData.currency,
    };

    accountStore.add(newAccount);
    setShowAddAccount(false);
    toast.success(`Đã tạo tài khoản "${accountData.name}" thành công!`);
  };

  const handleEditAccount = (accountData: any) => {
    if (!editingAccount) return;

    accountStore.update(editingAccount.id, accountData);
    setEditingAccount(null);
    toast.success(`Đã cập nhật tài khoản "${accountData.name}" thành công!`);
  };

  const handleDeleteAccount = () => {
    if (!deletingAccount) return;

    accountStore.remove(deletingAccount.id);
    toast.success(`Đã xóa tài khoản "${deletingAccount.name}" thành công!`);
    setDeletingAccount(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "cash":
        return "Tiền mặt";
      case "bank":
        return "Ngân hàng";
      case "ewallet":
        return "Ví điện tử";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cash":
        return "bg-amber-100 text-amber-700";
      case "bank":
        return "bg-blue-100 text-blue-700";
      case "ewallet":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900">Tài khoản</h1>
            <p className="text-gray-600">Quản lý các tài khoản và ví của bạn</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddAccount(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
          >
            <Plus className="h-5 w-5" />
            Thêm tài khoản
          </button>
        </div>

        <div className="mb-8 rounded-3xl !bg-gradient-to-br !from-orange-400 !to-rose-400 p-8 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-white" />
            <p className="text-white/90">Tổng số dư</p>
          </div>

          <p className="mb-2 text-4xl font-semibold text-white">
            {formatCurrency(totalBalance)}
          </p>

          <p className="text-white/75">Từ {accounts.length} tài khoản</p>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Wallet className="h-8 w-8 text-gray-400" />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Chưa có tài khoản nào
            </h3>

            <p className="mb-6 text-gray-600">
              Thêm tài khoản đầu tiên để bắt đầu quản lý tài chính
            </p>

            <button
              type="button"
              onClick={() => setShowAddAccount(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
            >
              <Plus className="h-5 w-5" />
              Thêm tài khoản
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition hover:shadow-xl"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{account.icon}</div>

                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {account.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(
                          account.type
                        )}`}
                      >
                        {getTypeLabel(account.type)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="mb-1 text-sm text-gray-600">Số dư</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(account.balance)}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(account)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl !bg-gray-100 px-4 py-3 text-gray-600 transition hover:!bg-orange-100 hover:text-orange-600"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingAccount(account)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl !bg-gray-100 px-4 py-3 text-gray-600 transition hover:!bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddAccount && (
        <AddAccountModal
          onClose={() => setShowAddAccount(false)}
          onSubmit={handleAddAccount}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSubmit={handleEditAccount}
        />
      )}

      {deletingAccount && (
        <DeleteAccountModal
          account={deletingAccount}
          onClose={() => setDeletingAccount(null)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </>
  );
}
