import { X, Calendar, DollarSign, Tag, Target, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { categoryApi } from "../../api/category.api";
import { budgetApi, type BudgetType } from "../../api/budget.api";

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

type BudgetKind = "limit" | "goal";

const KIND_TO_TYPE: Record<BudgetKind, BudgetType> = {
  limit: "limit",
  goal: "plan",
};

export function AddBudgetModal({ onClose, onCreated }: AddBudgetModalProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    kind: "limit" as BudgetKind,
    categoryId: "",
    amount: "",
    period: "monthly" as "daily" | "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
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

  // Reset selected category when switching kind (its category list changes)
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
        dateEnd: formData.endDate
          ? `${formData.endDate}T23:59:59.999Z`
          : undefined,
        type: KIND_TO_TYPE[formData.kind],
      });

      toast.success(
        formData.kind === "goal"
          ? "Tạo mục tiêu thành công!"
          : "Tạo ngân sách thành công!",
      );

      onCreated?.();
      onClose();
    } catch (error) {
      console.error("Create budget failed:", error);
      toast.error("Tạo ngân sách thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const isGoal = formData.kind === "goal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200"
      >
        {/* Header (sticky) */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isGoal ? "Tạo mục tiêu mới" : "Tạo ngân sách mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg !bg-transparent p-1.5 text-gray-500 hover:!bg-gray-100 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Loại ngân sách */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
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
            <p className="text-xs text-gray-500">
              {isGoal
                ? "Mục tiêu: theo dõi tiến độ thu nhập / tiết kiệm cần đạt."
                : "Hạn mức: giới hạn số tiền có thể chi tiêu cho danh mục."}
            </p>
          </div>

          {/* Tên ngân sách */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100">
                <Tag className="h-3 w-3 text-blue-600" />
              </span>
              {isGoal ? "Tên mục tiêu" : "Tên ngân sách"}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={
                isGoal ? "VD: Mục tiêu tiết kiệm 10 triệu" : "VD: Ngân sách ăn uống tháng 5"
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Danh mục */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Danh mục <span className="text-red-500">*</span>
            </label>

            {filteredCategories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 px-3 py-3 text-center text-sm text-gray-400">
                {isGoal ? "Không có danh mục thu nhập" : "Không có danh mục chi tiêu"}
              </p>
            ) : (
              <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filteredCategories.map((cat) => {
                    const active = formData.categoryId === cat.category_id;
                    return (
                      <button
                        key={cat.category_id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, categoryId: cat.category_id })
                        }
                        className={`truncate rounded-lg border px-2.5 py-2 text-xs font-medium transition-all ${
                          active
                            ? isGoal
                              ? "!border-emerald-400 !bg-emerald-50 text-emerald-700"
                              : "!border-orange-400 !bg-orange-50 text-orange-700"
                            : "!border-gray-200 !bg-white text-gray-700 hover:!border-gray-300 hover:!bg-gray-50"
                        }`}
                        title={cat.category_name}
                      >
                        {cat.category_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Số tiền */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100">
                <DollarSign className="h-3 w-3 text-green-600" />
              </span>
              {isGoal ? "Số tiền mục tiêu" : "Số tiền ngân sách"}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-12 text-sm text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
                min="0"
                step="1000"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                VND
              </span>
            </div>
          </div>

          {/* Chu kỳ */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Chu kỳ</label>
            <div className="grid grid-cols-2 gap-2">
              {(["daily", "monthly"] as const).map((p) => {
                const active = formData.period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, period: p })}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "!border-orange-400 !bg-orange-50 text-orange-700"
                        : "!border-gray-200 !bg-white text-gray-700 hover:!border-gray-300"
                    }`}
                  >
                    {p === "daily" ? "Theo ngày" : "Theo tháng"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ngày bắt đầu */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100">
                <Calendar className="h-3 w-3 text-purple-600" />
              </span>
              Ngày bắt đầu
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <p className="text-xs text-gray-500">
              Khi tới ngày bắt đầu, trạng thái sẽ tự động chuyển sang "Đang áp dụng".
            </p>
          </div>

          {/* Ngày kết thúc (tùy chọn) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100">
                <Calendar className="h-3 w-3 text-purple-600" />
              </span>
              Ngày kết thúc
              <span className="text-xs font-normal text-gray-400">(tuỳ chọn)</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-500">
              Bỏ trống nếu muốn ngân sách luôn được áp dụng cho đến khi tự kết thúc theo
              chu kỳ tháng.
            </p>
          </div>
        </div>

        {/* Footer (sticky) */}
        <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl !bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:!bg-gray-200 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 ${
              isGoal
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                : "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
            }`}
          >
            {loading ? "Đang tạo..." : isGoal ? "Tạo mục tiêu" : "Tạo ngân sách"}
          </button>
        </div>
      </form>
    </div>
  );
}
