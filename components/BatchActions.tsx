'use client';

interface BatchActionsProps {
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  totalCount: number;
}

export default function BatchActions({
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  totalCount,
}: BatchActionsProps) {
  if (selectedIds.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          共 {totalCount} 条记录
        </span>
        <button
          onClick={onSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          全选
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl shadow-md flex items-center justify-between">
      <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
        已选择 {selectedIds.length} 条记录
      </span>
      <div className="flex gap-3">
        <button
          onClick={onDeselectAll}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          取消选择
        </button>
        <button
          onClick={onDeleteSelected}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition-colors"
        >
          批量删除
        </button>
      </div>
    </div>
  );
}
