import { useEffect, useMemo, useState } from "react";
import { X, Calendar, DollarSign, Tag, Target, Wallet } from "lucide-react";
import { toast } from "sonner";
import { categoryApi } from "../../api/category.api";
import { budgetApi, type BudgetType } from "../../api/budget.api";

type Category = {
  category_id: string;
  category_name: string;
  type: "income" | "expense";
  color?: string;
};

type Budget = {
  budget_id: string;
  title?: string | null;
  category_id?: string | null;
  amount_limit: number | string;
  current_amount?: number | string | null;
  date_start?: string | null;
  date_end?: string | null;
  type?: string | null;
  status?: string | null;
  status_active?: boolean | null;
};

interface EditBudgetModalProps {
  budget: Budget;
  onClose: () => void;
  onUpdated?: () => void;
}

type BudgetKind = "limit" | "goal";

const KIND_TO_TYPE: Record<BudgetKind, BudgetType> = {
  limit: "limit",
  goal: "plan",
};

const deriveKind = (budget: Budget): BudgetKind => {
  if (budget.status === "goal" || budget.type === "plan") return "goal";
  return "limit";
};

export function EditBudgetModal({
  budget,
  onClose,
  onUpdated,
}: EditBudgetModalProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: budget.title || "",
    kind: deriveKind(budget),
    categoryId: budget.category_id || "",
    amount: String(budget.amount_limit || ""),
    dateStart: budget.date_start ? budget.date_start.split("T")[0] : "",
    dateEnd: budget.date_end ? budget.date_end.split("T")[0] : "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();
        setAllCategories(res.data?.data || []);
      } catch (error) {
        console.error("Get categories failed:", error);
        toast.error("Không thể tải danh mục!");
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const wanted = formData.kind === "limit" ? "expense" : "income";
    return allCategories.filter((c) => c.type === wanted);
  }, [allCategories, formData.kind]);

  useEffect(() => {
    setFormData((prev) => {
      const stillValid = filteredCategories.some(
        (c) => c.category_id === prev.categoryId,
      );
      if (stillValid) return prev;
      return {
        ...prev,
        categoryId: filteredCategories[0]?.category_id ?? "",
      };
    });
  }, [filteredCategories]);

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
        title: formData.title,
        categoryId: formData.categoryId,
        amountLimit: amount,
        dateStart: `${formData.dateStart}T00:00:00.000Z`,
        dateEnd: formData.dateEnd
          ? `${formData.dateEnd}T23:59:59.999Z`
          : undefined,
        type: KIND_TO_TYPE[formData.kind],
      });

      toast.success("Cập nhật ngân sách thành công!");
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Update budget failed:", error);
      toast.error("Cập nhật ngân sách thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const spent = Number(budget.current_amount || 0);
  const isGoal = formData.kind === "goal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isGoal ? "Chỉnh sửa mục tiêu" : "Chỉnh sửa ngân sách"}
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
          {/* KIND */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Loại <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, kind: "limit" })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  formData.kind === "limit"
                    ? "!border-orange-400 !bg-orange-50 text-orange-700"
                    : "!border-gray-200 !bg-white text-gray-700 hover:!border-gray-300"
                }`}
              >
                <Wallet className="h-4 w-4" />
                Hạn mức chi
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, kind: "goal" })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  formData.kind === "goal"
                    ? "!border-emerald-400 !bg-emerald-50 text-emerald-700"
                    : "!border-gray-200 !bg-white text-gray-700 hover:!border-gray-300"
                }`}
              >
                <Target className="h-4 w-4" />
                Mục tiêu thu
              </button>
            </div>
          </div>

          {/* TITLE */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-100">
                <Tag className="h-3 w-3 text-blue-600" />
              </div>
              {isGoal ? "Tên mục tiêu" : "Tên ngân sách"}
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder={
                isGoal ? "VD: Mục tiêu tiết kiệm 10 triệu" : "VD: Ngân sách ăn uống tháng 5"
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Danh mục <span className="text-red-500">*</span>
            </label>

            {filteredCategories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 px-3 py-3 text-center text-sm text-gray-400">
                {isGoal ? "Không có danh mục thu nhập" : "Không có danh mục chi tiêu"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredCategories.map((cat) => (
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
                        ? isGoal
                          ? "!border-emerald-400 !bg-emerald-50"
                          : "!border-orange-400 !bg-orange-50"
                        : "!border-gray-200 !bg-white hover:!border-gray-300"
                    }`}
                  >
                    <div className="truncate text-sm font-medium text-gray-800">
                      {cat.category_name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AMOUNT */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100">
                <DollarSign className="h-3 w-3 text-green-600" />
              </div>
              {isGoal ? "Số tiền mục tiêu" : "Số tiền ngân sách"}{" "}
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
              min="0"
              step="1000"
            />
          </div>

          {/* DATE START */}
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
                setFormData({
                  ...formData,
                  dateStart: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* DATE END (optional) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-100">
                <Calendar className="h-3 w-3 text-purple-600" />
              </div>
              Ngày kết thúc{" "}
              <span className="text-xs font-normal text-gray-400">(tuỳ chọn)</span>
            </label>

            <input
              type="date"
              value={formData.dateEnd}
              min={formData.dateStart}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateEnd: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-500">
              Bỏ trống nếu muốn ngân sách luôn được áp dụng.
            </p>
          </div>

          {/* SPENT */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>{isGoal ? "Đã đạt:" : "Đã chi:"}</strong>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(spent)}
            </p>
          </div>

          {/* ACTION */}
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
              className={`flex-1 rounded-xl px-6 py-3 text-white shadow-lg transition-all disabled:opacity-50 ${
                isGoal
                  ? "!bg-gradient-to-r !from-emerald-400 !to-teal-400 hover:!from-emerald-500 hover:!to-teal-500"
                  : "!bg-gradient-to-r !from-orange-400 !to-rose-400 hover:!from-orange-500 hover:!to-rose-500"
              }`}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
