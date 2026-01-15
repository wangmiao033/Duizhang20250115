import { Transaction } from '@/types';

const STORAGE_KEY = 'duizhang_transactions';

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const updateTransaction = (id: string, updated: Transaction): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const importTransactions = (transactions: Transaction[]): void => {
  const existing = getTransactions();
  const merged = [...existing, ...transactions];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
};

export const exportToJSON = (): string => {
  const transactions = getTransactions();
  return JSON.stringify(transactions, null, 2);
};

export const importFromJSON = (json: string): void => {
  try {
    const transactions = JSON.parse(json) as Transaction[];
    if (Array.isArray(transactions)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  } catch (error) {
    throw new Error('无效的 JSON 格式');
  }
};
