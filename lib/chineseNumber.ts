/**
 * 将数字转换为中文大写金额
 */
export const numberToChinese = (num: number): string => {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  
  if (num === 0) return '零元整';
  
  // 分离整数和小数部分
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = '';
  
  // 处理整数部分
  if (integerPart > 0) {
    const integerStr = integerPart.toString();
    const len = integerStr.length;
    
    // 处理万位以上
    if (len > 4) {
      const wanPart = Math.floor(integerPart / 10000);
      const gePart = integerPart % 10000;
      
      if (wanPart > 0) {
        result += convertPart(wanPart, digits, units) + '万';
      }
      if (gePart > 0) {
        const geStr = convertPart(gePart, digits, units);
        if (wanPart > 0 && gePart < 1000) {
          result += '零';
        }
        result += geStr;
      }
    } else {
      result += convertPart(integerPart, digits, units);
    }
    
    result += '元';
  }
  
  // 处理小数部分（角、分）
  if (decimalPart > 0) {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;
    
    if (jiao > 0) {
      result += digits[jiao] + '角';
    }
    if (fen > 0) {
      result += digits[fen] + '分';
    }
  } else {
    result += '整';
  }
  
  return result;
};

// 转换四位数字部分
const convertPart = (num: number, digits: string[], units: string[]): string => {
  if (num === 0) return '';
  
  const str = num.toString().padStart(4, '0');
  let result = '';
  let hasZero = false;
  
  for (let i = 0; i < 4; i++) {
    const digit = parseInt(str[i]);
    const pos = 3 - i;
    
    if (digit !== 0) {
      if (hasZero) {
        result += '零';
        hasZero = false;
      }
      result += digits[digit] + units[pos];
    } else if (result && pos > 0) {
      hasZero = true;
    }
  }
  
  return result;
};

/**
 * 格式化金额显示（带千分位）
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
