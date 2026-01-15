'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { readExcelFile, parseExcelToTransactions } from '@/lib/excel';

interface DataImportProps {
  onImport: (transactions: Transaction[]) => void;
}

export default function DataImport({ onImport }: DataImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'text/csv' ||
        selectedFile.name.endsWith('.csv') ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('请选择 CSV 或 Excel 文件');
        setFile(null);
      }
    }
  };

  const parseCSV = (text: string): Transaction[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV 文件格式不正确');
    }

    const transactions: Transaction[] = [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length < 5) continue;

      const dateIndex = headers.indexOf('日期');
      const typeIndex = headers.indexOf('类型');
      const categoryIndex = headers.indexOf('类别');
      const amountIndex = headers.indexOf('金额');
      const descIndex = headers.indexOf('描述');

      if (dateIndex === -1 || typeIndex === -1 || categoryIndex === -1 || amountIndex === -1) {
        continue;
      }

      const transaction: Transaction = {
        id: Date.now().toString() + i,
        date: values[dateIndex] || new Date().toISOString().split('T')[0],
        type: values[typeIndex] === '收入' ? 'income' : 'expense',
        category: values[categoryIndex] || '',
        amount: parseFloat(values[amountIndex]) || 0,
        description: values[descIndex] || '',
        createdAt: new Date().toISOString(),
      };

      transactions.push(transaction);
    }

    return transactions;
  };

  const handleImport = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    try {
      let transactions: Transaction[] = [];

      // 判断是 Excel 还是 CSV
      if (
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      ) {
        // 处理 Excel 文件
        const sheets = await readExcelFile(file);
        if (sheets.length === 0) {
          setError('Excel 文件为空');
          return;
        }
        
        // 解析第一个工作表
        transactions = parseExcelToTransactions(sheets[0]);
        
        // 如果有多个工作表，可以合并所有工作表的数据
        if (sheets.length > 1) {
          for (let i = 1; i < sheets.length; i++) {
            const sheetTransactions = parseExcelToTransactions(sheets[i]);
            transactions = [...transactions, ...sheetTransactions];
          }
        }
      } else {
        // 处理 CSV 文件
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              transactions = parseCSV(text);
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error('读取文件失败'));
          reader.readAsText(file, 'UTF-8');
        });
      }

      if (transactions.length === 0) {
        setError('未能解析到有效数据');
        return;
      }

      onImport(transactions);
      setIsOpen(false);
      setFile(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
      >
        导入数据
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">导入数据</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setFile(null);
            setError('');
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择文件（CSV 或 Excel）
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              已选择: {file.name}
            </p>
          )}
        </div>
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            导入
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setFile(null);
              setError('');
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            取消
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>支持格式：CSV、Excel (.xlsx, .xls)</p>
          <p>CSV 格式要求：第一行：日期,类型,类别,金额,描述</p>
          <p>Excel 格式：自动识别表头（日期、类型、类别、金额、描述）</p>
          <p>类型：收入 或 支出</p>
        </div>
      </div>
    </div>
  );
}
