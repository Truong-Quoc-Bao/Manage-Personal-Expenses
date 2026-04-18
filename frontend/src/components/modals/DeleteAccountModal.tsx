import React from "react";
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  account: {
    id: number;
    name: string;
    balance: number;
    type: string;
    icon: string;
    currency: string;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({
  account,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleDelete = async () => {
    setLoading(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onConfirm();
    setLoading(false);
  };

  const isConfirmValid = confirmText.toLowerCase() === "xóa";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-800">Xác nhận xóa tài khoản</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 mb-1">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
              </p>
              <p className="text-sm text-red-700">
                Tất cả dữ liệu liên quan đến tài khoản này sẽ bị xóa vĩnh viễn.
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-3">Bạn sắp xóa:</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{account.icon}</div>
              <div>
                <p className="text-lg text-gray-800">{account.name}</p>
                <p className="text-sm text-gray-600">
                  Số dư: {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Để xác nhận, vui lòng nhập "<strong>xóa</strong>" vào ô bên dưới:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              placeholder="Nhập 'xóa' để xác nhận"
              autoComplete="off"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !isConfirmValid}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xóa..." : "Xóa tài khoản"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
