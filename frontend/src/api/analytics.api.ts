import axiosInstance from "./axiosInstance";

/** Analytics routes accept `me` as :userId; server resolves from JWT. */
const ANALYTICS_USER_SEGMENT = "me";

export const analyticsApi = {
  // ── User analytics ──
  getUserAnalytics: () =>
    axiosInstance.get(
      `/api/analytics/user_analytics/${ANALYTICS_USER_SEGMENT}`
    ),

  // ── Category summary ──
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

  // ── Dashboard cache ──
  getDashboardCache: () =>
    axiosInstance.get(
      `/api/analytics/dashboard_cache/${ANALYTICS_USER_SEGMENT}`
    ),

  getDashboardCacheByAccount: (accountId: string) =>
    axiosInstance.get(
      `/api/analytics/dashboard_cache/account/${accountId}`
    ),

  // ── Monthly reports ──
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

// ── Shared types reflecting MongoDB schemas ──
export type DashboardCacheSummary = {
  current_balance: number;
  monthly_income: number;
  monthly_expense: number;
  monthly_savings: number;
  savings_rate: number;
};

export type DashboardCacheRecentTx = {
  trans_id: string;
  description: string | null;
  amount: number;
  type: "income" | "expense";
  date: string;
  category_id: string;
};

export type DashboardCacheTopCategory = {
  category_id: string;
  category_name: string;
  total_amount: number;
};

export type DashboardCache = {
  _id?: string;
  user_id: string;
  account_id: string;
  summary: DashboardCacheSummary;
  top_categories: DashboardCacheTopCategory[];
  recent_transactions: DashboardCacheRecentTx[];
  streak?: { saving_months?: number; unit?: string };
  expires_at?: string;
  top_account_id?: string | null;
};

// ── user_analytics (one aggregated document per user) ──
export type UserAnalyticsTopCategory = {
  category_id: string;
  category_name: string;
  total_amount: number;
};

export type UserAnalyticsCurrentMonth = {
  year?: number;
  month?: number;
  income?: number;
  expense?: number;
  savings?: number;
  savings_rate?: number;
};

export type UserAnalyticsBudgetAlertItem = {
  category_id: string;
  category_name: string;
  budget_limit: number;
  current_spent: number;
  percent_used: number;
  status: "ok" | "warning" | "critical" | "exceeded";
  alerted_at?: string | null;
};

export type UserAnalyticsGoal = {
  goal_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: "in_progress" | "completed" | "exceeded" | "failed";
  note?: string | null;
};

export type UserAnalytics = {
  _id?: string;
  user_id?: string;
  display_name?: string;
  account_id?: string[];
  total_income?: number;
  total_expense?: number;
  current_balance?: number;
  current_month?: UserAnalyticsCurrentMonth;
  top_categories?: UserAnalyticsTopCategory[];
  ai_insights?: {
    generated?: boolean;
    content?: string | null;
    generated_at?: string | null;
  };
  budget_alert?: {
    enabled?: boolean;
    alerts?: UserAnalyticsBudgetAlertItem[];
    last_checked?: string | null;
  };
  goal_tracking?: { goals?: UserAnalyticsGoal[] };
  streak?: { saving_months?: number; unit?: string };
  updated_at?: string;
};
