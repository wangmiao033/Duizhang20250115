'use client';

import { useState } from 'react';
import { GameSettlementRecord } from '@/types';

interface SettlementBatchEditProps {
  selectedIds: string[];
  records: GameSettlementRecord[];
  onUpdate: (updates: Partial<GameSettlementRecord>) => void;
  onClose: () => void;
}

export default function SettlementBatchEdit({ selectedIds, records, onUpdate, onClose }: SettlementBatchEditProps) {
  const [updates, setUpdates] = useState<Partial<GameSettlementRecord>>({
    settlementRatio: undefined,
    channelFee: undefined,
    taxFee: undefined,
  });

  const selectedRecords = records.filter(r => selectedIds.includes(r.id));
  const hasSelection = selectedIds.length > 0;

  if (!hasSelection) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(updates);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          批量编辑 ({selectedIds.length} 条记录)
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              结算比例（%）
            </label>
            <input
              type="number"
              step="0.01"
              value={updates.settlementRatio || ''}
              onChange={(e) => setUpdates({ ...updates, settlementRatio: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="留空不修改"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              渠道费（%）
            </label>
            <input
              type="number"
              step="0.01"
              value={updates.channelFee || ''}
              onChange={(e) => setUpdates({ ...updates, channelFee: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="留空不修改"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              税费（%）
            </label>
            <input
              type="number"
              step="0.01"
              value={updates.taxFee || ''}
              onChange={(e) => setUpdates({ ...updates, taxFee: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="留空不修改"
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 提示：只填写需要修改的字段，留空的字段将保持不变。修改后系统会自动重新计算结算金额。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            应用修改
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
