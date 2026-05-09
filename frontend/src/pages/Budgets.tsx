import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import { budgetApi } from '../api/budget.api';
import { categoryApi } from '../api/category.api';
import { AddBudgetModal } from '../components/modals/AddBudgetModal';
import { EditBudgetModal } from '../components/modals/EditBudgetModal';
import { DeleteBudgetModal } from '../components/modals/DeleteBudgetModal';
import { toast } from 'sonner';

type Budget = {
  budget_id: string;
  title?: string | null;
  amount_limit: number | string;
  current_amount?: number | string | null;
  date?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  status?: string | null;
  status_active?: boolean | null;
  note?: string | null;
  category_id?: string | null;
};

type Category = {
  category_id: string;
  category_name: string;
  type: 'income' | 'expense';
  color?: string | null;
};

export function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'daily' | 'monthly'>('all');

  // ✅ BƯỚC 1: Dùng useCallback cho hàm fetch
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetRes, categoryRes] = await Promise.all([
        budgetApi.getBudgets(),
        categoryApi.getCategories(),
      ]);

      setBudgets(budgetRes.data?.data || []);
      setCategories(categoryRes.data?.data || []);

      console.log('💎 Budgets: Đã đồng bộ dữ liệu mới nhất từ Server');
    } catch (error) {
      console.error('Get budgets failed:', error);
      toast.error('Không thể cập nhật ngân sách');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ BƯỚC 2: "ĂNG-TEN" ĐÓN SÓNG TỪ AI CHAT
  useEffect(() => {
    const handleAISync = async () => {
      console.log('🤖 Budgets: AI vừa ra lệnh cập nhật ngân sách!');

      // Hiện thông báo đang xử lý
      const loader = toast.loading('Money Guard đang thiết lập ngân sách mới...');

      // Gọi hàm nạp lại dữ liệu
      await fetchBudgets();

      // Đổi thông báo sang thành công
      toast.dismiss(loader);
      toast.success('Ngân sách đã được cập nhật!', {
        icon: '📊',
        description: 'AI đã tính toán lại các hạn mức chi tiêu.',
      });
    };

    // Lắng nghe sự kiện từ FloatingChat.tsx
    window.addEventListener('money-guard-sync', handleAISync);

    return () => {
      window.removeEventListener('money-guard-sync', handleAISync);
    };
  }, [fetchBudgets]);

  // Load lần đầu khi vào trang
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const getCategoryName = (categoryId?: string | null) => {
    if (!categoryId) return 'Chưa có danh mục';

    const category = categories.find((cat) => cat.category_id === categoryId);

    return category?.category_name || 'Không tìm thấy danh mục';
  };

  const getBudgetTitle = (budget: Budget) => {
    if (budget.title && budget.title.trim()) return budget.title;
    return `Ngân sách ${getCategoryName(budget.category_id)}`;
  };

  const getBudgetPeriod = (budget: Budget): 'daily' | 'monthly' => {
    if (!budget.date_start || !budget.date_end) return 'monthly';

    const start = new Date(budget.date_start);
    const end = new Date(budget.date_end);

    const diffDays = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return diffDays <= 1 ? 'daily' : 'monthly';
  };

  const filteredBudgets = budgets.filter((budget) => {
    if (filterPeriod === 'all') return true;
    return getBudgetPeriod(budget) === filterPeriod;
  });

  const formatCurrency = (amount: number | string | null | undefined) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount || 0));
  };

  const getProgressPercentage = (spent: number, amount: number) => {
    if (!amount || amount <= 0) return 0;
    return Math.min((spent / amount) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatDate = (date?: string | null) => {
    if (!date) return 'Chưa có ngày';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900">Ngân sách</h1>
            <p className="text-gray-600">Quản lý và theo dõi ngân sách chi tiêu của bạn</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
          >
            <Plus className="h-5 w-5" />
            Tạo ngân sách
          </button>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setFilterPeriod('all')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterPeriod === 'all'
                ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md'
                : '!bg-white text-gray-700 hover:!bg-gray-50 border border-gray-200'
            }`}
          >
            Tất cả
          </button>

          <button
            type="button"
            onClick={() => setFilterPeriod('daily')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterPeriod === 'daily'
                ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md'
                : '!bg-white text-gray-700 hover:!bg-gray-50 border border-gray-200'
            }`}
          >
            Theo ngày
          </button>

          <button
            type="button"
            onClick={() => setFilterPeriod('monthly')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterPeriod === 'monthly'
                ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md'
                : '!bg-white text-gray-700 hover:!bg-gray-50 border border-gray-200'
            }`}
          >
            Theo tháng
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
            <p className="text-gray-500">Đang tải ngân sách...</p>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <TrendingDown className="h-8 w-8 text-gray-400" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-800">Chưa có ngân sách nào</h3>

            <p className="mb-6 text-gray-500">Tạo ngân sách đầu tiên để bắt đầu quản lý chi tiêu</p>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
            >
              <Plus className="h-5 w-5" />
              Tạo ngân sách
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBudgets.map((budget) => {
              const spent = Number(budget.current_amount || 0);
              const amount = Number(budget.amount_limit || 0);
              const percentage = getProgressPercentage(spent, amount);
              const isOverBudget = spent > amount;
              const remaining = amount - spent;

              return (
                <div
                  key={budget.budget_id}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition hover:shadow-xl"
                >
                  <div className="mb-4 flex items-start">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl !bg-gradient-to-br !from-orange-400 !to-amber-400 text-2xl shadow-md">
                        💰
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900">
                          {getBudgetTitle(budget)}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {getCategoryName(budget.category_id)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Đã chi</span>
                        <span className={isOverBudget ? 'text-red-600' : 'text-gray-800'}>
                          {formatCurrency(spent)}
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full ${getProgressColor(
                            percentage,
                          )} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">{percentage.toFixed(0)}%</span>
                        <span className="text-gray-800">{formatCurrency(amount)}</span>
                      </div>
                    </div>

                    {isOverBudget ? (
                      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                        <span className="text-sm text-red-600">
                          Vượt {formatCurrency(Math.abs(remaining))}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
                        <span className="text-sm text-green-600">
                          Còn lại: {formatCurrency(remaining)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(budget.date_start)} - {formatDate(budget.date_end)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingBudget(budget)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl !bg-gray-100 px-4 py-2.5 text-sm text-gray-700 transition hover:!bg-orange-100 hover:text-orange-600"
                    >
                      <Edit2 className="h-4 w-4" />
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingBudget(budget)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl !bg-red-50 px-4 py-2.5 text-sm text-red-600 transition hover:!bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBudgetModal onClose={() => setShowAddModal(false)} onCreated={fetchBudgets} />
      )}

      {editingBudget && (
        <EditBudgetModal
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
          onUpdated={fetchBudgets}
        />
      )}

      {deletingBudget && (
        <DeleteBudgetModal
          budget={deletingBudget}
          onClose={() => setDeletingBudget(null)}
          onDeleted={fetchBudgets}
        />
      )}
    </>
  );
}
