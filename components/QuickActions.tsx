'use client';

import { GameSettlementRecord } from '@/types';

interface QuickActionsProps {
  records: GameSettlementRecord[];
  selectedIds: string[];
  onNewRecord: () => void;
  onBatchImport: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onExportPDF?: () => void;
  onGenerateBill: () => void;
  onBatchEdit?: () => void;
  onBatchDelete?: () => void;
}

export default function QuickActions({
  records,
  selectedIds,
  onNewRecord,
  onBatchImport,
  onExportExcel,
  onExportCSV,
  onExportPDF,
  onGenerateBill,
  onBatchEdit,
  onBatchDelete,
}: QuickActionsProps) {
  const hasSelection = selectedIds.length > 0;
  const hasRecords = records.length > 0;

  const quickActions = [
    {
      label: '新增记录',
      icon: '➕',
      onClick: onNewRecord,
      color: 'bg-blue-500 hover:bg-blue-600',
      disabled: false,
    },
    {
      label: '批量导入',
      icon: '📥',
      onClick: onBatchImport,
      color: 'bg-purple-500 hover:bg-purple-600',
      disabled: false,
    },
    {
      label: '导出Excel',
      icon: '📊',
      onClick: onExportExcel,
      color: 'bg-green-500 hover:bg-green-600',
      disabled: !hasRecords,
    },
    {
      label: '导出CSV',
      icon: '📄',
      onClick: onExportCSV,
      color: 'bg-teal-500 hover:bg-teal-600',
      disabled: !hasRecords,
    },
    {
      label: '导出PDF',
      icon: '📑',
      onClick: onExportPDF,
      color: 'bg-red-500 hover:bg-red-600',
      disabled: !hasRecords || !onExportPDF,
    },
    {
      label: '生成对账单',
      icon: '📋',
      onClick: onGenerateBill,
      color: 'bg-orange-500 hover:bg-orange-600',
      disabled: !hasRecords,
    },
  ];

  const batchActions = [
    {
      label: `批量编辑 (${selectedIds.length})`,
      icon: '✏️',
      onClick: onBatchEdit,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      disabled: !hasSelection,
    },
    {
      label: `批量删除 (${selectedIds.length})`,
      icon: '🗑️',
      onClick: onBatchDelete,
      color: 'bg-red-500 hover:bg-red-600',
      disabled: !hasSelection,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${action.color} text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2`}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
        
        {hasSelection && (
          <>
            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-2" />
            {batchActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`${action.color} text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2`}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
