import { GameSettlementRecord, SettlementBillConfig } from '@/types';
import { formatAmount } from './chineseNumber';

/**
 * 导出结算数据为PDF格式（使用浏览器打印功能）
 */
export function exportSettlementToPDF(
  records: GameSettlementRecord[],
  config: SettlementBillConfig
): void {
  // 创建一个新窗口用于打印
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口，请检查浏览器弹窗设置');
    return;
  }

  // 计算汇总数据
  const totalRecharge = records.reduce((sum, r) => sum + r.rechargeAmount, 0);
  const totalSettlement = records.reduce((sum, r) => sum + r.settlementAmount, 0);
  const totalActualSettlement = records.reduce((sum, r) => sum + r.actualSettlementAmount, 0);

  // 生成HTML内容
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>结算对账单</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Microsoft YaHei', Arial, sans-serif;
          font-size: 12px;
          color: #000;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        .info-label {
          width: 120px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .summary {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #000;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body {
            padding: 10px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>游戏结算对账单</h1>
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">付款方：</span>
            <span>${config.payerName || '未设置'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">收款方：</span>
            <span>${config.payeeName || '未设置'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">结算周期：</span>
            <span>${config.period || '未设置'}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>游戏名称</th>
            <th>计费周期</th>
            <th>充值金额</th>
            <th>流水</th>
            <th>结算比例</th>
            <th>结算金额</th>
            <th>实际结算金额</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((record, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${record.gameName}</td>
              <td>${record.billingPeriod}</td>
              <td class="text-right">${formatAmount(record.rechargeAmount)}</td>
              <td class="text-right">${formatAmount(record.flow)}</td>
              <td class="text-right">${record.settlementRatio}%</td>
              <td class="text-right">${formatAmount(record.settlementAmount)}</td>
              <td class="text-right">${formatAmount(record.actualSettlementAmount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>合计充值金额：</span>
          <span>${formatAmount(totalRecharge)}</span>
        </div>
        <div class="summary-row">
          <span>合计结算金额：</span>
          <span>${formatAmount(totalSettlement)}</span>
        </div>
        <div class="summary-row">
          <span>合计实际结算金额：</span>
          <span>${formatAmount(totalActualSettlement)}</span>
        </div>
      </div>

      <div class="footer">
        <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
        <p>本对账单由系统自动生成</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // 等待内容加载后触发打印
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
