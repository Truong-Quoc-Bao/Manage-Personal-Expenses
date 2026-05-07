import { useEffect, useState } from "react";
import { X, Calendar, DollarSign, Tag } from "lucide-react";
import { toast } from "sonner";
import { categoryApi } from "../../api/category.api";
import { budgetApi } from "../../api/budget.api";

type Category = {
  category_id: string;
  category_name: string;
  type: "income" | "expense";
  color?: string;
};

type Budget = {
  budget_id: string;
  category_id?: string | null;
  amount_limit: number | string;
  current_amount?: number | string | null;
  date_start?: string | null;
};

interface EditBudgetModalProps {
  budget: Budget;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditBudgetModal({
  budget,
  onClose,
  onUpdated,
}: EditBudgetModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: budget.category_id || "",
    amount: String(budget.amount_limit || ""),
    dateStart: budget.date_start ? budget.date_start.split("T")[0] : "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();

        const expenseCategories = (res.data?.data || []).filter(
          (cat: Category) => cat.type === "expense"
        );

        setCategories(expenseCategories);

        if (!formData.categoryId && expenseCategories.length > 0) {
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

    const amount = Number(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Số tiền không hợp lệ!");
      return;
    }

    if (!formData.dateStart) {
      toast.error("Vui lòng chọn ngày bắt đầu!");
      return;
    }

    try {
      setLoading(true);

      await budgetApi.updateBudget(budget.budget_id, {
        categoryId: formData.categoryId,
        amountLimit: amount,
        dateStart: `${formData.dateStart}T00:00:00.000Z`,
      });

      toast.success("Cập nhật ngân sách thành công!");

      if (onUpdated) {
        onUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Update budget failed:", error);
      toast.error("Cập nhật ngân sách thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const spent = Number(budget.current_amount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Chỉnh sửa ngân sách
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg !bg-transparent p-2 transition-colors hover:!bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-140px)] space-y-5 overflow-y-auto p-6"
        >
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Danh mục <span className="text-red-500">*</span>
            </label>

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
                  <div className="truncate text-sm font-medium text-gray-800">
                    {cat.category_name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100">
                <DollarSign className="h-3 w-3 text-green-600" />
              </div>
              Số tiền ngân sách <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-100">
                <Calendar className="h-3 w-3 text-purple-600" />
              </div>
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              value={formData.dateStart}
              onChange={(e) =>
                setFormData({ ...formData, dateStart: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Đã chi:</strong>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(spent)}
            </p>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl !bg-gray-100 px-6 py-3 text-gray-700 transition-colors hover:!bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 text-white shadow-lg transition-all hover:!from-orange-500 hover:!to-rose-500 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
