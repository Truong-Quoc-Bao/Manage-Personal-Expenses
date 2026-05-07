import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { accountApi } from "../../api/account.api";

type Account = {
  account_id: string;
  account_name: string;
  balance: number | string;
  type: string;
  currency?: string | null;
};

interface DeleteAccountModalProps {
  account: Account;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAccountModal({
  account,
  onClose,
  onSuccess,
}: DeleteAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "cash":
        return "💵";
      case "bank":
        return "🏦";
      case "ewallet":
        return "📱";
      default:
        return "💰";
    }
  };

  const handleDelete = async () => {
    if (!account.account_id) {
      toast.error("Không tìm thấy accountId để xóa");
      return;
    }

    setLoading(true);

    try {
      await accountApi.deleteAccount({
        accountId: account.account_id,
      });

      toast.success(`Đã xóa tài khoản "${account.account_name}" thành công!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Delete account failed:", error);
      toast.error("Xóa tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmValid = confirmText.trim().toLowerCase() === "xóa";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Xác nhận xóa tài khoản
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg !bg-transparent p-2 text-gray-600 hover:!bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="mb-1 text-sm text-red-800">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
              </p>
              <p className="text-sm text-red-700">
                Tài khoản này sẽ bị xóa khỏi hệ thống.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-sm text-gray-600">Bạn sắp xóa:</p>

            <div className="flex items-center gap-3">
              <div className="text-3xl">{getAccountIcon(account.type)}</div>

              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {account.account_name}
                </p>
                <p className="text-sm text-gray-600">
                  Số dư: {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Để xác nhận, vui lòng nhập "<strong>xóa</strong>" vào ô bên dưới:
            </label>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Nhập 'xóa' để xác nhận"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl !bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:!bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || !isConfirmValid}
              className="flex-1 rounded-xl !bg-gradient-to-r !from-red-500 !to-red-600 px-6 py-3 font-semibold text-white shadow-lg hover:!from-red-600 hover:!to-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang xóa..." : "Xóa tài khoản"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
