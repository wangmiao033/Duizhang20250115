export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  income: number;
  expense: number;
  total: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

// 游戏结算对账单数据模型
export interface GameSettlementRecord {
  id: string;
  serialNo: number; // 序号
  billingPeriod: string; // 计费周期（如：2025年12月）
  gameName: string; // 游戏名称
  flow: number; // 流水
  rechargeAmount: number; // 充值金额
  testFeeAmount: number; // 测试费金额
  voucherAmount: number; // 代金券金额
  refund: number; // 退款
  actualSettlementAmount: number; // 实际结算金额（自动计算）
  channelFee: number; // 渠道费（百分比）
  taxFee: number; // 税费（百分比）
  settlementRatio: number; // 结算比例（百分比）
  settlementAmount: number; // 结算金额（自动计算）
  createdAt: string;
}

export interface SettlementSummary {
  totalFlow: number;
  totalRechargeAmount: number;
  totalTestFeeAmount: number;
  totalVoucherAmount: number;
  totalRefund: number;
  totalActualSettlementAmount: number;
  totalSettlementAmount: number;
}

// 对账单配置
export interface SettlementBillConfig {
  title: string; // 对账单标题
  period: string; // 统计周期（如：2025年12月01日-2025年12月31日）
  payerCompany: string; // 付款方公司名称
  payerContact: string; // 付款方联系人
  payerPhone: string; // 付款方电话
  payerAddress: string; // 付款方地址
  payerBank: string; // 付款方开户银行
  payerAccount: string; // 付款方银行账号
  payerTaxId: string; // 付款方税号
  payerInvoiceTitle: string; // 付款方发票抬头
  payerInvoiceItem: string; // 付款方发票项目
  payerBillingAddress: string; // 付款方开票地址
  payerBillingPhone: string; // 付款方开票电话
  receiverCompany: string; // 收款方公司名称
  receiverContact: string; // 收款方联系人
  receiverPhone: string; // 收款方电话
  receiverAddress: string; // 收款方地址
  receiverBank: string; // 收款方开户银行
  receiverAccount: string; // 收款方银行账号
}
