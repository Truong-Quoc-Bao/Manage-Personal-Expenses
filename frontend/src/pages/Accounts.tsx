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
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
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
    if (editingAccount) {
      accountStore.update(editingAccount.id, accountData);
      setEditingAccount(null);
      toast.success(`Đã cập nhật tài khoản "${accountData.name}" thành công!`);
    }
  };

  const handleDeleteAccount = () => {
    if (deletingAccount) {
      accountStore.remove(deletingAccount.id);
      toast.success(`Đã xóa tài khoản "${deletingAccount.name}" thành công!`);
      setDeletingAccount(null);
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl text-gray-800 mb-1">Tài khoản</h1>
            <p className="text-gray-600">Quản lý các tài khoản và ví của bạn</p>
          </div>

          <button
            onClick={() => setShowAddAccount(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Thêm tài khoản
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-8 h-8 text-white" />
            <p className="text-white text-opacity-90">Tổng số dư</p>
          </div>

          <p className="text-4xl text-white mb-2">
            {formatCurrency(totalBalance)}
          </p>

          <p className="text-white text-opacity-75">
            Từ {accounts.length} tài khoản
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{account.icon}</div>

                  <div>
                    <h3 className="text-lg text-gray-800 mb-1">
                      {account.name}
                    </h3>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                        account.type
                      )}`}
                    >
                      {getTypeLabel(account.type)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Số dư</p>
                <p className="text-2xl text-gray-800">
                  {formatCurrency(account.balance)}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingAccount(account)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Sửa</span>
                </button>

                <button
                  onClick={() => setDeletingAccount(account)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-xl text-gray-800 mb-2">
              Chưa có tài khoản nào
            </h3>

            <p className="text-gray-600 mb-6">
              Thêm tài khoản đầu tiên để bắt đầu quản lý tài chính
            </p>

            <button
              onClick={() => setShowAddAccount(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Thêm tài khoản
            </button>
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