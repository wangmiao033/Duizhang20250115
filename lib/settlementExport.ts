import * as XLSX from 'xlsx';
import { GameSettlementRecord, SettlementBillConfig } from '@/types';
import { calculateSettlementSummary } from './settlement';
import { formatAmount, numberToChinese } from './chineseNumber';

/**
 * 导出结算对账单为 Excel
 */
export const exportSettlementToExcel = (
  records: GameSettlementRecord[],
  config: SettlementBillConfig
): void => {
  const workbook = XLSX.utils.book_new();
  const summary = calculateSettlementSummary(records);
  const sortedRecords = [...records].sort((a, b) => (a.serialNo || 0) - (b.serialNo || 0));

  // 准备数据
  const worksheetData: any[][] = [
    // 标题行
    [config.title],
    [`统计周期：${config.period}`],
    [], // 空行
    // 表头
    [
      '序号',
      '计费周期',
      '游戏名称',
      '流水',
      '充值金额',
      '测试费金额',
      '代金券金额',
      '退款',
      '实际结算金额',
      '渠道费',
      '税费',
      '结算比例',
      '结算金额',
    ],
  ];

  // 添加数据行
  sortedRecords.forEach((record) => {
    worksheetData.push([
      record.serialNo,
      record.billingPeriod,
      record.gameName,
      record.flow,
      record.rechargeAmount,
      record.testFeeAmount,
      record.voucherAmount,
      record.refund,
      record.actualSettlementAmount,
      record.channelFee,
      record.taxFee,
      record.settlementRatio,
      record.settlementAmount,
    ]);
  });

  // 添加合计行
  worksheetData.push([]); // 空行
  worksheetData.push([
    '合计',
    '',
    '',
    summary.totalFlow,
    summary.totalRechargeAmount,
    summary.totalTestFeeAmount,
    summary.totalVoucherAmount,
    '-',
    summary.totalActualSettlementAmount,
    '',
    '',
    '',
    summary.totalSettlementAmount,
  ]);

  // 添加结算金额大写
  worksheetData.push([]);
  worksheetData.push(['结算金额（人民币大写）：', numberToChinese(summary.totalSettlementAmount)]);

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 8 },  // 序号
    { wch: 12 }, // 计费周期
    { wch: 25 }, // 游戏名称
    { wch: 12 }, // 流水
    { wch: 12 }, // 充值金额
    { wch: 12 }, // 测试费金额
    { wch: 12 }, // 代金券金额
    { wch: 10 }, // 退款
    { wch: 15 }, // 实际结算金额
    { wch: 10 }, // 渠道费
    { wch: 10 }, // 税费
    { wch: 12 }, // 结算比例
    { wch: 12 }, // 结算金额
  ];

  // 合并标题行
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // 标题行
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // 统计周期行
  ];

  // 添加工作表
  XLSX.utils.book_append_sheet(workbook, worksheet, '结算对账单');

  // 生成文件名
  const filename = `${config.title}_${config.period || new Date().toISOString().split('T')[0]}.xlsx`;

  // 导出文件
  XLSX.writeFile(workbook, filename);
};
