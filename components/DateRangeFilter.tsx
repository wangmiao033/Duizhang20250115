'use client';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: DateRangeFilterProps) {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            开始日期
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            max={endDate || today}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            结束日期
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate}
            max={today}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onStartDateChange(firstDayOfMonth);
              onEndDateChange(today);
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
          >
            本月
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
          >
            清除
          </button>
        </div>
      </div>
    </div>
  );
}
