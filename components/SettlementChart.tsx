'use client';

import { GameSettlementRecord } from '@/types';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementChartProps {
  records: GameSettlementRecord[];
}

export default function SettlementChart({ records }: SettlementChartProps) {
  // 按周期分组
  const groupedByPeriod = records.reduce((acc, record) => {
    const period = record.billingPeriod || '未分类';
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(record);
    return acc;
  }, {} as Record<string, GameSettlementRecord[]>);

  const periods = Object.keys(groupedByPeriod).sort();
  const maxAmount = Math.max(
    ...periods.map(period =>
      groupedByPeriod[period].reduce((sum, r) => sum + r.settlementAmount, 0)
    ),
    1
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        结算金额趋势
      </h3>

      <div className="space-y-4">
        {periods.map((period) => {
          const periodRecords = groupedByPeriod[period];
          const totalAmount = periodRecords.reduce((sum, r) => sum + r.settlementAmount, 0);
          const percentage = (totalAmount / maxAmount) * 100;

          return (
            <div key={period} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{period}</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatAmount(totalAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 10 && (
                    <span className="text-xs text-white font-medium">
                      {periodRecords.length} 个游戏
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {periods.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          暂无数据
        </div>
      )}
    </div>
  );
}
