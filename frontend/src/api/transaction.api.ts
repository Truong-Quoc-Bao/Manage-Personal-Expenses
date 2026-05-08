import axiosInstance from './axiosInstance';
import type {
  TransactionResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListParams,
  PaginatedResult,
} from '@/types/transaction';

export const transactionsApi = {
  getTransactions: (params?: TransactionListParams) =>
    axiosInstance.get<PaginatedResult<TransactionResponse>>('/api/transactions', {
      params: { include_details: true, ...params },
    }),

  getTransactionById: (id: string) =>
    axiosInstance.get<TransactionResponse>(`/api/transactions/${id}`, {
      params: { include_details: true },
    }),

  createTransaction: (data: CreateTransactionRequest) =>
    axiosInstance.post<TransactionResponse>('/api/transactions', data),

  updateTransaction: (id: string, data: UpdateTransactionRequest) =>
    axiosInstance.put<TransactionResponse>(`/api/transactions/${id}`, data),

  deleteTransaction: (id: string) =>
    axiosInstance.delete(`/api/transactions/${id}`),
};
