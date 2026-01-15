import { GameSettlementRecord, SettlementSummary } from '@/types';

/**
 * 计算实际结算金额
 * 实际结算金额 = 充值金额 - 测试费金额 - 代金券金额 - 退款
 */
export const calculateActualSettlementAmount = (record: Partial<GameSettlementRecord>): number => {
  const rechargeAmount = record.rechargeAmount || 0;
  const testFeeAmount = record.testFeeAmount || 0;
  const voucherAmount = record.voucherAmount || 0;
  const refund = record.refund || 0;
  
  return Math.max(0, rechargeAmount - testFeeAmount - voucherAmount - refund);
};

/**
 * 计算结算金额
 * 结算金额 = 实际结算金额 × 结算比例
 */
export const calculateSettlementAmount = (record: Partial<GameSettlementRecord>): number => {
  const actualSettlementAmount = calculateActualSettlementAmount(record);
  const settlementRatio = record.settlementRatio || 0;
  
  return actualSettlementAmount * (settlementRatio / 100);
};

/**
 * 计算对账单汇总
 */
export const calculateSettlementSummary = (records: GameSettlementRecord[]): SettlementSummary => {
  return {
    totalFlow: records.reduce((sum, r) => sum + (r.flow || 0), 0),
    totalRechargeAmount: records.reduce((sum, r) => sum + (r.rechargeAmount || 0), 0),
    totalTestFeeAmount: records.reduce((sum, r) => sum + (r.testFeeAmount || 0), 0),
    totalVoucherAmount: records.reduce((sum, r) => sum + (r.voucherAmount || 0), 0),
    totalRefund: records.reduce((sum, r) => sum + (r.refund || 0), 0),
    totalActualSettlementAmount: records.reduce((sum, r) => sum + (r.actualSettlementAmount || 0), 0),
    totalSettlementAmount: records.reduce((sum, r) => sum + (r.settlementAmount || 0), 0),
  };
};

/**
 * 更新记录的计算字段
 */
export const updateCalculatedFields = (record: Partial<GameSettlementRecord>): GameSettlementRecord => {
  const actualSettlementAmount = calculateActualSettlementAmount(record);
  const settlementAmount = calculateSettlementAmount({ ...record, actualSettlementAmount });
  
  return {
    ...record as GameSettlementRecord,
    actualSettlementAmount,
    settlementAmount,
  };
};
