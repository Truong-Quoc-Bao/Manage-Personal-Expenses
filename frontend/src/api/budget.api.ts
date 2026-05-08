import axiosInstance from "./axiosInstance";

export const budgetApi = {
  getBudgets: () => axiosInstance.get("/api/budgets"),

  createBudget: (data: {
    title: string;
    categoryId: string;
    amountLimit: number;
    dateStart: string;
  }) => axiosInstance.post("/api/budgets", data),

  updateBudget: (budgetId: string, data: any) =>
    axiosInstance.put(`/api/budgets/${budgetId}`, data),

  deleteBudget: (budgetId: string) =>
    axiosInstance.delete(`/api/budgets/${budgetId}`),
};
