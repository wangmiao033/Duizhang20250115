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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          共 {totalCount} 条记录
        </span>
        <button
          onClick={onSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          全选
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg shadow-md mb-4 flex items-center justify-between">
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
