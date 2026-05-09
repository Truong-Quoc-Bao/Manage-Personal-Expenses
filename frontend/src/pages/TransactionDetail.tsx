import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  Tag,
  FileText,
  StickyNote,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { transactionsApi } from "@/api/transaction.api";
import type { TransactionResponse } from "@/types/transaction";
import { EditTransactionModal } from "@/components/modals/EditTransactionModal";
import { DeleteTransactionModal } from "@/components/modals/DeleteTransactionModal";

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionResponse | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionResponse | null>(null);

  const fetchTransaction = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await transactionsApi.getTransactionById(id);
      setTransaction(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải giao dịch";
      setError(message);
      toast.error("Không thể tải thông tin giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const handleUpdated = () => {
    setEditingTransaction(null);
    fetchTransaction();
    toast.success("Cập nhật giao dịch thành công!");
  };

  const handleDeleted = () => {
    setDeletingTransaction(null);
    navigate("/transactions");
    toast.success("Đã xóa giao dịch");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-500">Đang tải giao dịch...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div>
            <p className="mb-1 text-lg font-medium text-gray-900">
              Không tìm thấy giao dịch
            </p>
            <p className="text-sm text-gray-500">
              {error ?? "Giao dịch không tồn tại hoặc đã bị xóa"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="inline-flex items-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const isIncome = transaction.transactionType === "Income";

  return (
    <>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="mb-3 inline-flex items-center gap-2 rounded-xl !bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:!bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết giao dịch
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingTransaction(transaction)}
              className="inline-flex items-center gap-2 rounded-xl !bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:!bg-amber-100"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => setDeletingTransaction(transaction)}
              className="inline-flex items-center gap-2 rounded-xl !bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:!bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </div>

        {/* Amount Banner */}
        <div
          className={`mb-6 overflow-hidden rounded-2xl shadow-lg ${
            isIncome
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-orange-400 to-rose-400"
          }`}
        >
          <div className="px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                {isIncome ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                {isIncome ? "Thu nhập" : "Chi tiêu"}
              </span>
            </div>
            <p className="text-4xl font-bold text-white">
              {isIncome ? "+" : "-"}
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
        </div>

        {/* Details Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          <div className="divide-y divide-gray-100 px-8">
            <DetailRow
              icon={<Calendar className="h-5 w-5 text-orange-500" />}
              label="Ngày giao dịch"
              value={new Date(transaction.date).toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />

            <DetailRow
              icon={<Tag className="h-5 w-5 text-purple-500" />}
              label="Danh mục"
              value={
                transaction.categoryName ? (
                  <span className="inline-flex items-center gap-2">
                    {transaction.categoryColor && (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: transaction.categoryColor,
                        }}
                      />
                    )}
                    {transaction.categoryName}
                  </span>
                ) : (
                  <span className="text-gray-400">Không danh mục</span>
                )
              }
            />

            <DetailRow
              icon={<Wallet className="h-5 w-5 text-blue-500" />}
              label="Tài khoản"
              value={
                transaction.accountName ?? (
                  <span className="text-gray-400">—</span>
                )
              }
            />

            <DetailRow
              icon={<FileText className="h-5 w-5 text-gray-500" />}
              label="Mô tả"
              value={
                transaction.description ?? (
                  <span className="text-gray-400">Không có mô tả</span>
                )
              }
            />

            <DetailRow
              icon={<StickyNote className="h-5 w-5 text-yellow-500" />}
              label="Ghi chú"
              value={
                transaction.note ?? (
                  <span className="text-gray-400">Không có ghi chú</span>
                )
              }
            />

            <DetailRow
              icon={<Hash className="h-5 w-5 text-gray-400" />}
              label="Mã giao dịch"
              value={
                <span className="font-mono text-sm text-gray-500">
                  {transaction.transId}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deletingTransaction && (
        <DeleteTransactionModal
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-5">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="mb-1 text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
