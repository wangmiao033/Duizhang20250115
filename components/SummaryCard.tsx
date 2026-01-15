'use client';

import { Summary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardProps {
  summary: Summary;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-lg border border-green-200 dark:border-green-800">
        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
          总收入
        </div>
        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
          {formatCurrency(summary.totalIncome)}
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
        <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
          总支出
        </div>
        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
          {formatCurrency(summary.totalExpense)}
        </div>
      </div>

      <div className={`p-6 rounded-lg shadow-lg border ${
        summary.balance >= 0
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      }`}>
        <div className={`text-sm font-medium mb-1 ${
          summary.balance >= 0
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-orange-600 dark:text-orange-400'
        }`}>
          余额
        </div>
        <div className={`text-2xl font-bold ${
          summary.balance >= 0
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-orange-700 dark:text-orange-300'
        }`}>
          {formatCurrency(summary.balance)}
        </div>
      </div>
    </div>
  );
}
