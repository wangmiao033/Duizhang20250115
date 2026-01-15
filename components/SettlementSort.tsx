'use client';

import { useState } from 'react';

export type SortField = 'serialNo' | 'billingPeriod' | 'gameName' | 'flow' | 'rechargeAmount' | 'settlementAmount';
export type SortOrder = 'asc' | 'desc';

interface SettlementSortProps {
  onSortChange: (field: SortField, order: SortOrder) => void;
  currentField?: SortField;
  currentOrder?: SortOrder;
}

export default function SettlementSort({ onSortChange, currentField, currentOrder }: SettlementSortProps) {
  const [field, setField] = useState<SortField>(currentField || 'serialNo');
  const [order, setOrder] = useState<SortOrder>(currentOrder || 'asc');

  const handleFieldChange = (newField: SortField) => {
    setField(newField);
    onSortChange(newField, order);
  };

  const handleOrderChange = (newOrder: SortOrder) => {
    setOrder(newOrder);
    onSortChange(field, newOrder);
  };

  return (
    <div className="flex gap-3 items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">排序：</span>
      <select
        value={field}
        onChange={(e) => handleFieldChange(e.target.value as SortField)}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
      >
        <option value="serialNo">序号</option>
        <option value="billingPeriod">计费周期</option>
        <option value="gameName">游戏名称</option>
        <option value="flow">流水</option>
        <option value="rechargeAmount">充值金额</option>
        <option value="settlementAmount">结算金额</option>
      </select>
      <button
        onClick={() => handleOrderChange(order === 'asc' ? 'desc' : 'asc')}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
      >
        {order === 'asc' ? '↑ 升序' : '↓ 降序'}
      </button>
    </div>
  );
}
