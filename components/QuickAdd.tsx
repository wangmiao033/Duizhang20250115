'use client';

import { useState } from 'react';
import { Transaction } from '@/types';

interface QuickAddProps {
  onAdd: (transaction: Transaction) => void;
}

const quickCategories = [
  { type: 'income' as const, category: '游戏收入', label: '游戏收入' },
  { type: 'income' as const, category: '广告收入', label: '广告收入' },
  { type: 'expense' as const, category: '运营成本', label: '运营成本' },
  { type: 'expense' as const, category: '人员成本', label: '人员成本' },
  { type: 'expense' as const, category: '服务器费用', label: '服务器费用' },
];

export default function QuickAdd({ onAdd }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof quickCategories[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount || parseFloat(amount) <= 0) {
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: selectedCategory.type,
      category: selectedCategory.category,
      amount: parseFloat(amount),
      description: description || `${selectedCategory.label} - ${new Date().toLocaleDateString('zh-CN')}`,
      createdAt: new Date().toISOString(),
    };

    onAdd(transaction);
    setIsOpen(false);
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
      >
        快捷添加
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">快捷添加</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedCategory(null);
            setAmount('');
            setDescription('');
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择类别
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {quickCategories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  selectedCategory?.category === cat.category
                    ? cat.type === 'income'
                      ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                      : 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            金额（元）
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入金额"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            描述（可选）
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="可选：添加描述"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!selectedCategory || !amount}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            添加
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setSelectedCategory(null);
              setAmount('');
              setDescription('');
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
