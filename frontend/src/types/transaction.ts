export type TransactionType = "Income" | "Expense";

export interface TransactionResponse {
  transId: string;
  accountId: string;
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
  include_category?: boolean;
}
