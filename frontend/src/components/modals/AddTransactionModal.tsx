import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { accountStore } from "../../store/mockData";

interface AddTransactionModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddTransactionModal({
  onClose,
  onSubmit,
}: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );

  const [formData, setFormData] = useState({
    account: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    note: "",
  });

  const accounts = accountStore.getAll().map((acc) => ({
    value: acc.name,
    label: acc.name,
  }));

  const expenseCategories = [
    "Ăn uống",
    "Di chuyển",
    "Giải trí",
    "Mua sắm",
    "Hóa đơn",
    "Sức khỏe",
    "Giáo dục",
    "Khác",
  ];

  const incomeCategories = ["Lương", "Thưởng", "Đầu tư", "Quà tặng", "Khác"];

  const categories =
    transactionType === "expense" ? expenseCategories : incomeCategories;

  const fieldClass =
    "h-14 w-full rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accounts.length === 0) {
      toast.error("Vui lòng thêm tài khoản trước!");
      return;
    }

    if (!formData.account) {
      toast.error("Vui lòng chọn tài khoản");
      return;
    }

    if (!formData.category) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      onSubmit({
        ...formData,
        type: transactionType,
        amount: amount.toString(),
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[88vh] w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Thêm giao dịch
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full !bg-transparent text-gray-500 transition hover:!bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(88vh-88px)] space-y-5 overflow-y-auto px-8 py-6"
        >
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Loại giao dịch <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTransactionType("expense");
                  setFormData({ ...formData, category: "" });
                }}
                className={`rounded-2xl px-4 py-4 font-semibold transition ${
                  transactionType === "expense"
                    ? "!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-lg"
                    : "!bg-gray-100 text-gray-700 hover:!bg-gray-200"
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
                className={`rounded-2xl px-4 py-4 font-semibold transition ${
                  transactionType === "income"
                    ? "!bg-gradient-to-r !from-green-400 !to-emerald-500 text-white shadow-lg"
                    : "!bg-gray-100 text-gray-700 hover:!bg-gray-200"
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tài khoản{" "}
              {transactionType === "expense" ? "trừ tiền" : "nhận tiền"}{" "}
              <span className="text-red-500">*</span>
            </label>

            {accounts.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Chưa có tài khoản nào. Vui lòng thêm tài khoản trước!
              </div>
            ) : (
              <select
                value={formData.account}
                onChange={(e) =>
                  setFormData({ ...formData, account: e.target.value })
                }
                className={fieldClass}
                required
              >
                <option value="">Chọn tài khoản</option>
                {accounts.map((account) => (
                  <option key={account.value} value={account.value}>
                    {account.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Danh mục <span className="text-red-500">*</span>
            </label>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className={fieldClass}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mô tả <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={fieldClass}
              placeholder="VD: Ăn trưa với bạn"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ghi chú (tùy chọn)
            </label>

            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className={`${fieldClass} h-24 resize-none py-4`}
              placeholder="Thêm ghi chú..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl !bg-gray-100 px-6 py-4 font-semibold text-gray-700 transition hover:!bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading || accounts.length === 0}
              className="rounded-2xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-4 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu giao dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
