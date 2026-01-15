'use client';

import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  sortBy?: 'date' | 'amount' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelect,
  onSelectAll,
  sortBy = 'date',
  sortOrder = 'desc',
}: TransactionListProps) {
  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center text-gray-500 dark:text-gray-400">
        暂无对账记录
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <tr>
              {onSelect && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === sortedTransactions.length && sortedTransactions.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                类别
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedIds.includes(transaction.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {onSelect && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => onSelect(transaction.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {format(new Date(transaction.date), 'yyyy-MM-dd')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {transaction.type === 'income' ? '收入' : '支出'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {transaction.category}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                  {transaction.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这条记录吗？')) {
                        onDelete(transaction.id);
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
