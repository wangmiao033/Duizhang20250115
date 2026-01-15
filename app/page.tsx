'use client';

import { useState, useEffect } from 'react';
import { Transaction, Summary, GameSettlementRecord, SettlementBillConfig } from '@/types';
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
import { exportSettlementToPDF } from '@/lib/pdfExport';
import { exportSettlementToPDF } from '@/lib/pdfExport';
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
import SettlementForm from '@/components/SettlementForm';
import SettlementList from '@/components/SettlementList';
import SettlementBill from '@/components/SettlementBill';
import SettlementGuide from '@/components/SettlementGuide';
import SettlementBatchImport from '@/components/SettlementBatchImport';
import SettlementConfig from '@/components/SettlementConfig';
import SettlementStats from '@/components/SettlementStats';
import SettlementRowCopy from '@/components/SettlementRowCopy';
import SettlementHistory from '@/components/SettlementHistory';
import SettlementSearch from '@/components/SettlementSearch';
import SettlementBatchEdit from '@/components/SettlementBatchEdit';
import SettlementComparison from '@/components/SettlementComparison';
import SettlementValidation from '@/components/SettlementValidation';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import SettlementChart from '@/components/SettlementChart';
import DataBackup from '@/components/DataBackup';
import OperationLog, { logOperation } from '@/components/OperationLog';
import SettlementSort, { SortField, SortOrder } from '@/components/SettlementSort';
import QuickActions from '@/components/QuickActions';
import { exportSettlementToCSV } from '@/lib/settlementExport';
import { exportSettlementToExcel } from '@/lib/settlementExport';
import { updateCalculatedFields } from '@/lib/settlement';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  getSettlementRecords,
  saveSettlementRecord,
  deleteSettlementRecord,
  clearSettlementRecords,
  getSettlementConfig,
  saveSettlementConfig,
} from '@/lib/settlementStorage';

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
  const [activeTab, setActiveTab] = useState<'list' | 'stats' | 'monthly' | 'yearly' | 'advanced' | 'settlement'>('list');
  const [settlementRecords, setSettlementRecords] = useState<GameSettlementRecord[]>([]);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<GameSettlementRecord | null>(null);
  const [showSettlementBill, setShowSettlementBill] = useState(false);
  const [showSettlementGuide, setShowSettlementGuide] = useState(true);
  const [showSettlementConfig, setShowSettlementConfig] = useState(false);
  const [showSettlementComparison, setShowSettlementComparison] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [settlementConfig, setSettlementConfig] = useState<SettlementBillConfig>(getSettlementConfig());
  const [settlementSearchTerm, setSettlementSearchTerm] = useState('');
  const [settlementFilterPeriod, setSettlementFilterPeriod] = useState('all');
  const [selectedSettlementIds, setSelectedSettlementIds] = useState<string[]>([]);
  const [settlementSortField, setSettlementSortField] = useState<SortField>('serialNo');
  const [settlementSortOrder, setSettlementSortOrder] = useState<SortOrder>('asc');
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
    loadSettlementRecords();
  }, []);

  // 快捷键支持
  useKeyboardShortcuts({
    'ctrl+n': () => {
      if (activeTab === 'settlement' && !showSettlementForm) {
        setEditingSettlement(null);
        setShowSettlementForm(true);
      }
    },
    'ctrl+e': () => {
      if (activeTab === 'settlement' && settlementRecords.length > 0) {
        handleExportSettlementExcel();
      }
    },
    'ctrl+p': () => {
      if (activeTab === 'settlement' && showSettlementBill) {
        window.print();
      }
    },
    'escape': () => {
      if (showSettlementForm) {
        setShowSettlementForm(false);
        setEditingSettlement(null);
      }
      if (showSettlementConfig) {
        setShowSettlementConfig(false);
      }
      if (showBatchEdit) {
        setShowBatchEdit(false);
        setSelectedSettlementIds([]);
      }
    },
  });

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

  const loadSettlementRecords = () => {
    const data = getSettlementRecords();
    setSettlementRecords(data);
  };

  const handleSettlementSubmit = (record: GameSettlementRecord) => {
    const isUpdate = editingSettlement !== null;
    saveSettlementRecord(record);
    loadSettlementRecords();
    setShowSettlementForm(false);
    setEditingSettlement(null);
    showToast(isUpdate ? '结算记录更新成功' : '结算记录添加成功', 'success');
    
    // 记录操作日志
    logOperation(
      isUpdate ? '更新结算记录' : '创建结算记录',
      isUpdate ? 'update' : 'create',
      record.gameName,
      `计费周期：${record.billingPeriod}`
    );
  };

  const handleSettlementBatchImport = (records: GameSettlementRecord[]) => {
    records.forEach(record => {
      saveSettlementRecord(record);
    });
    loadSettlementRecords();
    showToast(`成功导入 ${records.length} 条结算记录`, 'success');
    logOperation('批量导入', 'import', '结算记录', `${records.length} 条记录`);
  };

  const handleExportSettlementExcel = () => {
    exportSettlementToExcel(settlementRecords, settlementConfig);
    showToast('Excel 对账单导出成功', 'success');
    logOperation('导出Excel', 'export', '结算对账单', `${settlementRecords.length} 条记录`);
  };

  const handleExportSettlementCSV = () => {
    exportSettlementToCSV(settlementRecords, settlementConfig);
    showToast('CSV 文件导出成功', 'success');
    logOperation('导出CSV', 'export', '结算对账单', `${settlementRecords.length} 条记录`);
  };

  const handleSettlementSortChange = (field: SortField, order: SortOrder) => {
    setSettlementSortField(field);
    setSettlementSortOrder(order);
  };

  const handleSettlementConfigSave = () => {
    setSettlementConfig(getSettlementConfig());
    setShowSettlementConfig(false);
    showToast('配置保存成功', 'success');
  };

  const handleSettlementSearch = (searchTerm: string) => {
    setSettlementSearchTerm(searchTerm);
  };

  const handleSettlementFilterPeriod = (period: string) => {
    setSettlementFilterPeriod(period);
  };

  const handleSettlementSelect = (id: string) => {
    setSelectedSettlementIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleSettlementSelectAll = () => {
    const filtered = getFilteredSettlementRecords();
    if (selectedSettlementIds.length === filtered.length) {
      setSelectedSettlementIds([]);
    } else {
      setSelectedSettlementIds(filtered.map(r => r.id));
    }
  };

  const getFilteredSettlementRecords = (): GameSettlementRecord[] => {
    let filtered = settlementRecords;

    // 搜索筛选
    if (settlementSearchTerm) {
      filtered = filtered.filter(r =>
        r.gameName.toLowerCase().includes(settlementSearchTerm.toLowerCase()) ||
        r.billingPeriod.toLowerCase().includes(settlementSearchTerm.toLowerCase())
      );
    }

    // 周期筛选
    if (settlementFilterPeriod !== 'all') {
      filtered = filtered.filter(r => r.billingPeriod === settlementFilterPeriod);
    }

    return filtered;
  };

  const handleBatchUpdate = (updates: Partial<GameSettlementRecord>) => {
    selectedSettlementIds.forEach(id => {
      const record = settlementRecords.find(r => r.id === id);
      if (record) {
        const updated = {
          ...record,
          ...updates,
        };
        const finalRecord = updateCalculatedFields(updated);
        saveSettlementRecord(finalRecord);
      }
    });
    loadSettlementRecords();
    setSelectedSettlementIds([]);
    setShowBatchEdit(false);
    showToast(`成功更新 ${selectedSettlementIds.length} 条记录`, 'success');
  };

  const handleSettlementEdit = (record: GameSettlementRecord) => {
    setEditingSettlement(record);
    setShowSettlementForm(true);
  };

  const handleSettlementDelete = (id: string) => {
    const record = settlementRecords.find(r => r.id === id);
    setConfirmDialog({
      isOpen: true,
      title: '确认删除',
      message: '确定要删除这条结算记录吗？',
      type: 'danger',
      onConfirm: () => {
        deleteSettlementRecord(id);
        loadSettlementRecords();
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        showToast('删除成功', 'success');
        
        // 记录操作日志
        if (record) {
          logOperation(
            '删除结算记录',
            'delete',
            record.gameName,
            `计费周期：${record.billingPeriod}`
          );
        }
      },
    });
  };

  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  游戏公司对账系统
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  内部对账管理系统
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>新增记录</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计概览 */}
        <div className="mb-8">
          <SummaryCard summary={summary} />
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：对账操作区 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 操作工具栏 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 no-print">
              <div className="flex flex-wrap gap-3 mb-4">
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onReset={handleResetDateRange}
                />
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <QuickAdd onAdd={handleQuickAdd} />
                <DataImport onImport={handleImport} />
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                    disabled={transactions.length === 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>导出</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                    disabled={transactions.length === 0}
                  >
                    Excel
                  </button>
                  <button
                    onClick={handleExportStatement}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                    disabled={transactions.length === 0}
                  >
                    对账单
                  </button>
                </div>
                <ExcelViewer />
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜索记录..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">全部类型</option>
                  <option value="income">仅收入</option>
                  <option value="expense">仅支出</option>
                </select>
              </div>
            </div>

            {/* 标签页导航 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-1 no-print">
              <div className="flex space-x-1 overflow-x-auto">
                {[
                  { id: 'list', label: '📋 记录列表', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { id: 'stats', label: '📊 类别统计', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                  { id: 'monthly', label: '📅 月度统计', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { id: 'yearly', label: '📆 年度统计', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { id: 'advanced', label: '📈 详细统计', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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

        {activeTab === 'list' && (
          <div className="space-y-4">
            <BatchActions
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onDeselectAll={() => setSelectedIds([])}
              onDeleteSelected={handleBatchDelete}
              totalCount={filteredTransactions.length}
            />
            <div className="flex gap-3 mb-4 no-print">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white shadow-sm"
              >
                <option value="date">按日期</option>
                <option value="amount">按金额</option>
                <option value="category">按类别</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white shadow-sm"
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white shadow-sm"
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

        {activeTab === 'settlement' && (
          <div className="space-y-6">
            {showSettlementBill ? (
              <div>
                <div className="mb-4 flex justify-between items-center no-print">
                  <button
                    onClick={() => setShowSettlementBill(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    返回列表
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    打印对账单
                  </button>
                </div>
                <SettlementBill records={settlementRecords} config={settlementConfig} />
              </div>
            ) : (
              <>
                {/* 使用指南 */}
                {showSettlementGuide && (
                  <SettlementGuide onClose={() => setShowSettlementGuide(false)} />
                )}

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">结算对账管理</h3>
                  <div className="flex gap-3">
                    {!showSettlementGuide && (
                      <button
                        onClick={() => setShowSettlementGuide(true)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                      >
                        📖 使用指南
                      </button>
                    )}
                    <button
                      onClick={() => setShowSettlementConfig(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      ⚙️ 配置
                    </button>
                    <button
                      onClick={handleExportSettlementExcel}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                      disabled={settlementRecords.length === 0}
                    >
                      📥 导出Excel
                    </button>
                    <button
                      onClick={handleExportSettlementCSV}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                      disabled={settlementRecords.length === 0}
                    >
                      📄 导出CSV
                    </button>
                    <button
                      onClick={handleExportSettlementPDF}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                      disabled={settlementRecords.length === 0}
                    >
                      📑 导出PDF
                    </button>
                    <DataBackup onRestore={loadSettlementRecords} />
                    <OperationLog />
                    <button
                      onClick={() => {
                        // 格式化日期显示
                        let period = '';
                        if (startDate && endDate) {
                          const start = new Date(startDate);
                          const end = new Date(endDate);
                          const startStr = `${start.getFullYear()}年${String(start.getMonth() + 1).padStart(2, '0')}月${String(start.getDate()).padStart(2, '0')}日`;
                          const endStr = `${end.getFullYear()}年${String(end.getMonth() + 1).padStart(2, '0')}月${String(end.getDate()).padStart(2, '0')}日`;
                          period = `${startStr}-${endStr}`;
                        } else {
                          const now = new Date();
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          period = `${year}年${month}月01日-${year}年${month}月${new Date(year, now.getMonth() + 1, 0).getDate()}日`;
                        }
                        saveSettlementConfig({ period });
                        setShowSettlementBill(true);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                      disabled={settlementRecords.length === 0}
                    >
                      📄 生成对账单
                    </button>
                    <button
                      onClick={() => {
                        setEditingSettlement(null);
                        setShowSettlementForm(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      + 新增结算记录
                    </button>
                    {settlementRecords.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowSettlementComparison(!showSettlementComparison)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                        >
                          📊 周期对比
                        </button>
                        {selectedSettlementIds.length > 0 && (
                          <button
                            onClick={() => setShowBatchEdit(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
                          >
                            ✏️ 批量编辑 ({selectedSettlementIds.length})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 数据校验 */}
                {settlementRecords.length > 0 && !showSettlementConfig && (
                  <SettlementValidation records={settlementRecords} />
                )}

                {/* 周期对比 */}
                {showSettlementComparison && !showSettlementConfig && (
                  <SettlementComparison records={settlementRecords} />
                )}

                {/* 批量编辑 */}
                {showBatchEdit && (
                  <SettlementBatchEdit
                    selectedIds={selectedSettlementIds}
                    records={settlementRecords}
                    onUpdate={handleBatchUpdate}
                    onClose={() => {
                      setShowBatchEdit(false);
                      setSelectedSettlementIds([]);
                    }}
                  />
                )}

                {/* 结算统计 */}
                {settlementRecords.length > 0 && !showSettlementConfig && (
                  <>
                    <SettlementStats records={settlementRecords} />
                    
                    {/* 图表展示 */}
                    {settlementRecords.length > 0 && (
                      <SettlementChart records={settlementRecords} />
                    )}
                    
                    {/* 搜索和筛选 */}
                    <div className="flex flex-wrap gap-3 items-center">
                      <SettlementSearch
                        onSearch={handleSettlementSearch}
                        onFilterPeriod={handleSettlementFilterPeriod}
                        periods={Array.from(new Set(settlementRecords.map(r => r.billingPeriod).filter(Boolean)))}
                      />
                      <SettlementSort
                        onSortChange={handleSettlementSortChange}
                        currentField={settlementSortField}
                        currentOrder={settlementSortOrder}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        {getFilteredSettlementRecords().length > 0 ? (
                          <SettlementList
                            records={getFilteredSettlementRecords()}
                            onEdit={handleSettlementEdit}
                            onDelete={handleSettlementDelete}
                            selectedIds={selectedSettlementIds}
                            onSelect={handleSettlementSelect}
                            onSelectAll={handleSettlementSelectAll}
                            sortField={settlementSortField}
                            sortOrder={settlementSortOrder}
                          />
                        ) : (
                          <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg text-center border border-gray-200 dark:border-gray-700">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">还没有结算记录</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                              点击"新增结算记录"或"批量导入"开始添加游戏流水数据
                            </p>
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => {
                                  setEditingSettlement(null);
                                  setShowSettlementForm(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                              >
                                + 新增结算记录
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="lg:col-span-1">
                        <SettlementHistory onSelect={(records) => {
                          // 可以在这里实现选择历史记录的功能
                          console.log('选择历史记录:', records);
                        }} />
                      </div>
                    </div>
                  </>
                )}

                {/* 配置管理 */}
                {showSettlementConfig && (
                  <SettlementConfig
                    onSave={handleSettlementConfigSave}
                    onCancel={() => setShowSettlementConfig(false)}
                  />
                )}

                {/* 批量导入和粘贴 */}
                <div className="flex gap-3 flex-wrap">
                  <SettlementBatchImport onImport={handleSettlementBatchImport} />
                  <SettlementRowCopy onPaste={handleSettlementBatchImport} />
                </div>

                {showSettlementForm && (
                  <SettlementForm
                    onSubmit={handleSettlementSubmit}
                    onCancel={() => {
                      setShowSettlementForm(false);
                      setEditingSettlement(null);
                    }}
                    initialData={editingSettlement || undefined}
                  />
                )}
              </>
            )}
          </div>
        )}
          </div>

          {/* 右侧：数据统计面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 快速统计卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                快速统计
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">总记录</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{transactions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">收入</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{incomeCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">支出</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">{expenseCount}</span>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 no-print">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                快捷操作
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportJSON}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  disabled={transactions.length === 0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>备份数据</span>
                </button>
                <button
                  onClick={handleImportJSON}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>恢复数据</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  disabled={transactions.length === 0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>打印</span>
                </button>
                {transactions.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>清空数据</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
      
      {/* 快捷键帮助 */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
