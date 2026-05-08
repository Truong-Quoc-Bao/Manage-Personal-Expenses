import axiosInstance from "./axiosInstance";

/** Analytics routes accept `me` as :userId; server resolves from JWT. */
const ANALYTICS_USER_SEGMENT = "me";

export const analyticsApi = {
  getMonthlyReports: () =>
    axiosInstance.get(
      `/api/analytics/monthly_reports/${ANALYTICS_USER_SEGMENT}`
    ),

  getMonthlyReportByMonth: (year: number, month: number) =>
    axiosInstance.get(
      `/api/analytics/monthly_reports/${ANALYTICS_USER_SEGMENT}/by_month`,
      {
        params: { year, month },
      }
    ),

  getRecentMonthlyReports: (limit = 6) =>
    axiosInstance.get(
      `/api/analytics/monthly_reports/${ANALYTICS_USER_SEGMENT}/recent`,
      {
        params: { limit },
      }
    ),
};
