'use client';

import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface YearlyStatsProps {
  transactions: Transaction[];
}

export default function YearlyStats({ transactions }: YearlyStatsProps) {
  const yearlyMap = new Map<string, { income: number; expense: number; count: number }>();

  transactions.forEach(t => {
    const year = t.date.substring(0, 4);
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, { income: 0, expense: 0, count: 0 });
    }
    const yearData = yearlyMap.get(year)!;
    yearData.count++;
    if (t.type === 'income') {
      yearData.income += t.amount;
    } else {
      yearData.expense += t.amount;
    }
  });

  const yearlyData = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      ...data,
      balance: data.income - data.expense,
    }))
    .sort((a, b) => b.year.localeCompare(a.year));

  if (yearlyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center text-gray-500 dark:text-gray-400">
        暂无年度数据
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        年度统计
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                年份
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                记录数
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                总收入
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                总支出
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                余额
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {yearlyData.map((year) => (
              <tr key={year.year} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {year.year} 年
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {year.count} 笔
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(year.income)}
                </td>
                <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {formatCurrency(year.expense)}
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${
                  year.balance >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {formatCurrency(year.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
