import axiosInstance from './axiosInstance';

export const transactionsApi = {
  getTransactions: () => axiosInstance.get('/api/transactions'),
  getTransactionById: (id: string) => axiosInstance.get(`/api/transactions/${id}`),
  createTransaction: (data: any) => axiosInstance.post('/api/transactions', data),
  updateTransaction: (id: string, data: any) => axiosInstance.put(`/api/transactions/${id}`, data),
  deleteTransaction: (id: string) => axiosInstance.delete(`/api/transactions/${id}`),
};