export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  income: number;
  expense: number;
  total: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}
