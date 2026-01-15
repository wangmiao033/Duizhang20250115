'use client';

import { useState } from 'react';
import { GameSettlementRecord } from '@/types';
import { readExcelFile } from '@/lib/excel';
import { updateCalculatedFields } from '@/lib/settlement';

interface SettlementBatchImportProps {
  onImport: (records: GameSettlementRecord[]) => void;
}

export default function SettlementBatchImport({ onImport }: SettlementBatchImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('请选择 Excel 文件（.xlsx 或 .xls）');
        setFile(null);
      }
    }
  };

  const parseExcelToSettlementRecords = (sheetData: any[][]): GameSettlementRecord[] => {
    const records: GameSettlementRecord[] = [];
    
    if (sheetData.length < 2) {
      throw new Error('Excel 文件数据不足');
    }

    // 第一行是表头，尝试识别列
    const headers = sheetData[0].map((h: any) => String(h).trim().toLowerCase());
    
    // 查找列索引（支持多种可能的列名）
    const findColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => h.includes(name));
        if (index !== -1) return index;
      }
      return -1;
    };

    const serialNoIndex = findColumnIndex(['序号', '编号', 'serial']);
    const periodIndex = findColumnIndex(['计费周期', '周期', 'period', '月份', '月份']);
    const gameNameIndex = findColumnIndex(['游戏名称', '游戏', 'game', '游戏名']);
    const flowIndex = findColumnIndex(['流水', 'flow', '总流水']);
    const rechargeIndex = findColumnIndex(['充值金额', '充值', 'recharge', '金额']);
    const testFeeIndex = findColumnIndex(['测试费', 'test', '测试']);
    const voucherIndex = findColumnIndex(['代金券', 'voucher', '券']);
    const refundIndex = findColumnIndex(['退款', 'refund']);
    const channelFeeIndex = findColumnIndex(['渠道费', 'channel']);
    const taxFeeIndex = findColumnIndex(['税费', 'tax']);
    const ratioIndex = findColumnIndex(['结算比例', '比例', 'ratio', 'settlement']);

    // 从第二行开始解析数据
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || row.length === 0) continue;
      
      // 跳过空行
      if (row.every((cell: any) => !cell || String(cell).trim() === '')) continue;
      
      // 跳过合计行
      if (row.some((cell: any) => String(cell).includes('合计') || String(cell).includes('总计'))) continue;

      const record: Partial<GameSettlementRecord> = {
        id: Date.now().toString() + i,
        serialNo: serialNoIndex >= 0 ? parseInt(row[serialNoIndex]) || i : i,
        billingPeriod: periodIndex >= 0 ? String(row[periodIndex] || '').trim() : '',
        gameName: gameNameIndex >= 0 ? String(row[gameNameIndex] || '').trim() : '',
        flow: flowIndex >= 0 ? parseFloat(String(row[flowIndex] || 0)) : 0,
        rechargeAmount: rechargeIndex >= 0 ? parseFloat(String(row[rechargeIndex] || 0)) : 0,
        testFeeAmount: testFeeIndex >= 0 ? parseFloat(String(row[testFeeIndex] || 0)) : 0,
        voucherAmount: voucherIndex >= 0 ? parseFloat(String(row[voucherIndex] || 0)) : 0,
        refund: refundIndex >= 0 ? parseFloat(String(row[refundIndex] || 0)) : 0,
        channelFee: channelFeeIndex >= 0 ? parseFloat(String(row[channelFeeIndex] || 0)) : 0,
        taxFee: taxFeeIndex >= 0 ? parseFloat(String(row[taxFeeIndex] || 0)) : 0,
        settlementRatio: ratioIndex >= 0 ? parseFloat(String(row[ratioIndex] || 25)) : 25,
        createdAt: new Date().toISOString(),
      };

      // 如果游戏名称为空，跳过
      if (!record.gameName) continue;

      // 更新计算字段
      const finalRecord = updateCalculatedFields(record);
      records.push(finalRecord);
    }

    return records;
  };

  const handleImport = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    setLoading(true);
    try {
      const sheets = await readExcelFile(file);
      if (sheets.length === 0) {
        setError('Excel 文件为空');
        setLoading(false);
        return;
      }

      // 解析第一个工作表
      const records = parseExcelToSettlementRecords(sheets[0].data);
      
      if (records.length === 0) {
        setError('未能解析到有效数据，请检查Excel格式');
        setLoading(false);
        return;
      }

      onImport(records);
      setIsOpen(false);
      setFile(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        批量导入
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">批量导入结算记录</h3>
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
            选择 Excel 文件
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              已选择: {file.name}
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">Excel 格式要求：</p>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>第一行为表头，包含：序号、计费周期、游戏名称、流水、充值金额等字段</li>
            <li>支持中文或英文列名（如：序号/Serial、游戏名称/Game Name）</li>
            <li>系统会自动识别列名并解析数据</li>
            <li>测试费、代金券、退款等字段可选，默认为0</li>
            <li>结算比例默认为25%，可在Excel中指定</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? '导入中...' : '导入'}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setFile(null);
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
