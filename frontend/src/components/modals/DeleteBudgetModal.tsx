import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { budgetApi } from "../../api/budget.api";

type Budget = {
  budget_id: string;
  title?: string | null;
  amount_limit: number | string;
  current_amount?: number | string | null;
  category_id?: string | null;
  note?: string | null;
};

interface DeleteBudgetModalProps {
  budget: Budget;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteBudgetModal({
  budget,
  onClose,
  onDeleted,
}: DeleteBudgetModalProps) {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number | string | null | undefined) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount || 0));
  };

  const handleDelete = async () => {
    if (!budget.budget_id) {
      toast.error("Không tìm thấy budgetId để xóa");
      return;
    }

    try {
      setLoading(true);

      await budgetApi.deleteBudget(budget.budget_id);

      toast.success("Đã xóa ngân sách thành công!");

      if (onDeleted) {
        onDeleted();
      }

      onClose();
    } catch (error) {
      console.error("Delete budget failed:", error);
      toast.error("Xóa ngân sách thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Xác nhận xóa
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

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div>
              <p className="text-sm text-red-800">
                Bạn có chắc chắn muốn xóa ngân sách này không?
              </p>
              <p className="mt-1 text-xs text-red-600">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl !bg-gradient-to-br !from-orange-400 !to-amber-400 text-xl">
                💰
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {budget.title || "Ngân sách"}
                </p>
                <p className="text-sm text-gray-500">
                  {budget.note || budget.category_id || "Chưa có danh mục"}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Ngân sách: {formatCurrency(budget.amount_limit)}</p>
              <p>Đã chi: {formatCurrency(budget.current_amount)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl !bg-gray-100 px-6 py-3 text-gray-700 transition-colors hover:!bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 rounded-xl !bg-red-500 px-6 py-3 text-white shadow-lg transition-all hover:!bg-red-600 disabled:opacity-50"
            >
              {loading ? "Đang xóa..." : "Xóa ngân sách"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
