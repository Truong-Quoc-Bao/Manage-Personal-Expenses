import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { accountApi } from "../../api/account.api";

interface AddAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAccountModal({ onClose, onSuccess }: AddAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    balance: "",
    currency: "VND",
  });

  const accountTypes = [
    { value: "cash", label: "Tiền mặt", icon: "💵" },
    { value: "bank", label: "Ngân hàng", icon: "🏦" },
    { value: "ewallet", label: "Ví điện tử", icon: "📱" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      toast.error("Tên tài khoản phải có ít nhất 2 ký tự");
      return;
    }

    const balance = Number(formData.balance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Số dư không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      await accountApi.createAccount({
        accountName: formData.name,
        type: formData.type,
        balance,
        currency: formData.currency,
      });

      toast.success(`Đã tạo tài khoản "${formData.name}" thành công!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Create account failed:", error);
      toast.error("Tạo tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Thêm tài khoản mới
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg !bg-transparent p-2 text-gray-600 hover:!bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Tên tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="VD: Techcombank, MoMo"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Loại tài khoản
            </label>
            <div className="grid grid-cols-3 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`rounded-xl border-2 p-4 transition ${
                    formData.type === type.value
                      ? "!bg-orange-50 border-orange-400"
                      : "!bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mb-2 text-2xl">{type.icon}</div>
                  <div className="text-sm text-gray-800">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Số dư ban đầu
            </label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: e.target.value })
              }
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="0"
              required
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Đơn vị tiền tệ
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl !bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:!bg-gray-200"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
