'use client';

import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AdvancedStatsProps {
  transactions: Transaction[];
}

export default function AdvancedStats({ transactions }: AdvancedStatsProps) {
  const totalCount = transactions.length;
  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;
  
  const avgIncome = incomeCount > 0
    ? transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) / incomeCount
    : 0;
  
  const avgExpense = expenseCount > 0
    ? transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / expenseCount
    : 0;

  const maxIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((max, t) => t.amount > max ? t.amount : max, 0);
  
  const maxExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((max, t) => t.amount > max ? t.amount : max, 0);

  const stats = [
    {
      label: '总记录数',
      value: totalCount.toString(),
      icon: '📊',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: '收入笔数',
      value: incomeCount.toString(),
      icon: '💰',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: '支出笔数',
      value: expenseCount.toString(),
      icon: '💸',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: '平均收入',
      value: formatCurrency(avgIncome),
      icon: '📈',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: '平均支出',
      value: formatCurrency(avgExpense),
      icon: '📉',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: '最大收入',
      value: formatCurrency(maxIncome),
      icon: '⭐',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: '最大支出',
      value: formatCurrency(maxExpense),
      icon: '⚠️',
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        详细统计
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-600 transform hover:scale-105 transition-transform duration-200"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {stat.label}
            </div>
            <div className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
