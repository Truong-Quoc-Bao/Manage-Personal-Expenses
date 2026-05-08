import axiosInstance from "./axiosInstance";
import type {
  TransactionResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListParams,
  PaginatedResult,
  TransactionType,
} from "@/types/transaction";
import type { AxiosResponse } from "axios";

/** Backend uses System.Text.Json snake_case_lower; normalize to frontend camelCase. */
function normalizeTransactionType(raw: unknown): TransactionType {
  const s = String(raw ?? "").trim();
  if (!s) return "Expense";
  const lower = s.toLowerCase();
  if (lower === "income") return "Income";
  if (lower === "expense") return "Expense";
  return s as TransactionType;
}

function pick(
  row: Record<string, unknown>,
  snake: string,
  camel: string
): unknown {
  return row[snake] ?? row[camel];
}

export function mapTransactionResponse(
  raw: Record<string, unknown>
): TransactionResponse {
  const transId = pick(raw, "trans_id", "transId");
  const dateVal = pick(raw, "date", "date");
  let dateStr: string;
  if (typeof dateVal === "string") dateStr = dateVal;
  else if (dateVal != null) dateStr = new Date(dateVal as string | number).toISOString();
  else dateStr = "";

  return {
    transId: transId != null ? String(transId) : "",
    accountId: String(pick(raw, "account_id", "accountId") ?? ""),
    accountName: (pick(raw, "account_name", "accountName") as string | null) ?? null,
    categoryId:
      pick(raw, "category_id", "categoryId") != null
        ? String(pick(raw, "category_id", "categoryId"))
        : null,
    categoryName:
      (pick(raw, "category_name", "categoryName") as string | null) ?? null,
    categoryColor:
      (pick(raw, "category_color", "categoryColor") as string | null) ?? null,
    categoryIconCode:
      (pick(raw, "category_icon_code", "categoryIconCode") as string | null) ??
      null,
    amount: Number(pick(raw, "amount", "amount") ?? 0),
    transactionType: normalizeTransactionType(
      pick(raw, "transaction_type", "transactionType")
    ),
    description: (pick(raw, "description", "description") as string | null) ?? null,
    date: dateStr,
    note: (pick(raw, "note", "note") as string | null) ?? null,
  };
}

function mapPaginatedTransactions(
  data: Record<string, unknown>
): PaginatedResult<TransactionResponse> {
  const itemsRaw = (data.items ?? data.Items ?? []) as unknown[];
  return {
    items: itemsRaw.map((item) =>
      mapTransactionResponse(item as Record<string, unknown>)
    ),
    totalCount: Number(data.total_count ?? data.totalCount ?? 0),
    page: Number(data.page ?? 1),
    pageSize: Number(data.page_size ?? data.pageSize ?? 10),
    totalPages: Number(data.total_pages ?? data.totalPages ?? 0),
  };
}

export const transactionsApi = {
  getTransactions: (params?: TransactionListParams) =>
    axiosInstance
      .get("/api/transactions", {
        params: { include_details: true, ...params },
      })
      .then(
        (res): AxiosResponse<PaginatedResult<TransactionResponse>> => ({
          ...res,
          data: mapPaginatedTransactions(res.data as Record<string, unknown>),
        })
      ),

  getTransactionById: (id: string) =>
    axiosInstance
      .get(`/api/transactions/${id}`, {
        params: { include_details: true },
      })
      .then(
        (res): AxiosResponse<TransactionResponse> => ({
          ...res,
          data: mapTransactionResponse(res.data as Record<string, unknown>),
        })
      ),

  createTransaction: (data: CreateTransactionRequest) =>
    axiosInstance.post("/api/transactions", data).then(
      (res): AxiosResponse<TransactionResponse> => ({
        ...res,
        data: mapTransactionResponse(res.data as Record<string, unknown>),
      })
    ),

  updateTransaction: (id: string, data: UpdateTransactionRequest) =>
    axiosInstance.put(`/api/transactions/${id}`, data).then(
      (res): AxiosResponse<TransactionResponse> => ({
        ...res,
        data: mapTransactionResponse(res.data as Record<string, unknown>),
      })
    ),

  deleteTransaction: (id: string) =>
    axiosInstance.delete(`/api/transactions/${id}`),
};
