'use client';

import { GameSettlementRecord } from '@/types';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementListProps {
  records: GameSettlementRecord[];
  onEdit: (record: GameSettlementRecord) => void;
  onDelete: (id: string) => void;
}

export default function SettlementList({ records, onEdit, onDelete }: SettlementListProps) {
  const sortedRecords = [...records].sort((a, b) => (a.serialNo || 0) - (b.serialNo || 0));

  if (sortedRecords.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        暂无结算记录
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">序号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">计费周期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">游戏名称</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">流水</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">充值金额</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">实际结算</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">结算金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{record.serialNo}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{record.billingPeriod}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{record.gameName}</td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{formatAmount(record.flow)}</td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{formatAmount(record.rechargeAmount)}</td>
                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">{formatAmount(record.actualSettlementAmount)}</td>
                <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-semibold">{formatAmount(record.settlementAmount)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEdit(record)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这条记录吗？')) {
                        onDelete(record.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
