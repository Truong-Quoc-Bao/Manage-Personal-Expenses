import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingDown,
  Calendar,
  Target,
  Wallet,
  CheckCircle2,
  Clock,
  PauseCircle,
} from 'lucide-react';
import { budgetApi } from '../api/budget.api';
import { categoryApi } from '../api/category.api';
import { AddBudgetModal } from '../components/modals/AddBudgetModal';
import { EditBudgetModal } from '../components/modals/EditBudgetModal';
import { DeleteBudgetModal } from '../components/modals/DeleteBudgetModal';
import { toast } from 'sonner';

type BudgetKind = 'limit' | 'goal';

type Budget = {
  budget_id: string;
  title?: string | null;
  amount_limit: number | string;
  current_amount?: number | string | null;
  date?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  type?: string | null;
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

const getBudgetKind = (budget: Budget): BudgetKind => {
  if (budget.status === 'goal' || budget.type === 'plan') return 'goal';
  return 'limit';
};

// Mirrors the backend `computeStatusActive` so the UI stays correct even if the
// stored value gets stale between writes (e.g. user keeps the page open past
// date_end without a refetch).
const computeStatusActive = (
  dateStart?: string | null,
  dateEnd?: string | null,
  now: Date = new Date(),
): boolean => {
  if (!dateStart) return false;
  const start = new Date(dateStart);
  if (Number.isNaN(start.getTime())) return false;
  if (now < start) return false;

  if (dateEnd) {
    const end = new Date(dateEnd);
    if (!Number.isNaN(end.getTime()) && now > end) return false;
  }
  return true;
};

type ActiveState = 'active' | 'pending' | 'ended';

const resolveActiveState = (budget: Budget, now: Date = new Date()): ActiveState => {
  if (budget.date_start) {
    const start = new Date(budget.date_start);
    if (!Number.isNaN(start.getTime()) && now < start) return 'pending';
  }
  if (budget.date_end) {
    const end = new Date(budget.date_end);
    if (!Number.isNaN(end.getTime()) && now > end) return 'ended';
  }
  return 'active';
};

export function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'daily' | 'monthly'>('all');
  const [filterKind, setFilterKind] = useState<'all' | BudgetKind>('all');

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

  useEffect(() => {
    const handleAISync = async () => {
      console.log('🤖 Budgets: AI vừa ra lệnh cập nhật ngân sách!');

      const loader = toast.loading('Money Guard đang thiết lập ngân sách mới...');
      await fetchBudgets();
      toast.dismiss(loader);
      toast.success('Ngân sách đã được cập nhật!', {
        icon: '📊',
        description: 'AI đã tính toán lại các hạn mức chi tiêu.',
      });
    };

    window.addEventListener('money-guard-sync', handleAISync);
    return () => window.removeEventListener('money-guard-sync', handleAISync);
  }, [fetchBudgets]);

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
    const kind = getBudgetKind(budget);
    return `${kind === 'goal' ? 'Mục tiêu' : 'Ngân sách'} ${getCategoryName(budget.category_id)}`;
  };

  const getBudgetPeriod = (budget: Budget): 'daily' | 'monthly' => {
    if (!budget.date_start || !budget.date_end) return 'monthly';
    const start = new Date(budget.date_start);
    const end = new Date(budget.date_end);
    const diffDays = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 1 ? 'daily' : 'monthly';
  };

  const filteredBudgets = useMemo(
    () =>
      budgets.filter((budget) => {
        if (filterPeriod !== 'all' && getBudgetPeriod(budget) !== filterPeriod) return false;
        if (filterKind !== 'all' && getBudgetKind(budget) !== filterKind) return false;
        return true;
      }),
    [budgets, filterPeriod, filterKind],
  );

  const formatCurrency = (amount: number | string | null | undefined) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount || 0));

  const getProgressPercentage = (spent: number, amount: number) => {
    if (!amount || amount <= 0) return 0;
    return Math.min((spent / amount) * 100, 100);
  };

  const getProgressColor = (percentage: number, kind: BudgetKind) => {
    if (kind === 'goal') {
      if (percentage >= 100) return 'bg-emerald-500';
      if (percentage >= 70) return 'bg-teal-500';
      return 'bg-emerald-400';
    }
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const renderKindBadge = (kind: BudgetKind) =>
    kind === 'goal' ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <Target className="h-3 w-3" />
        Mục tiêu
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
        <Wallet className="h-3 w-3" />
        Hạn mức
      </span>
    );

  const renderActiveBadge = (state: ActiveState) => {
    if (state === 'active') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Đang áp dụng
        </span>
      );
    }
    if (state === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <Clock className="h-3 w-3" />
          Chưa bắt đầu
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        <PauseCircle className="h-3 w-3" />
        Đã kết thúc
      </span>
    );
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900">Ngân sách</h1>
            <p className="text-gray-600">
              Quản lý hạn mức chi tiêu và mục tiêu thu nhập của bạn
            </p>
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

        {/* Period filter */}
        <div className="mb-3 flex flex-wrap gap-3">
          {(['all', 'daily', 'monthly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPeriod(p)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                filterPeriod === p
                  ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white shadow-md'
                  : '!bg-white text-gray-700 hover:!bg-gray-50 border border-gray-200'
              }`}
            >
              {p === 'all' ? 'Tất cả chu kỳ' : p === 'daily' ? 'Theo ngày' : 'Theo tháng'}
            </button>
          ))}
        </div>

        {/* Kind filter */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFilterKind('all')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterKind === 'all'
                ? '!bg-gray-900 text-white shadow-md'
                : '!bg-white text-gray-700 hover:!bg-gray-50 border border-gray-200'
            }`}
          >
            Tất cả loại
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('limit')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterKind === 'limit'
                ? '!bg-orange-500 text-white shadow-md'
                : '!bg-white text-orange-700 hover:!bg-orange-50 border border-orange-200'
            }`}
          >
            <Wallet className="h-4 w-4" />
            Hạn mức chi
          </button>
          <button
            type="button"
            onClick={() => setFilterKind('goal')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterKind === 'goal'
                ? '!bg-emerald-500 text-white shadow-md'
                : '!bg-white text-emerald-700 hover:!bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Target className="h-4 w-4" />
            Mục tiêu thu
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
              const kind = getBudgetKind(budget);
              const isGoal = kind === 'goal';
              const spent = Number(budget.current_amount || 0);
              const amount = Number(budget.amount_limit || 0);
              const percentage = getProgressPercentage(spent, amount);
              const remaining = amount - spent;
              const isOverLimit = !isGoal && spent > amount;
              const goalReached = isGoal && spent >= amount && amount > 0;
              const activeState = resolveActiveState(budget);
              const isActive =
                typeof budget.status_active === 'boolean'
                  ? budget.status_active
                  : computeStatusActive(budget.date_start, budget.date_end);

              const cardAccent = isGoal
                ? 'before:bg-gradient-to-r before:from-emerald-400 before:to-teal-400'
                : 'before:bg-gradient-to-r before:from-orange-400 before:to-rose-400';

              const iconWrapper = isGoal
                ? '!bg-gradient-to-br !from-emerald-400 !to-teal-400'
                : '!bg-gradient-to-br !from-orange-400 !to-amber-400';

              return (
                <div
                  key={budget.budget_id}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition hover:shadow-xl before:absolute before:left-0 before:top-0 before:h-1 before:w-full ${cardAccent} ${
                    !isActive ? 'opacity-75' : ''
                  }`}
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconWrapper} text-2xl shadow-md`}
                    >
                      {isGoal ? '🎯' : '💰'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        {renderKindBadge(kind)}
                        {renderActiveBadge(activeState)}
                      </div>
                      <h3 className="truncate font-semibold text-gray-900">
                        {getBudgetTitle(budget)}
                      </h3>
                      <p className="truncate text-xs text-gray-500">
                        {getCategoryName(budget.category_id)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {isGoal ? 'Đã đạt' : 'Đã chi'}
                        </span>
                        <span
                          className={
                            isOverLimit
                              ? 'text-red-600'
                              : goalReached
                                ? 'text-emerald-600'
                                : 'text-gray-800'
                          }
                        >
                          {formatCurrency(spent)}
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full ${getProgressColor(
                            percentage,
                            kind,
                          )} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">{percentage.toFixed(0)}%</span>
                        <span className="text-gray-800">{formatCurrency(amount)}</span>
                      </div>
                    </div>

                    {isGoal ? (
                      goalReached ? (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="text-sm text-emerald-700">
                            Đã đạt mục tiêu!
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <Target className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="text-sm text-emerald-700">
                            Còn thiếu: {formatCurrency(Math.max(remaining, 0))}
                          </span>
                        </div>
                      )
                    ) : isOverLimit ? (
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
