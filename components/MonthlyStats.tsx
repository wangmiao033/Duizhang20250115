'use client';

import { MonthlySummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MonthlyStatsProps {
  monthlyData: MonthlySummary[];
}

export default function MonthlyStats({ monthlyData }: MonthlyStatsProps) {
  if (monthlyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center text-gray-500 dark:text-gray-400">
        暂无月度数据
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        月度统计
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                月份
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                收入
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                支出
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                余额
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {monthlyData.map((month) => (
              <tr key={month.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {month.month}
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(month.income)}
                </td>
                <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {formatCurrency(month.expense)}
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${
                  month.balance >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {formatCurrency(month.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
