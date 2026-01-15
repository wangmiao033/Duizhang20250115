import { GameSettlementRecord, SettlementBillConfig } from '@/types';

const SETTLEMENT_RECORDS_KEY = 'duizhang_settlement_records';
const SETTLEMENT_CONFIG_KEY = 'duizhang_settlement_config';

// 默认配置
const defaultConfig: SettlementBillConfig = {
  title: '结算对账单',
  period: '',
  payerCompany: '广州南游网络科技有限公司',
  payerContact: '李小姐',
  payerPhone: '13418032315',
  payerAddress: '广州市天河区建中路64号佳都商务大厦西塔301',
  payerBank: '招商银行股份有限公司广州科技园支行',
  payerAccount: '120920031510902',
  payerTaxId: '91440101MA9Y0Y20XQ',
  payerInvoiceTitle: '广州南游网络科技有限公司',
  payerInvoiceItem: '*信息系统服务*信息服务费',
  payerBillingAddress: '广州市天河区建中路64, 66号西301-1房',
  payerBillingPhone: '020-38801635',
  receiverCompany: '广州熊动科技有限公司',
  receiverContact: '王淼',
  receiverPhone: '18610308952',
  receiverAddress: '广州市天河区体育东路南方证券大厦21层2107-A门',
  receiverBank: '中国工商银行股份有限公司广州兴华支行',
  receiverAccount: '3602841509200157769',
};

export const getSettlementRecords = (): GameSettlementRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SETTLEMENT_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSettlementRecord = (record: GameSettlementRecord): void => {
  const records = getSettlementRecords();
  const index = records.findIndex(r => r.id === record.id);
  
  if (index !== -1) {
    records[index] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem(SETTLEMENT_RECORDS_KEY, JSON.stringify(records));
};

export const deleteSettlementRecord = (id: string): void => {
  const records = getSettlementRecords();
  const filtered = records.filter(r => r.id !== id);
  localStorage.setItem(SETTLEMENT_RECORDS_KEY, JSON.stringify(filtered));
};

export const clearSettlementRecords = (): void => {
  localStorage.removeItem(SETTLEMENT_RECORDS_KEY);
};

export const getSettlementConfig = (): SettlementBillConfig => {
  if (typeof window === 'undefined') return defaultConfig;
  const data = localStorage.getItem(SETTLEMENT_CONFIG_KEY);
  return data ? JSON.parse(data) : defaultConfig;
};

export const saveSettlementConfig = (config: Partial<SettlementBillConfig>): void => {
  const currentConfig = getSettlementConfig();
  const updatedConfig = { ...currentConfig, ...config };
  localStorage.setItem(SETTLEMENT_CONFIG_KEY, JSON.stringify(updatedConfig));
};
