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
  exportToExcel,
} from '@/lib/utils';
import { exportToStatementFormat } from '@/lib/excel';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import SummaryCard from '@/components/SummaryCard';
import DateRangeFilter from '@/components/DateRangeFilter';
import CategoryChart from '@/components/CategoryChart';
import MonthlyStats from '@/components/MonthlyStats';
import YearlyStats from '@/components/YearlyStats';
import DataImport from '@/components/DataImport';
import QuickAdd from '@/components/QuickAdd';
import ExcelViewer from '@/components/ExcelViewer';
import BatchActions from '@/components/BatchActions';
import AdvancedStats from '@/components/AdvancedStats';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import VersionInfo from '@/components/VersionInfo';

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
  const [activeTab, setActiveTab] = useState<'list' | 'stats' | 'monthly' | 'yearly' | 'advanced'>('list');
  const [categoryType, setCategoryType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
      showToast('记录更新成功', 'success');
    } else {
      saveTransaction(transaction);
      showToast('记录添加成功', 'success');
    }
    loadTransactions();
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleQuickAdd = (transaction: Transaction) => {
    saveTransaction(transaction);
    loadTransactions();
    showToast('快捷添加成功', 'success');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这条记录吗？',
      type: 'danger',
      onConfirm: () => {
        deleteTransaction(id);
        loadTransactions();
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        showToast('删除成功', 'success');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: '批量删除',
      message: `确定要删除选中的 ${selectedIds.length} 条记录吗？此操作不可恢复！`,
      type: 'danger',
      onConfirm: () => {
        selectedIds.forEach(id => deleteTransaction(id));
        loadTransactions();
        setSelectedIds([]);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        showToast(`成功删除 ${selectedIds.length} 条记录`, 'success');
      },
    });
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentTransactions = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    if (selectedIds.length === currentTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTransactions.map(t => t.id));
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    exportToCSV(filteredTransactions.length > 0 ? filteredTransactions : transactions);
    showToast('CSV 导出成功', 'success');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredTransactions.length > 0 ? filteredTransactions : transactions);
    showToast('Excel 导出成功', 'success');
  };

  const handleExportStatement = () => {
    const title = startDate && endDate 
      ? `对账单_${startDate}_${endDate}`
      : `对账单_${new Date().toISOString().split('T')[0]}`;
    exportToStatementFormat(
      filteredTransactions.length > 0 ? filteredTransactions : transactions,
      title
    );
    showToast('对账单导出成功', 'success');
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: '清空所有数据',
      message: '确定要清空所有数据吗？此操作不可恢复！',
      type: 'danger',
      onConfirm: () => {
        clearAllTransactions();
        loadTransactions();
        setSelectedIds([]);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        showToast('数据已清空', 'success');
      },
    });
  };

  const handleImport = (importedTransactions: Transaction[]) => {
    importTransactions(importedTransactions);
    loadTransactions();
    showToast(`成功导入 ${importedTransactions.length} 条记录`, 'success');
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
            showToast('数据恢复成功！', 'success');
          } catch (error) {
            showToast('导入失败：' + (error instanceof Error ? error.message : '未知错误'), 'error');
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
            <QuickAdd onAdd={handleQuickAdd} />
            <DataImport onImport={handleImport} />
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              导出 CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              导出 Excel
            </button>
            <button
              onClick={handleExportStatement}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
              disabled={transactions.length === 0}
            >
              导出对账单
            </button>
            <ExcelViewer />
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
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              记录列表
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              类别统计
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              月度统计
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'yearly'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              年度统计
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'advanced'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              详细统计
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
          <div className="space-y-4">
            <BatchActions
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onDeselectAll={() => setSelectedIds([])}
              onDeleteSelected={handleBatchDelete}
              totalCount={filteredTransactions.length}
            />
            <div className="flex gap-4 mb-4 no-print">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="date">按日期</option>
                <option value="amount">按金额</option>
                <option value="category">按类别</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
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

        {activeTab === 'yearly' && (
          <YearlyStats transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions} />
        )}

        {activeTab === 'advanced' && (
          <AdvancedStats transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions} />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type={confirmDialog.type}
      />

      <VersionInfo />
    </div>
  );
}
