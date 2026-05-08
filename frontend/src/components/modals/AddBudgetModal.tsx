import { X, Calendar, DollarSign, Tag } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { categoryApi } from "../../api/category.api";
import { budgetApi } from "../../api/budget.api";

interface AddBudgetModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

type Category = {
  category_id: string;
  category_name: string;
  type: "income" | "expense";
  color?: string;
};

export function AddBudgetModal({ onClose, onCreated }: AddBudgetModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    amount: "",
    period: "monthly" as "daily" | "monthly",
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();

        const expenseCategories = (res.data?.data || []).filter(
          (cat: Category) => cat.type === "expense"
        );

        setCategories(expenseCategories);

        if (expenseCategories.length > 0) {
          setFormData((prev) => ({
            ...prev,
            categoryId: expenseCategories[0].category_id,
          }));
        }
      } catch (error) {
        console.error("Get categories failed:", error);
        toast.error("Không thể tải danh mục!");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }

    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Số tiền không hợp lệ!");
      return;
    }

    try {
      setLoading(true);

      await budgetApi.createBudget({
        title: formData.name,
        categoryId: formData.categoryId,
        amountLimit: amount,
        dateStart: `${formData.startDate}T00:00:00.000Z`,
      });

      toast.success("Tạo ngân sách thành công!");

      if (onCreated) {
        onCreated();
      }

      onClose();
    } catch (error) {
      console.error("Create budget failed:", error);
      toast.error("Tạo ngân sách thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-gray-800">Tạo ngân sách mới</h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg !bg-transparent p-2 text-gray-600 hover:!bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Tên ngân sách */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-100">
                <Tag className="h-3 w-3 text-blue-600" />
              </div>
              Tên ngân sách
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="VD: Ngân sách ăn uống tháng 5"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Danh mục */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Danh mục</label>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      categoryId: cat.category_id,
                    })
                  }
                  className={`rounded-xl border-2 p-4 transition-all ${
                    formData.categoryId === cat.category_id
                      ? "!border-orange-400 !bg-orange-50"
                      : "!border-gray-200 !bg-white hover:!border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">
                    {cat.category_name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Số tiền */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100">
                <DollarSign className="h-3 w-3 text-green-600" />
              </div>
              Số tiền ngân sách
              <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                })
              }
              placeholder="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
              min="0"
              step="1000"
            />
          </div>

          {/* Chu kỳ */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Chu kỳ</label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    period: "daily",
                  })
                }
                className={`rounded-xl border-2 p-4 transition-all ${
                  formData.period === "daily"
                    ? "!border-orange-400 !bg-orange-50"
                    : "!border-gray-200 !bg-white hover:!border-gray-300"
                }`}
              >
                <div className="text-sm text-gray-800">Theo ngày</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    period: "monthly",
                  })
                }
                className={`rounded-xl border-2 p-4 transition-all ${
                  formData.period === "monthly"
                    ? "!border-orange-400 !bg-orange-50"
                    : "!border-gray-200 !bg-white hover:!border-gray-300"
                }`}
              >
                <div className="text-sm text-gray-800">Theo tháng</div>
              </button>
            </div>
          </div>

          {/* Ngày bắt đầu */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-100">
                <Calendar className="h-3 w-3 text-purple-600" />
              </div>
              Ngày bắt đầu
              <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <p className="text-xs text-gray-500">
              {formData.period === "monthly"
                ? "Ngân sách sẽ tự động kết thúc vào cuối tháng"
                : "Ngân sách theo ngày sẽ kết thúc trong ngày được chọn"}
            </p>
          </div>

          {/* Action */}
          <div className="flex gap-3 border-t border-gray-100 pt-4">
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
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 px-6 py-3 text-white shadow-lg transition-all hover:from-orange-500 hover:to-rose-500 hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo ngân sách"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
