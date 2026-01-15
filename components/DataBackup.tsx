'use client';

import { useState } from 'react';
import { GameSettlementRecord } from '@/types';
import { getSettlementRecords } from '@/lib/settlementStorage';
import { getTransactions } from '@/lib/storage';

interface DataBackupProps {
  onRestore?: () => void;
}

export default function DataBackup({ onRestore }: DataBackupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [backupType, setBackupType] = useState<'all' | 'settlement' | 'transaction'>('all');

  const handleBackup = () => {
    let data: any = {};

    if (backupType === 'all' || backupType === 'settlement') {
      const settlementRecords = getSettlementRecords();
      data.settlementRecords = settlementRecords;
    }

    if (backupType === 'all' || backupType === 'transaction') {
      const transactions = getTransactions();
      data.transactions = transactions;
    }

    data.backupDate = new Date().toISOString();
    data.version = '1.2.0';

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duizhang-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 记录备份操作日志
    const { logOperation } = require('./OperationLog');
    logOperation('备份数据', 'backup', '数据备份', `类型：${backupType === 'all' ? '全部' : backupType === 'settlement' ? '结算记录' : '交易记录'}`);

    setIsOpen(false);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.settlementRecords) {
          localStorage.setItem('settlementRecords', JSON.stringify(data.settlementRecords));
        }
        if (data.transactions) {
          localStorage.setItem('transactions', JSON.stringify(data.transactions));
        }

        // 记录恢复操作日志
        const { logOperation } = require('./OperationLog');
        logOperation('恢复数据', 'restore', '数据恢复', `备份日期：${data.backupDate || '未知'}`);

        if (onRestore) {
          onRestore();
        }
        
        alert('数据恢复成功！页面将刷新。');
        window.location.reload();
      } catch (error) {
        alert('数据恢复失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        💾 数据备份
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">数据备份与恢复</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* 备份功能 */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">备份数据</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择备份类型
              </label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">全部数据（结算记录 + 交易记录）</option>
                <option value="settlement">仅结算记录</option>
                <option value="transaction">仅交易记录</option>
              </select>
            </div>
            <button
              onClick={handleBackup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              下载备份文件
            </button>
          </div>
        </div>

        {/* 恢复功能 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">恢复数据</h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ 警告：恢复数据将覆盖当前所有数据，请确保已备份当前数据！
            </p>
          </div>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
            />
            <span className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer inline-block text-center">
              选择备份文件并恢复
            </span>
          </label>
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">💡 使用说明：</p>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>备份文件为 JSON 格式，包含所有数据和时间戳</li>
            <li>建议定期备份数据，防止数据丢失</li>
            <li>恢复数据前请先备份当前数据</li>
            <li>恢复后页面会自动刷新</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
