import React, { useState, useEffect } from "react";
import { X, Wallet, Tag } from "lucide-react";
import { toast } from "sonner";
import { transactionsApi } from "@/api/transaction.api";
import { accountApi } from "@/api/account.api";
import { categoryApi } from "@/api/category.api";
import type {
  TransactionType,
  CreateTransactionRequest,
} from "@/types/transaction";

interface AccountOption {
  account_id: string;
  account_name: string;
}

interface CategoryOption {
  category_id: string;
  category_name: string;
  type?: string | null;
}

interface AddTransactionModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function AddTransactionModal({
  onClose,
  onCreated,
}: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("Expense");

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [formData, setFormData] = useState({
    accountId: "",
    categoryId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    note: "",
  });

  useEffect(() => {
    accountApi.getAccounts().then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setAccounts(list);
      if (list.length === 1) {
        setFormData((prev) => ({ ...prev, accountId: list[0].account_id }));
      }
    });
    categoryApi.getCategories().then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  const fieldClass =
    "h-14 w-full rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  const selectClass =
    "h-14 w-full rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId) {
      toast.error("Vui lòng chọn tài khoản");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ (lớn hơn 0)");
      return;
    }

    if (!formData.date) {
      toast.error("Vui lòng chọn ngày giao dịch");
      return;
    }

    setLoading(true);

    try {
      const request: CreateTransactionRequest = {
        accountId: formData.accountId,
        categoryId: formData.categoryId || null,
        amount,
        transactionType,
        description: formData.description.trim() || undefined,
        date: `${formData.date}T12:00:00Z`,
        note: formData.note.trim() || undefined,
      };

      await transactionsApi.createTransaction(request);
      toast.success("Đã thêm giao dịch thành công!");
      onCreated();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(typeof message === "string" ? message : "Tạo giao dịch thất bại");
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
          {/* Transaction Type */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Loại giao dịch <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTransactionType("Expense");
                  setFormData((prev) => ({ ...prev, categoryId: "" }));
                }}
                className={`rounded-2xl px-4 py-4 font-semibold transition ${
                  transactionType === "Expense"
                    ? "!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-lg"
                    : "!bg-gray-100 text-gray-700 hover:!bg-gray-200"
                }`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType("Income");
                  setFormData((prev) => ({ ...prev, categoryId: "" }));
                }}
                className={`rounded-2xl px-4 py-4 font-semibold transition ${
                  transactionType === "Income"
                    ? "!bg-gradient-to-r !from-green-400 !to-emerald-500 text-white shadow-lg"
                    : "!bg-gray-100 text-gray-700 hover:!bg-gray-200"
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Account Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-blue-500" />
                Tài khoản <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              value={formData.accountId}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
              className={selectClass}
              required
            >
              <option value="">— Chọn tài khoản —</option>
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-purple-500" />
                Danh mục
              </span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className={selectClass}
            >
              <option value="">— Không chọn danh mục —</option>
              {categories
                .filter(
                  (cat) =>
                    !cat.type ||
                    cat.type.toLowerCase() === transactionType.toLowerCase(),
                )
                .map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount */}
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
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Date */}
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

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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

          {/* Actions */}
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
              disabled={loading}
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
