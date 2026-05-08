export type TransactionType = "Income" | "Expense";

export interface TransactionResponse {
  transId: string;
  accountId: string;
  accountName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIconCode: string | null;
  amount: number;
  transactionType: TransactionType;
  description: string | null;
  date: string;
  note: string | null;
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  transactionType: TransactionType;
  description?: string;
  date: string;
  note?: string;
}

export interface UpdateTransactionRequest {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  transactionType: TransactionType;
  description?: string;
  date: string;
  note?: string;
}

export interface TransactionListParams {
  category_id?: string;
  account_id?: string;
  transaction_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  include_details?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
