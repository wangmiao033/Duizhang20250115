'use client';

import { useState } from 'react';
import { Transaction } from '@/types';

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void;
  onCancel?: () => void;
  initialData?: Transaction;
}

const categories = {
  income: ['游戏收入', '广告收入', '其他收入'],
  expense: ['运营成本', '人员成本', '服务器费用', '营销费用', '其他支出'],
};

export default function TransactionForm({ onSubmit, onCancel, initialData }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || ('income' as 'income' | 'expense'),
    category: initialData?.category || '',
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: initialData?.id || Date.now().toString(),
      ...formData,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    onSubmit(transaction);
    if (!initialData) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: '',
        amount: 0,
        description: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {initialData ? '编辑记录' : '新增对账记录'}
        </h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            日期
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            类型
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income', category: '' })}
                className="mr-2"
              />
              <span className="text-green-600 dark:text-green-400">收入</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense', category: '' })}
                className="mr-2"
              />
              <span className="text-red-600 dark:text-red-400">支出</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            类别
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">请选择类别</option>
            {categories[formData.type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            金额（元）
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="请输入详细描述..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            {initialData ? '保存' : '添加'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-6 rounded-xl transition-all"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
