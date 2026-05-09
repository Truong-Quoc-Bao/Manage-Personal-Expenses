import axiosInstance from "./axiosInstance";

/** Analytics routes accept `me` as :userId; server resolves from JWT. */
const ANALYTICS_USER_SEGMENT = "me";

export const analyticsApi = {
  getUserAnalytics: () =>
    axiosInstance.get(
      `/api/analytics/user_analytics/${ANALYTICS_USER_SEGMENT}`
    ),

  getCategorySummary: () =>
    axiosInstance.get(
      `/api/analytics/category_summary/${ANALYTICS_USER_SEGMENT}`
    ),

  getCategorySummaryByMonth: (year: number, month: number) =>
    axiosInstance.get(
      `/api/analytics/category_summary/${ANALYTICS_USER_SEGMENT}/by_month`,
      { params: { year, month } }
    ),

  getOverBudgetCategories: () =>
    axiosInstance.get(
      `/api/analytics/category_summary/${ANALYTICS_USER_SEGMENT}/over_budget`
    ),

  getMonthlyReports: () =>
    axiosInstance.get(
      `/api/analytics/monthly_reports/${ANALYTICS_USER_SEGMENT}`
    ),

  getMonthlyReportByMonth: (year: number, month: number) =>
    axiosInstance.get(
      `/api/analytics/monthly_reports/${ANALYTICS_USER_SEGMENT}/by_month`,
      { params: { year, month } }
    ),

  getRecentMonthlyReports: (limit = 6) =>
    axiosInstance.get(
      `/api/analytics/monthly_reports/${ANALYTICS_USER_SEGMENT}/recent`,
      { params: { limit } }
    ),
};
