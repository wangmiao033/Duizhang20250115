'use client';

import { Summary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardProps {
  summary: Summary;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="text-green-100 text-sm font-medium mb-2">总收入</div>
        <div className="text-4xl font-bold">{formatCurrency(summary.totalIncome)}</div>
      </div>

      <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>
        <div className="text-red-100 text-sm font-medium mb-2">总支出</div>
        <div className="text-4xl font-bold">{formatCurrency(summary.totalExpense)}</div>
      </div>

      <div className={`p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform duration-200 ${
        summary.balance >= 0
          ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600'
          : 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className={`text-sm font-medium mb-2 ${
          summary.balance >= 0 ? 'text-blue-100' : 'text-orange-100'
        }`}>
          余额
        </div>
        <div className="text-4xl font-bold">{formatCurrency(summary.balance)}</div>
      </div>
    </div>
  );
}
