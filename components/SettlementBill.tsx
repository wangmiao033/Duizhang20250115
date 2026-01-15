'use client';

import { GameSettlementRecord, SettlementBillConfig } from '@/types';
import { calculateSettlementSummary } from '@/lib/settlement';
import { formatAmount, numberToChinese } from '@/lib/chineseNumber';

interface SettlementBillProps {
  records: GameSettlementRecord[];
  config: SettlementBillConfig;
}

export default function SettlementBill({ records, config }: SettlementBillProps) {
  const summary = calculateSettlementSummary(records);
  const sortedRecords = [...records].sort((a, b) => (a.serialNo || 0) - (b.serialNo || 0));

  return (
    <div className="bg-white p-8 print:p-4 print:bg-white" style={{ minHeight: '100vh' }}>
      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{config.title}</h1>
        <p className="text-lg text-gray-600">统计周期：{config.period}</p>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 左侧：付款方信息 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">付款方信息</h3>
            <div className="text-xs space-y-2 text-gray-700">
              <p><strong>公司名称：</strong>{config.payerCompany}</p>
              <p><strong>联系人：</strong>{config.payerContact}</p>
              <p><strong>联系电话：</strong>{config.payerPhone}</p>
              <p><strong>联系地址：</strong>{config.payerAddress}</p>
              <p className="mt-4"><strong>开户银行：</strong>{config.payerBank}</p>
              <p><strong>银行账号：</strong>{config.payerAccount}</p>
              <p className="mt-4"><strong>税号：</strong>{config.payerTaxId}</p>
              <p><strong>发票抬头：</strong>{config.payerInvoiceTitle}</p>
              <p><strong>发票项目：</strong>{config.payerInvoiceItem}</p>
              <p><strong>开票地址：</strong>{config.payerBillingAddress}</p>
              <p><strong>开票电话：</strong>{config.payerBillingPhone}</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-center text-gray-500">（盖章处）</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 p-2">
            <p>辛苦核对无误后【打印盖章】,一式一份或一式两份(如需回寄) 与发票一同寄至:</p>
          </div>
        </div>

        {/* 中间：对账单表格 */}
        <div className="lg:col-span-2">
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">序号</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">计费周期</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">游戏名称</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">流水</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">充值金额</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">测试费金额</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">代金券金额</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">退款</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">实际结算金额</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">渠道费</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">税费</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">结算比例</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold">结算金额</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="border border-gray-300 px-2 py-2 text-center">{record.serialNo}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{record.billingPeriod}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left">{record.gameName}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{formatAmount(record.flow)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{formatAmount(record.rechargeAmount)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{formatAmount(record.testFeeAmount)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{formatAmount(record.voucherAmount)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{record.refund > 0 ? formatAmount(record.refund) : '-'}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{formatAmount(record.actualSettlementAmount)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{formatAmount(record.channelFee)}%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{formatAmount(record.taxFee)}%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{formatAmount(record.settlementRatio)}%</td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{formatAmount(record.settlementAmount)}</td>
                  </tr>
                ))}
                {/* 合计行 */}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="border border-gray-300 px-2 py-2 text-center">合计</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ {formatAmount(summary.totalFlow)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ {formatAmount(summary.totalRechargeAmount)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ {formatAmount(summary.totalTestFeeAmount)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ {formatAmount(summary.totalVoucherAmount)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ -</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ {formatAmount(summary.totalActualSettlementAmount)}</td>
                  <td colSpan={3} className="border border-gray-300 px-2 py-2"></td>
                  <td className="border border-gray-300 px-2 py-2 text-right">¥ {formatAmount(summary.totalSettlementAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 结算金额大写 */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
            <p className="text-sm">
              <strong>结算金额（人民币大写）：</strong>
              <span className="text-lg font-bold text-gray-900 ml-2">
                {numberToChinese(summary.totalSettlementAmount)}
              </span>
            </p>
          </div>
        </div>

        {/* 右侧：收款方信息 */}
        <div className="lg:col-span-1 lg:col-start-3">
          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">收款方信息</h3>
            <div className="text-xs space-y-2 text-gray-700">
              <p><strong>公司名称：</strong>{config.receiverCompany}</p>
              <p><strong>联系人：</strong>{config.receiverContact}</p>
              <p><strong>联系电话：</strong>{config.receiverPhone}</p>
              <p><strong>联系地址：</strong>{config.receiverAddress}</p>
              <p className="mt-4"><strong>开户银行：</strong>{config.receiverBank}</p>
              <p><strong>银行账号：</strong>{config.receiverAccount}</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-center text-gray-500">（盖章处）</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 p-2 mt-2">
            <p>（需要回寄对账单请附上邮寄地址,没有地址不回寄）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
