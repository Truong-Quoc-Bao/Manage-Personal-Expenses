import React from "react";
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteTransactionModalProps {
  transaction: {
    id: number;
    type: "income" | "expense";
    category: string;
    amount: number;
    date: string;
    description: string;
    account: string;
    note?: string;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteTransactionModal({
  transaction,
  onClose,
  onConfirm,
}: DeleteTransactionModalProps) {
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-800">Xác nhận xóa giao dịch</h2>
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
                Giao dịch này sẽ bị xóa vĩnh viễn khỏi lịch sử của bạn.
              </p>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-3">Bạn sắp xóa giao dịch:</p>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Loại</p>
                  <p className="text-gray-800">
                    {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p
                    className={`text-lg ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Danh mục</p>
                <p className="text-gray-800">{transaction.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mô tả</p>
                <p className="text-gray-800">{transaction.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tài khoản</p>
                  <p className="text-gray-800">{transaction.account}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Ngày</p>
                  <p className="text-gray-800">{transaction.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <p className="text-sm text-gray-600 text-center">
            Bạn có chắc chắn muốn xóa giao dịch này không?
          </p>

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
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xóa..." : "Xóa giao dịch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
