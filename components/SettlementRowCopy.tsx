'use client';

import { useState } from 'react';
import { GameSettlementRecord } from '@/types';
import { updateCalculatedFields } from '@/lib/settlement';

interface SettlementRowCopyProps {
  onPaste: (records: GameSettlementRecord[]) => void;
}

export default function SettlementRowCopy({ onPaste }: SettlementRowCopyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState('');

  const parsePastedData = (text: string): GameSettlementRecord[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('没有数据');
    }

    const records: GameSettlementRecord[] = [];
    let serialNo = 1;

    lines.forEach((line, index) => {
      // 跳过表头行
      if (line.includes('序号') || line.includes('Serial') || line.includes('游戏名称')) {
        return;
      }

      // 尝试多种分隔符：制表符、逗号、多个空格
      const parts = line.split(/\t|,|\s{2,}/).map(p => p.trim()).filter(p => p);
      
      if (parts.length < 3) return; // 至少需要游戏名称、流水、充值金额

      try {
        const record: Partial<GameSettlementRecord> = {
          id: Date.now().toString() + index,
          serialNo: serialNo++,
          billingPeriod: parts[1] || new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
          gameName: parts[2] || parts[0] || '',
          flow: parseFloat(parts[3] || parts[1] || '0') || 0,
          rechargeAmount: parseFloat(parts[4] || parts[2] || '0') || 0,
          testFeeAmount: parseFloat(parts[5] || '0') || 0,
          voucherAmount: parseFloat(parts[6] || '0') || 0,
          refund: parseFloat(parts[7] || '0') || 0,
          channelFee: parseFloat(parts[8] || '0') || 0,
          taxFee: parseFloat(parts[9] || '0') || 0,
          settlementRatio: parseFloat(parts[10] || '25') || 25,
          createdAt: new Date().toISOString(),
        };

        if (!record.gameName || record.gameName === '') {
          return; // 跳过没有游戏名称的行
        }

        const finalRecord = updateCalculatedFields(record);
        records.push(finalRecord);
      } catch (err) {
        // 跳过解析失败的行
        console.warn('解析失败的行:', line);
      }
    });

    return records;
  };

  const handlePaste = () => {
    if (!pasteText.trim()) {
      setError('请先粘贴数据');
      return;
    }

    try {
      const records = parsePastedData(pasteText);
      if (records.length === 0) {
        setError('未能解析到有效数据，请检查格式');
        return;
      }

      onPaste(records);
      setIsOpen(false);
      setPasteText('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        粘贴数据
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">粘贴数据</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setPasteText('');
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
            从 Excel 或其他表格复制数据并粘贴到这里
          </label>
          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
            rows={10}
            placeholder="从Excel复制数据后粘贴 here...&#10;&#10;示例格式：&#10;1	2025年12月	一起来修仙	3286873	16434.37	0	848.88	0	15585.49	0	0	25	3896.37"
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">使用说明：</p>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>从 Excel 表格中复制数据（包括表头）</li>
            <li>支持制表符、逗号或空格分隔的数据</li>
            <li>系统会自动识别列顺序并解析</li>
            <li>至少需要包含：游戏名称、流水、充值金额</li>
            <li>其他字段可选，会自动设置为默认值</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            导入数据
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setPasteText('');
              setError('');
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
