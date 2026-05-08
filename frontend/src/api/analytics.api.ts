import axiosInstance from "./axiosInstance";

const USER_ID = "4f4b144d-e3f8-4e6b-9e32-408030a85698";

export const analyticsApi = {
  getMonthlyReports: () =>
    axiosInstance.get(`/api/analytics/monthly_reports/${USER_ID}`),

  getMonthlyReportByMonth: (year: number, month: number) =>
    axiosInstance.get(`/api/analytics/monthly_reports/${USER_ID}/by_month`, {
      params: { year, month },
    }),

  getRecentMonthlyReports: (limit = 6) =>
    axiosInstance.get(`/api/analytics/monthly_reports/${USER_ID}/recent`, {
      params: { limit },
    }),
};
