'use client';

import { useState } from 'react';
import { GameSettlementRecord } from '@/types';
import { calculateSettlementSummary } from '@/lib/settlement';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementComparisonProps {
  records: GameSettlementRecord[];
}

export default function SettlementComparison({ records }: SettlementComparisonProps) {
  const [period1, setPeriod1] = useState<string>('');
  const [period2, setPeriod2] = useState<string>('');

  // 获取所有周期
  const periods = Array.from(new Set(records.map(r => r.billingPeriod).filter(Boolean))).sort().reverse();

  const period1Records = records.filter(r => r.billingPeriod === period1);
  const period2Records = records.filter(r => r.billingPeriod === period2);

  const summary1 = period1Records.length > 0 ? calculateSettlementSummary(period1Records) : null;
  const summary2 = period2Records.length > 0 ? calculateSettlementSummary(period2Records) : null;

  const calculateDiff = (val1: number, val2: number) => {
    if (!val1 || !val2) return null;
    const diff = val1 - val2;
    const percent = val2 !== 0 ? (diff / val2) * 100 : 0;
    return { diff, percent };
  };

  if (periods.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">周期对比</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">至少需要两个周期的数据才能进行对比</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        周期对比分析
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择第一个周期
          </label>
          <select
            value={period1}
            onChange={(e) => setPeriod1(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">请选择周期</option>
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择第二个周期
          </label>
          <select
            value={period2}
            onChange={(e) => setPeriod2(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">请选择周期</option>
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {summary1 && summary2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">指标</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{period1}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{period2}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">差异</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">变化率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { label: '游戏数量', val1: period1Records.length, val2: period2Records.length },
                { label: '总流水', val1: summary1.totalFlow, val2: summary2.totalFlow },
                { label: '总充值', val1: summary1.totalRechargeAmount, val2: summary2.totalRechargeAmount },
                { label: '实际结算', val1: summary1.totalActualSettlementAmount, val2: summary2.totalActualSettlementAmount },
                { label: '结算金额', val1: summary1.totalSettlementAmount, val2: summary2.totalSettlementAmount },
              ].map((row, index) => {
                const diff = calculateDiff(row.val1, row.val2);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{row.label}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                      {typeof row.val1 === 'number' ? formatAmount(row.val1) : row.val1}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                      {typeof row.val2 === 'number' ? formatAmount(row.val2) : row.val2}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      diff && diff.diff > 0 ? 'text-green-600 dark:text-green-400' : 
                      diff && diff.diff < 0 ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {diff ? (diff.diff > 0 ? '+' : '') + formatAmount(diff.diff) : '-'}
                    </td>
                    <td className={`px-4 py-3 text-right ${
                      diff && diff.percent > 0 ? 'text-green-600 dark:text-green-400' : 
                      diff && diff.percent < 0 ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {diff ? (diff.percent > 0 ? '+' : '') + diff.percent.toFixed(2) + '%' : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(!summary1 || !summary2) && period1 && period2 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          请选择两个不同的周期进行对比
        </div>
      )}
    </div>
  );
}
