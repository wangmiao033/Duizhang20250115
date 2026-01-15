'use client';

import { GameSettlementRecord } from '@/types';
import { formatAmount } from '@/lib/chineseNumber';

interface SettlementValidationProps {
  records: GameSettlementRecord[];
}

interface ValidationIssue {
  type: 'warning' | 'error';
  message: string;
  recordId: string;
  recordName: string;
}

export default function SettlementValidation({ records }: SettlementValidationProps) {
  const validateRecords = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    records.forEach(record => {
      // 检查实际结算金额是否为负数
      if (record.actualSettlementAmount < 0) {
        issues.push({
          type: 'error',
          message: '实际结算金额为负数',
          recordId: record.id,
          recordName: record.gameName,
        });
      }

      // 检查结算金额是否异常大（超过充值金额）
      if (record.settlementAmount > record.rechargeAmount) {
        issues.push({
          type: 'warning',
          message: `结算金额(${formatAmount(record.settlementAmount)})超过充值金额(${formatAmount(record.rechargeAmount)})`,
          recordId: record.id,
          recordName: record.gameName,
        });
      }

      // 检查结算比例是否异常
      if (record.settlementRatio > 100) {
        issues.push({
          type: 'error',
          message: '结算比例超过100%',
          recordId: record.id,
          recordName: record.gameName,
        });
      }

      // 检查是否有重复的游戏名称
      const duplicates = records.filter(r => r.gameName === record.gameName && r.billingPeriod === record.billingPeriod);
      if (duplicates.length > 1) {
        issues.push({
          type: 'warning',
          message: `同一周期存在重复的游戏记录`,
          recordId: record.id,
          recordName: record.gameName,
        });
      }

      // 检查流水是否异常（流水为0但充值金额不为0）
      if (record.flow === 0 && record.rechargeAmount > 0) {
        issues.push({
          type: 'warning',
          message: '流水为0但充值金额不为0，请检查数据',
          recordId: record.id,
          recordName: record.gameName,
        });
      }
    });

    return issues;
  };

  const issues = validateRecords();

  if (issues.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-800 dark:text-green-200 font-medium">数据校验通过，未发现异常</span>
        </div>
      </div>
    );
  }

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 dark:text-red-200 font-bold">发现 {errors.length} 个错误</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
            {errors.map((issue, index) => (
              <li key={index}>
                <strong>{issue.recordName}</strong>: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200 font-bold">发现 {warnings.length} 个警告</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            {warnings.map((issue, index) => (
              <li key={index}>
                <strong>{issue.recordName}</strong>: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
