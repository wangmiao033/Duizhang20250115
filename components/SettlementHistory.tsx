'use client';

import { useState, useEffect } from 'react';
import { GameSettlementRecord } from '@/types';
import { getSettlementRecords } from '@/lib/settlementStorage';
import { calculateSettlementSummary } from '@/lib/settlement';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementHistoryProps {
  onSelect: (records: GameSettlementRecord[]) => void;
}

export default function SettlementHistory({ onSelect }: SettlementHistoryProps) {
  const [records, setRecords] = useState<GameSettlementRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<Map<string, GameSettlementRecord[]>>(new Map());

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = getSettlementRecords();
    setRecords(allRecords);
    
    // 按计费周期分组
    const grouped = new Map<string, GameSettlementRecord[]>();
    allRecords.forEach(record => {
      const period = record.billingPeriod || '未分类';
      if (!grouped.has(period)) {
        grouped.set(period, []);
      }
      grouped.get(period)!.push(record);
    });
    setGroupedRecords(grouped);
  };

  const handleSelectPeriod = (period: string) => {
    const periodRecords = groupedRecords.get(period) || [];
    onSelect(periodRecords);
  };

  if (records.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        历史对账单
      </h3>
      <div className="space-y-3">
        {Array.from(groupedRecords.entries()).map(([period, periodRecords]) => {
          const summary = calculateSettlementSummary(periodRecords);
          return (
            <div
              key={period}
              onClick={() => handleSelectPeriod(period)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{period}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {periodRecords.length} 个游戏 | 结算金额: {formatAmount(summary.totalSettlementAmount)}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
