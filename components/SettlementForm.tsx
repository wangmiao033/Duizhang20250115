'use client';

import { useState, useEffect } from 'react';
import { GameSettlementRecord } from '@/types';
import { updateCalculatedFields } from '@/lib/settlement';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementFormProps {
  onSubmit: (record: GameSettlementRecord) => void;
  onCancel?: () => void;
  initialData?: GameSettlementRecord;
}

export default function SettlementForm({ onSubmit, onCancel, initialData }: SettlementFormProps) {
  const [formData, setFormData] = useState<Partial<GameSettlementRecord>>({
    serialNo: initialData?.serialNo || 1,
    billingPeriod: initialData?.billingPeriod || '',
    gameName: initialData?.gameName || '',
    flow: initialData?.flow || 0,
    rechargeAmount: initialData?.rechargeAmount || 0,
    testFeeAmount: initialData?.testFeeAmount || 0,
    voucherAmount: initialData?.voucherAmount || 0,
    refund: initialData?.refund || 0,
    channelFee: initialData?.channelFee || 0,
    taxFee: initialData?.taxFee || 0,
    settlementRatio: initialData?.settlementRatio || 25,
  });

  const [calculated, setCalculated] = useState({
    actualSettlementAmount: 0,
    settlementAmount: 0,
  });

  useEffect(() => {
    const updated = updateCalculatedFields(formData);
    setCalculated({
      actualSettlementAmount: updated.actualSettlementAmount,
      settlementAmount: updated.settlementAmount,
    });
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 数据验证
    if (!formData.billingPeriod || !formData.billingPeriod.trim()) {
      alert('请输入计费周期');
      return;
    }
    if (!formData.gameName || !formData.gameName.trim()) {
      alert('请输入游戏名称');
      return;
    }
    if (!formData.rechargeAmount || formData.rechargeAmount <= 0) {
      alert('请输入有效的充值金额');
      return;
    }
    if (!formData.settlementRatio || formData.settlementRatio <= 0 || formData.settlementRatio > 100) {
      alert('请输入有效的结算比例（0-100）');
      return;
    }

    const record = updateCalculatedFields({
      ...formData,
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
    onSubmit(record);
    
    if (!initialData) {
      setFormData({
        serialNo: (formData.serialNo || 0) + 1,
        billingPeriod: formData.billingPeriod || '',
        gameName: '',
        flow: 0,
        rechargeAmount: 0,
        testFeeAmount: 0,
        voucherAmount: 0,
        refund: 0,
        channelFee: 0,
        taxFee: 0,
        settlementRatio: 25,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {initialData ? '编辑结算记录' : '新增结算记录'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            序号
          </label>
          <input
            type="number"
            value={formData.serialNo || ''}
            onChange={(e) => setFormData({ ...formData, serialNo: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            计费周期 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.billingPeriod}
            onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="如：2025年12月"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">格式：YYYY年MM月，如：2025年12月</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            游戏名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.gameName}
            onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入游戏完整名称，如：一起来修仙 (0.05折)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            流水（元） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.flow || ''}
            onChange={(e) => setFormData({ ...formData, flow: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="游戏总流水金额"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            充值金额（元） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.rechargeAmount || ''}
            onChange={(e) => setFormData({ ...formData, rechargeAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="实际充值到账金额"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            测试费金额（元）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.testFeeAmount || ''}
            onChange={(e) => setFormData({ ...formData, testFeeAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            代金券金额（元）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.voucherAmount || ''}
            onChange={(e) => setFormData({ ...formData, voucherAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            退款（元）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.refund || ''}
            onChange={(e) => setFormData({ ...formData, refund: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            渠道费（%）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.channelFee || ''}
            onChange={(e) => setFormData({ ...formData, channelFee: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            税费（%）
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.taxFee || ''}
            onChange={(e) => setFormData({ ...formData, taxFee: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            结算比例（%） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.settlementRatio || ''}
            onChange={(e) => setFormData({ ...formData, settlementRatio: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="通常为25"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">根据合同约定，通常为25%</p>
        </div>

        {/* 自动计算字段 */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div>
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              实际结算金额（自动计算）
            </label>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              ¥ {formatAmount(calculated.actualSettlementAmount)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              充值金额 - 测试费 - 代金券 - 退款
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              结算金额（自动计算）
            </label>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              ¥ {formatAmount(calculated.settlementAmount)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              实际结算金额 × 结算比例
            </div>
          </div>
        </div>
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
    </form>
  );
}
