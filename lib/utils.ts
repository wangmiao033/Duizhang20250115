import { Transaction, Summary, CategorySummary, MonthlySummary } from '@/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN');
};

export const calculateSummary = (transactions: Transaction[]): Summary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

export const calculateCategorySummary = (transactions: Transaction[]): CategorySummary[] => {
  const categoryMap = new Map<string, { income: number; expense: number }>();
  
  transactions.forEach(t => {
    if (!categoryMap.has(t.category)) {
      categoryMap.set(t.category, { income: 0, expense: 0 });
    }
    const category = categoryMap.get(t.category)!;
    if (t.type === 'income') {
      category.income += t.amount;
    } else {
      category.expense += t.amount;
    }
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, amounts]) => ({
      category,
      income: amounts.income,
      expense: amounts.expense,
      total: amounts.income - amounts.expense,
    }))
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
};

export const calculateMonthlySummary = (transactions: Transaction[]): MonthlySummary[] => {
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  
  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { income: 0, expense: 0 });
    }
    const monthData = monthlyMap.get(month)!;
    if (t.type === 'income') {
      monthData.income += t.amount;
    } else {
      monthData.expense += t.amount;
    }
  });
  
  return Array.from(monthlyMap.entries())
    .map(([month, amounts]) => ({
      month,
      income: amounts.income,
      expense: amounts.expense,
      balance: amounts.income - amounts.expense,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
};

export const filterByDateRange = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] => {
  return transactions.filter(t => {
    const date = t.date;
    return date >= startDate && date <= endDate;
  });
};

export const exportToCSV = (transactions: Transaction[]): void => {
  const headers = ['日期', '类型', '类别', '金额', '描述'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? '收入' : '支出',
    t.category,
    t.amount.toString(),
    t.description,
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `对账单_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
