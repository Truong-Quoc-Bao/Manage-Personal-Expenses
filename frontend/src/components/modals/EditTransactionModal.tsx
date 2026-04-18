import React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { accountStore } from "../../store/mockData";

interface EditTransactionModalProps {
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
  onSubmit: (data: any) => void;
}

export function EditTransactionModal({
  transaction,
  onClose,
  onSubmit,
}: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    transaction.type
  );
  const [formData, setFormData] = useState({
    account: transaction.account,
    category: transaction.category,
    amount: transaction.amount.toString(),
    date: transaction.date,
    description: transaction.description,
    note: transaction.note || "",
  });

  // Get accounts from store
  const accounts = accountStore.getAll().map((acc) => ({
    value: acc.name,
    label: acc.name,
  }));

  const expenseCategories = [
    { value: "Ăn uống", label: "Ăn uống" },
    { value: "Di chuyển", label: "Di chuyển" },
    { value: "Giải trí", label: "Giải trí" },
    { value: "Mua sắm", label: "Mua sắm" },
    { value: "Hóa đơn", label: "Hóa đơn" },
    { value: "Sức khỏe", label: "Sức khỏe" },
    { value: "Giáo dục", label: "Giáo dục" },
    { value: "Khác", label: "Khác" },
  ];

  const incomeCategories = [
    { value: "Lương", label: "Lương" },
    { value: "Thưởng", label: "Thưởng" },
    { value: "Đầu tư", label: "Đầu tư" },
    { value: "Quà tặng", label: "Quà tặng" },
    { value: "Khác", label: "Khác" },
  ];

  const categories =
    transactionType === "expense" ? expenseCategories : incomeCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple validation
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Vui lòng nhập số tiền hợp lệ");
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error("Vui lòng nhập mô tả");
        setLoading(false);
        return;
      }

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      onSubmit({
        ...formData,
        type: transactionType,
        amount: amount,
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-800">Chỉnh sửa giao dịch</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Loại giao dịch <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransactionType("expense");
                  setFormData({ ...formData, category: "" });
                }}
                className={`flex-1 py-3 rounded-xl transition-all ${
                  transactionType === "expense"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType("income");
                  setFormData({ ...formData, category: "" });
                }}
                className={`flex-1 py-3 rounded-xl transition-all ${
                  transactionType === "income"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Tài khoản{" "}
              {transactionType === "expense" ? "trừ tiền" : "nhận tiền"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.account}
              onChange={(e) =>
                setFormData({ ...formData, account: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              required
            >
              <option value="">Chọn tài khoản</option>
              {accounts.map((account) => (
                <option key={account.value} value={account.value}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Số tiền <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Nhập số tiền (VD: 50000)"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Ngày giao dịch <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="VD: Ăn trưa với bạn"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
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
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
