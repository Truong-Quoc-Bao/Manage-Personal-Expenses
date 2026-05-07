import axiosInstance from "./axiosInstance";

const USER_ID = "7cb96e5d-3cd9-40dc-ad99-635f08456301";

export const analyticsApi = {
  getCategorySummary: () =>
    axiosInstance.get(`/api/analytics/category_summary/${USER_ID}`),

  getCategorySummaryByMonth: (year: number, month: number) =>
    axiosInstance.get(`/api/analytics/category_summary/${USER_ID}/by_month`, {
      params: { year, month },
    }),

  getMonthlyReports: () =>
    axiosInstance.get(`/api/analytics/monthly_reports/${USER_ID}`),

  getRecentMonthlyReports: (limit = 6) =>
    axiosInstance.get(`/api/analytics/monthly_reports/${USER_ID}/recent`, {
      params: { limit },
    }),

  getSpendingTrends: () =>
    axiosInstance.get(`/api/analytics/spending_trends/${USER_ID}`),

  getTransactionsByDateRange: (from: string, to: string) =>
    axiosInstance.get(`/api/analytics/transactions/${USER_ID}/date_range`, {
      params: { from, to },
    }),
};
