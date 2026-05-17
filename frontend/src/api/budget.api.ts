import axiosInstance from "./axiosInstance";

export type BudgetType = "limit" | "plan";
export type BudgetStatus = "limit" | "goal";

export interface BudgetPayload {
  title: string;
  categoryId: string;
  amountLimit: number;
  dateStart: string;
  dateEnd?: string | null;
  type?: BudgetType;
}

export const budgetApi = {
  getBudgets: () => axiosInstance.get("/api/budgets"),

  createBudget: (data: BudgetPayload) =>
    axiosInstance.post("/api/budgets", data),

  updateBudget: (budgetId: string, data: Partial<BudgetPayload>) =>
    axiosInstance.put(`/api/budgets/${budgetId}`, data),

  deleteBudget: (budgetId: string) =>
    axiosInstance.delete(`/api/budgets/${budgetId}`),
};
