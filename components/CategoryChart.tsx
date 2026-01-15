'use client';

import { CategorySummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  categoryData: CategorySummary[];
  type: 'income' | 'expense' | 'all';
}

export default function CategoryChart({ categoryData, type }: CategoryChartProps) {
  const filteredData = type === 'all' 
    ? categoryData 
    : categoryData.filter(c => type === 'income' ? c.income > 0 : c.expense > 0);

  if (filteredData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center text-gray-500 dark:text-gray-400">
        暂无数据
      </div>
    );
  }

  const maxAmount = Math.max(
    ...filteredData.map(c => Math.max(c.income, Math.abs(c.expense)))
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        类别统计
      </h3>
      <div className="space-y-4">
        {filteredData.map((item) => {
          const incomePercent = maxAmount > 0 ? (item.income / maxAmount) * 100 : 0;
          const expensePercent = maxAmount > 0 ? (Math.abs(item.expense) / maxAmount) * 100 : 0;
          
          return (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>
                <div className="flex gap-4 text-sm">
                  {item.income > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      收入: {formatCurrency(item.income)}
                    </span>
                  )}
                  {item.expense > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      支出: {formatCurrency(item.expense)}
                    </span>
                  )}
                  <span className={`font-semibold ${
                    item.total >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    净额: {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {item.income > 0 && (
                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${incomePercent}%` }}
                    />
                  </div>
                )}
                {item.expense > 0 && (
                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${expensePercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
