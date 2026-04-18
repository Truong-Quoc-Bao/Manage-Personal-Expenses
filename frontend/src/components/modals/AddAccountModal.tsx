import React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddAccountModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddAccountModal({ onClose, onSubmit }: AddAccountModalProps) {
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
    setLoading(true);

    try {
      // Validate name
      if (formData.name.trim().length < 2) {
        toast.error("Tên tài khoản phải có ít nhất 2 ký tự");
        setLoading(false);
        return;
      }

      // Validate balance
      const balance = parseFloat(formData.balance);
      if (isNaN(balance) || balance < 0) {
        toast.error("Số dư không hợp lệ");
        setLoading(false);
        return;
      }

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get icon based on type
      const selectedType = accountTypes.find((t) => t.value === formData.type);

      onSubmit({
        ...formData,
        icon: selectedType?.icon || "💰",
        balance: balance.toString(),
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-800">Thêm tài khoản mới</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Account Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Tên tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="VD: Techcombank, MoMo, Ví tiền mặt"
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Loại tài khoản <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === type.value
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm text-gray-800">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Số dư ban đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="0"
              required
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập số dư hiện tại của tài khoản
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Đơn vị tiền tệ
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="VND">VND (Việt Nam Đồng)</option>
              <option value="USD">USD (Đô la Mỹ)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
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
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
