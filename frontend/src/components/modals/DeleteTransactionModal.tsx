import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { transactionsApi } from "@/api/transaction.api";
import type { TransactionResponse } from "@/types/transaction";

interface DeleteTransactionModalProps {
  transaction: TransactionResponse;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTransactionModal({
  transaction,
  onClose,
  onDeleted,
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

    try {
      await transactionsApi.deleteTransaction(transaction.transId);
      toast.success("Đã xóa giao dịch thành công!");
      onDeleted();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(
        typeof message === "string" ? message : "Xóa giao dịch thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl text-gray-800">Xác nhận xóa giao dịch</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Warning */}
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="mb-1 text-sm text-red-800">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
              </p>
              <p className="text-sm text-red-700">
                Giao dịch này sẽ bị xóa vĩnh viễn khỏi lịch sử của bạn.
              </p>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-sm text-gray-600">
              Bạn sắp xóa giao dịch:
            </p>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Loại</p>
                  <p className="text-gray-800">
                    {transaction.transactionType === "Income"
                      ? "Thu nhập"
                      : "Chi tiêu"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p
                    className={`text-lg ${
                      transaction.transactionType === "Income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.transactionType === "Income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>

              {transaction.categoryName && (
                <div>
                  <p className="text-sm text-gray-600">Danh mục</p>
                  <p className="text-gray-800">{transaction.categoryName}</p>
                </div>
              )}

              {transaction.description && (
                <div>
                  <p className="text-sm text-gray-600">Mô tả</p>
                  <p className="text-gray-800">{transaction.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Ngày</p>
                <p className="text-gray-800">{transaction.date}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa giao dịch này không?
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-white shadow-lg transition-all hover:from-red-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang xóa..." : "Xóa giao dịch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
