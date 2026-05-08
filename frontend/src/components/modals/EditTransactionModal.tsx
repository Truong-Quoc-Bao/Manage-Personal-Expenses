import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { transactionsApi } from "@/api/transaction.api";
import type {
  TransactionResponse,
  TransactionType,
  UpdateTransactionRequest,
} from "@/types/transaction";

interface EditTransactionModalProps {
  transaction: TransactionResponse;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditTransactionModal({
  transaction,
  onClose,
  onUpdated,
}: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction.transactionType
  );

  const [formData, setFormData] = useState({
    accountId: transaction.accountId,
    categoryId: transaction.categoryId ?? "",
    amount: transaction.amount.toString(),
    date: transaction.date,
    description: transaction.description ?? "",
    note: transaction.note ?? "",
  });

  const fieldClass =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId.trim()) {
      toast.error("Vui lòng nhập Account ID");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!formData.date) {
      toast.error("Vui lòng chọn ngày giao dịch");
      return;
    }

    setLoading(true);

    try {
      const request: UpdateTransactionRequest = {
        accountId: formData.accountId.trim(),
        categoryId: formData.categoryId.trim() || null,
        amount,
        transactionType,
        description: formData.description.trim() || undefined,
        date: formData.date,
        note: formData.note.trim() || undefined,
      };

      await transactionsApi.updateTransaction(transaction.transId, request);
      toast.success("Đã cập nhật giao dịch thành công!");
      onUpdated();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(
        typeof message === "string" ? message : "Cập nhật giao dịch thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl text-gray-800">Chỉnh sửa giao dịch</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Transaction Type */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Loại giao dịch <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransactionType("Expense")}
                className={`flex-1 rounded-xl py-3 transition-all ${
                  transactionType === "Expense"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("Income")}
                className={`flex-1 rounded-xl py-3 transition-all ${
                  transactionType === "Income"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Account ID */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Tài khoản (Account ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.accountId}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
              className={fieldClass}
              placeholder="VD: 550e8400-e29b-41d4-a716-446655440000"
              required
            />
          </div>

          {/* Category ID */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Danh mục (Category ID)
            </label>
            <input
              type="text"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className={fieldClass}
              placeholder="Để trống nếu không có danh mục"
            />
            {transaction.categoryName && (
              <p className="mt-1 text-xs text-gray-500">
                Danh mục hiện tại: {transaction.categoryName}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Số tiền <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className={fieldClass}
              placeholder="Nhập số tiền (VD: 50000)"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Ngày giao dịch <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className={fieldClass}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Mô tả
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={fieldClass}
              placeholder="VD: Ăn trưa với bạn"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className={`${fieldClass} resize-none`}
              rows={3}
              placeholder="Thêm ghi chú..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 px-6 py-3 text-white shadow-lg transition-all hover:from-orange-500 hover:to-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
