import * as XLSX from 'xlsx';
import { Transaction } from '@/types';

export interface ExcelSheetData {
  name: string;
  data: any[][];
}

/**
 * 读取 Excel 文件
 */
export const readExcelFile = (file: File): Promise<ExcelSheetData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: ExcelSheetData[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          sheets.push({
            name: sheetName,
            data: jsonData as any[][],
          });
        });
        
        resolve(sheets);
      } catch (error) {
        reject(new Error('读取 Excel 文件失败：' + (error instanceof Error ? error.message : '未知错误')));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 解析 Excel 数据为交易记录
 */
export const parseExcelToTransactions = (sheetData: ExcelSheetData): Transaction[] => {
  const transactions: Transaction[] = [];
  
  if (sheetData.data.length < 2) {
    return transactions;
  }
  
  // 第一行是表头
  const headers = sheetData.data[0].map((h: any) => String(h).trim());
  
  // 查找列索引
  const dateIndex = headers.findIndex(h => 
    h.includes('日期') || h.includes('Date') || h.includes('date')
  );
  const typeIndex = headers.findIndex(h => 
    h.includes('类型') || h.includes('Type') || h.includes('type') ||
    h.includes('收入') || h.includes('支出')
  );
  const categoryIndex = headers.findIndex(h => 
    h.includes('类别') || h.includes('Category') || h.includes('category') ||
    h.includes('项目') || h.includes('项目名称')
  );
  const amountIndex = headers.findIndex(h => 
    h.includes('金额') || h.includes('Amount') || h.includes('amount') ||
    h.includes('收入金额') || h.includes('支出金额')
  );
  const descIndex = headers.findIndex(h => 
    h.includes('描述') || h.includes('Description') || h.includes('description') ||
    h.includes('备注') || h.includes('说明')
  );
  
  // 从第二行开始解析数据
  for (let i = 1; i < sheetData.data.length; i++) {
    const row = sheetData.data[i];
    if (!row || row.length === 0) continue;
    
    // 跳过空行
    if (row.every((cell: any) => !cell || String(cell).trim() === '')) continue;
    
    const date = dateIndex >= 0 ? parseDate(row[dateIndex]) : new Date().toISOString().split('T')[0];
    const type = typeIndex >= 0 ? parseType(row[typeIndex]) : 'expense';
    const category = categoryIndex >= 0 ? String(row[categoryIndex] || '').trim() : '';
    const amount = amountIndex >= 0 ? parseAmount(row[amountIndex]) : 0;
    const description = descIndex >= 0 ? String(row[descIndex] || '').trim() : '';
    
    // 如果金额为0，跳过
    if (amount === 0) continue;
    
    transactions.push({
      id: Date.now().toString() + i,
      date,
      type,
      category,
      amount,
      description,
      createdAt: new Date().toISOString(),
    });
  }
  
  return transactions;
};

/**
 * 解析日期
 */
const parseDate = (value: any): string => {
  if (!value) return new Date().toISOString().split('T')[0];
  
  // 如果是 Excel 日期数字
  if (typeof value === 'number') {
    const excelDate = XLSX.SSF.parse_date_code(value);
    if (excelDate) {
      const date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      return date.toISOString().split('T')[0];
    }
  }
  
  // 如果是日期字符串
  const dateStr = String(value).trim();
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  // 尝试解析其他格式
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
};

/**
 * 解析类型（收入/支出）
 */
const parseType = (value: any): 'income' | 'expense' => {
  if (!value) return 'expense';
  
  const str = String(value).trim().toLowerCase();
  if (str.includes('收入') || str.includes('income') || str.includes('+')) {
    return 'income';
  }
  if (str.includes('支出') || str.includes('expense') || str.includes('outcome') || str.includes('-')) {
    return 'expense';
  }
  
  return 'expense';
};

/**
 * 解析金额
 */
const parseAmount = (value: any): number => {
  if (!value) return 0;
  
  // 如果是数字
  if (typeof value === 'number') {
    return Math.abs(value);
  }
  
  // 如果是字符串，移除货币符号和空格
  const str = String(value).trim().replace(/[¥$€£,\s]/g, '');
  const num = parseFloat(str);
  
  return isNaN(num) ? 0 : Math.abs(num);
};

/**
 * 导出为 Excel 格式（真正的 Excel 文件）
 */
export const exportToExcelFile = (transactions: Transaction[], filename?: string): void => {
  const workbook = XLSX.utils.book_new();
  
  // 准备数据
  const headers = ['日期', '类型', '类别', '金额', '描述'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? '收入' : '支出',
    t.category,
    t.amount,
    t.description || '',
  ]);
  
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 12 }, // 日期
    { wch: 8 },  // 类型
    { wch: 15 }, // 类别
    { wch: 12 }, // 金额
    { wch: 30 }, // 描述
  ];
  
  // 添加工作表
  XLSX.utils.book_append_sheet(workbook, worksheet, '对账单');
  
  // 生成文件名
  const defaultFilename = `对账单_${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;
  
  // 导出文件
  XLSX.writeFile(workbook, finalFilename);
};

/**
 * 导出为对账单格式（根据模板格式）
 */
export const exportToStatementFormat = (
  transactions: Transaction[],
  title: string = '对账单',
  filename?: string
): void => {
  const workbook = XLSX.utils.book_new();
  
  // 计算统计信息
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  // 准备数据 - 按照对账单格式
  const worksheetData: any[][] = [
    [title], // 标题
    [], // 空行
    ['日期', '类型', '类别', '金额', '描述'], // 表头
  ];
  
  // 添加数据行
  transactions.forEach(t => {
    worksheetData.push([
      t.date,
      t.type === 'income' ? '收入' : '支出',
      t.category,
      t.amount,
      t.description || '',
    ]);
  });
  
  // 添加统计行
  worksheetData.push([]); // 空行
  worksheetData.push(['合计', '', '', '', '']);
  worksheetData.push(['总收入', '', '', totalIncome, '']);
  worksheetData.push(['总支出', '', '', totalExpense, '']);
  worksheetData.push(['余额', '', '', balance, '']);
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 12 }, // 日期
    { wch: 8 },  // 类型
    { wch: 15 }, // 类别
    { wch: 12 }, // 金额
    { wch: 30 }, // 描述
  ];
  
  // 合并标题行
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // 合并标题行
  ];
  
  // 添加工作表
  XLSX.utils.book_append_sheet(workbook, worksheet, '对账单');
  
  // 生成文件名
  const defaultFilename = `${title}_${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;
  
  // 导出文件
  XLSX.writeFile(workbook, finalFilename);
};
