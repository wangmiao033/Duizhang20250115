'use client';

import { useState, useEffect } from 'react';
import { Transaction, Summary } from '@/types';
import {
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
} from '@/lib/storage';
import { calculateSummary, exportToCSV } from '@/lib/utils';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import SummaryCard from '@/components/SummaryCard';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const data = getTransactions();
    setTransactions(data);
    setSummary(calculateSummary(data));
  };

  const handleSubmit = (transaction: Transaction) => {
    if (editingTransaction) {
      updateTransaction(transaction.id, transaction);
    } else {
      saveTransaction(transaction);
    }
    loadTransactions();
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    loadTransactions();
  };

  const handleExport = () => {
    exportToCSV(transactions);
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      clearAllTransactions();
      loadTransactions();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            游戏公司对账系统
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            内部对账管理系统 - 记录和管理公司财务流水
          </p>
        </div>

        <SummaryCard summary={summary} />

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
            >
              + 新增记录
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              导出 CSV
            </button>
            {transactions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              >
                清空数据
              </button>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">全部</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
        </div>

        {showForm && (
          <div className="mb-6">
            <TransactionForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
              initialData={editingTransaction || undefined}
            />
          </div>
        )}

        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchTerm={searchTerm}
          filterType={filterType}
        />
      </div>
    </div>
  );
}
