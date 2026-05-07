// Mock data store - In real app, this would be replaced with actual state management (Redux, Zustand, etc.)

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface Account {
  id: number;
  name: string;
  balance: number;
  type: string;
  icon: string;
  currency: string;
}

export interface Transaction {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  account: string;
  note?: string;
}

export interface Budget {
  id: number;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: "daily" | "monthly";
  startDate: string;
  endDate: string;
  icon: string;
  color: string;
}

// Initial user
let currentUser: User = {
  id: 1,
  name: "Nguyễn Văn A",
  email: "user@example.com",
  phone: "",
  bio: "",
};

// Initial accounts
let accounts: Account[] = [
  {
    id: 1,
    name: "Ví tiền mặt",
    balance: 2500000,
    type: "cash",
    icon: "💵",
    currency: "VND",
  },
  {
    id: 2,
    name: "Techcombank",
    balance: 18250000,
    type: "bank",
    icon: "🏦",
    currency: "VND",
  },
  {
    id: 3,
    name: "MoMo",
    balance: 5000000,
    type: "ewallet",
    icon: "📱",
    currency: "VND",
  },
  {
    id: 4,
    name: "VietinBank",
    balance: 3500000,
    type: "bank",
    icon: "🏦",
    currency: "VND",
  },
];

// Initial transactions
let transactions: Transaction[] = [
  {
    id: 1,
    type: "expense",
    category: "Ăn uống",
    amount: 150000,
    date: "2026-03-09",
    description: "Ăn trưa với bạn",
    account: "Ví tiền mặt",
  },
  {
    id: 2,
    type: "income",
    category: "Lương",
    amount: 15000000,
    date: "2026-03-05",
    description: "Lương tháng 3",
    account: "Techcombank",
  },
  {
    id: 3,
    type: "expense",
    category: "Di chuyển",
    amount: 50000,
    date: "2026-03-08",
    description: "Xăng xe",
    account: "Ví tiền mặt",
  },
  {
    id: 4,
    type: "expense",
    category: "Giải trí",
    amount: 200000,
    date: "2026-03-07",
    description: "Xem phim",
    account: "MoMo",
  },
  {
    id: 5,
    type: "expense",
    category: "Mua sắm",
    amount: 500000,
    date: "2026-03-06",
    description: "Quần áo",
    account: "Techcombank",
  },
  {
    id: 6,
    type: "expense",
    category: "Ăn uống",
    amount: 85000,
    date: "2026-03-05",
    description: "Cà phê sáng",
    account: "Ví tiền mặt",
  },
  {
    id: 7,
    type: "expense",
    category: "Hóa đơn",
    amount: 450000,
    date: "2026-03-04",
    description: "Tiền điện",
    account: "Techcombank",
  },
  {
    id: 8,
    type: "income",
    category: "Thưởng",
    amount: 2000000,
    date: "2026-03-03",
    description: "Thưởng dự án",
    account: "Techcombank",
  },
];

// Initial budgets
let budgets: Budget[] = [
  {
    id: 1,
    name: "Ngân sách ăn uống tháng 5",
    category: "Ăn uống",
    amount: 3000000,
    spent: 235000,
    period: "monthly",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    icon: "🍔",
    color: "orange",
  },
  {
    id: 2,
    name: "Di chuyển tháng 5",
    category: "Di chuyển",
    amount: 1000000,
    spent: 50000,
    period: "monthly",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    icon: "🚗",
    color: "blue",
  },
  {
    id: 3,
    name: "Giải trí tháng 5",
    category: "Giải trí",
    amount: 2000000,
    spent: 200000,
    period: "monthly",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    icon: "🎮",
    color: "purple",
  },
];

// Listeners for changes
type UserListener = (user: User) => void;
type AccountListener = (accounts: Account[]) => void;
type TransactionListener = (transactions: Transaction[]) => void;
type BudgetListener = (budgets: Budget[]) => void;

const userListeners: Set<UserListener> = new Set();
const accountListeners: Set<AccountListener> = new Set();
const transactionListeners: Set<TransactionListener> = new Set();
const budgetListeners: Set<BudgetListener> = new Set();

// User management
export const userStore = {
  get: () => ({ ...currentUser }),

  update: (data: Partial<User>) => {
    currentUser = { ...currentUser, ...data };
    userListeners.forEach((listener) => listener(currentUser));
  },

  subscribe: (listener: UserListener) => {
    userListeners.add(listener);
    return () => userListeners.delete(listener);
  },
};

// Account management
export const accountStore = {
  getAll: () => [...accounts],

  add: (account: Account) => {
    accounts = [...accounts, account];
    accountListeners.forEach((listener) => listener(accounts));
  },

  update: (id: number, data: Partial<Account>) => {
    accounts = accounts.map((acc) =>
      acc.id === id ? { ...acc, ...data } : acc
    );
    accountListeners.forEach((listener) => listener(accounts));
  },

  remove: (id: number) => {
    accounts = accounts.filter((acc) => acc.id !== id);
    accountListeners.forEach((listener) => listener(accounts));
  },

  subscribe: (listener: AccountListener) => {
    accountListeners.add(listener);
    return () => accountListeners.delete(listener);
  },
};

// Transaction management
export const transactionStore = {
  getAll: () => [...transactions],

  add: (transaction: Transaction) => {
    transactions = [transaction, ...transactions];
    transactionListeners.forEach((listener) => listener(transactions));
  },

  update: (id: number, data: Partial<Transaction>) => {
    transactions = transactions.map((t) =>
      t.id === id ? { ...t, ...data } : t
    );
    transactionListeners.forEach((listener) => listener(transactions));
  },

  remove: (id: number) => {
    transactions = transactions.filter((t) => t.id !== id);
    transactionListeners.forEach((listener) => listener(transactions));
  },

  subscribe: (listener: TransactionListener) => {
    transactionListeners.add(listener);
    return () => transactionListeners.delete(listener);
  },
};

// Budget management
export const budgetStore = {
  getAll: () => [...budgets],

  add: (budget: Budget) => {
    budgets = [...budgets, budget];
    budgetListeners.forEach((listener) => listener(budgets));
  },

  update: (id: number, data: Partial<Budget>) => {
    budgets = budgets.map((b) => (b.id === id ? { ...b, ...data } : b));
    budgetListeners.forEach((listener) => listener(budgets));
  },

  remove: (id: number) => {
    budgets = budgets.filter((b) => b.id !== id);
    budgetListeners.forEach((listener) => listener(budgets));
  },

  subscribe: (listener: BudgetListener) => {
    budgetListeners.add(listener);
    return () => budgetListeners.delete(listener);
  },
};
