'use client';

import { useState, useEffect } from 'react';
import { Transaction, Summary } from '@/types';
import {
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
  importTransactions,
  exportToJSON,
  importFromJSON,
} from '@/lib/storage';
import {
  calculateSummary,
  calculateCategorySummary,
  calculateMonthlySummary,
  filterByDateRange,
  exportToCSV,
} from '@/lib/utils';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import SummaryCard from '@/components/SummaryCard';
import DateRangeFilter from '@/components/DateRangeFilter';
import CategoryChart from '@/components/CategoryChart';
import MonthlyStats from '@/components/MonthlyStats';
import DataImport from '@/components/DataImport';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'stats' | 'monthly'>('list');
  const [categoryType, setCategoryType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filterType, startDate, endDate]);

  const loadTransactions = () => {
    const data = getTransactions();
    setTransactions(data);
    applyFilters(data);
  };

  const applyFilters = (data?: Transaction[]) => {
    let filtered = data || transactions;

    // 日期范围筛选
    if (startDate && endDate) {
      filtered = filterByDateRange(filtered, startDate, endDate);
    }

    // 搜索和类型筛选
    filtered = filtered.filter(t => {
      const matchesSearch = !searchTerm ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });

    setFilteredTransactions(filtered);
    setSummary(calculateSummary(filtered));
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
    exportToCSV(filteredTransactions.length > 0 ? filteredTransactions : transactions);
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      clearAllTransactions();
      loadTransactions();
    }
  };

  const handleImport = (importedTransactions: Transaction[]) => {
    importTransactions(importedTransactions);
    loadTransactions();
    alert(`成功导入 ${importedTransactions.length} 条记录`);
  };

  const handleExportJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `对账数据备份_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            importFromJSON(json);
            loadTransactions();
            alert('数据恢复成功！');
          } catch (error) {
            alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const categoryData = calculateCategorySummary(filteredTransactions.length > 0 ? filteredTransactions : transactions);
  const monthlyData = calculateMonthlySummary(filteredTransactions.length > 0 ? filteredTransactions : transactions);

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

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={handleResetDateRange}
        />

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between no-print">
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
            <DataImport onImport={handleImport} />
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              导出 CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              备份数据
            </button>
            <button
              onClick={handleImportJSON}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
            >
              恢复数据
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              打印
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

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              记录列表
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              类别统计
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              月度统计
            </button>
          </nav>
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

        {activeTab === 'list' && (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="mb-4">
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value as 'all' | 'income' | 'expense')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">全部类别</option>
                <option value="income">仅收入</option>
                <option value="expense">仅支出</option>
              </select>
            </div>
            <CategoryChart categoryData={categoryData} type={categoryType} />
          </div>
        )}

        {activeTab === 'monthly' && (
          <MonthlyStats monthlyData={monthlyData} />
        )}
      </div>
    </div>
  );
}
