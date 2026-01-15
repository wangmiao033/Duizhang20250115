'use client';

import { GameSettlementRecord } from '@/types';
import { calculateSettlementSummary } from '@/lib/settlement';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementStatsProps {
  records: GameSettlementRecord[];
}

export default function SettlementStats({ records }: SettlementStatsProps) {
  const summary = calculateSettlementSummary(records);

  const stats = [
    {
      label: '游戏数量',
      value: records.length.toString(),
      icon: '🎮',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: '总流水',
      value: formatAmount(summary.totalFlow),
      icon: '💰',
      color: 'from-green-500 to-green-600',
    },
    {
      label: '总充值',
      value: formatAmount(summary.totalRechargeAmount),
      icon: '💳',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: '实际结算',
      value: formatAmount(summary.totalActualSettlementAmount),
      icon: '📊',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: '结算金额',
      value: formatAmount(summary.totalSettlementAmount),
      icon: '💵',
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        结算统计
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl text-white transform hover:scale-105 transition-transform duration-200`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-xs text-white/80 mb-1">{stat.label}</div>
            <div className="text-lg font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 详细统计 */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-600 dark:text-gray-400 mb-1">测试费总额</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatAmount(summary.totalTestFeeAmount)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-600 dark:text-gray-400 mb-1">代金券总额</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatAmount(summary.totalVoucherAmount)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-600 dark:text-gray-400 mb-1">退款总额</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatAmount(summary.totalRefund)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-600 dark:text-gray-400 mb-1">平均结算比例</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {records.length > 0
                ? formatAmount(records.reduce((sum, r) => sum + (r.settlementRatio || 0), 0) / records.length)
                : '0.00'}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
