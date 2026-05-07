import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { accountApi } from "../../api/account.api";

type Account = {
  account_id: string;
  account_name: string;
  balance: number;
  type: string;
  currency?: string;
};

interface EditAccountModalProps {
  account: Account;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAccountModal({
  account,
  onClose,
  onSuccess,
}: EditAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: account.account_name,
    type: account.type,
    balance: String(account.balance),
    currency: account.currency || "VND",
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

    setLoading(true);

    try {
      await accountApi.updateAccount({
        accountId: account.account_id,
        accountName: formData.name,
        type: formData.type,
      });

      toast.success(`Đã cập nhật tài khoản "${formData.name}" thành công!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update account failed:", error);
      toast.error("Cập nhật tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Chỉnh sửa tài khoản
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
              placeholder="VD: Techcombank, MoMo, Ví tiền mặt"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Loại tài khoản <span className="text-red-500">*</span>
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
            <label className="mb-2 block text-sm text-gray-700">Số dư</label>

            <input
              type="number"
              value={formData.balance}
              disabled
              className="h-12 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 text-gray-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Số dư nên được thay đổi thông qua giao dịch, không sửa trực tiếp.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Đơn vị tiền tệ
            </label>

            <select
              value={formData.currency}
              disabled
              className="h-12 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 text-gray-500"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl !bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:!bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
