import axiosInstance from './axiosInstance';
import type {
  TransactionResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListParams,
} from '@/types/transaction';

export const transactionsApi = {
  getTransactions: (params?: TransactionListParams) =>
    axiosInstance.get<TransactionResponse[]>('/api/transactions', { params }),

  getTransactionById: (id: string, params?: { include_category?: boolean }) =>
    axiosInstance.get<TransactionResponse>(`/api/transactions/${id}`, { params }),

  createTransaction: (data: CreateTransactionRequest) =>
    axiosInstance.post<TransactionResponse>('/api/transactions', data),

  updateTransaction: (id: string, data: UpdateTransactionRequest) =>
    axiosInstance.put<TransactionResponse>(`/api/transactions/${id}`, data),

  deleteTransaction: (id: string) =>
    axiosInstance.delete(`/api/transactions/${id}`),
};
