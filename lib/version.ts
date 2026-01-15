// 版本管理工具

export const APP_VERSION = '1.2.0';
export const VERSION_KEY = 'duizhang_version';

export interface VersionInfo {
  version: string;
  updateTime: string;
  changelog: string;
}

export const getCurrentVersion = (): string => {
  if (typeof window === 'undefined') return APP_VERSION;
  return localStorage.getItem(VERSION_KEY) || APP_VERSION;
};

export const setCurrentVersion = (version: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERSION_KEY, version);
};

export const checkVersionUpdate = (): { isNew: boolean; currentVersion: string; newVersion: string } => {
  const currentVersion = getCurrentVersion();
  const isNew = currentVersion !== APP_VERSION;
  
  if (isNew) {
    setCurrentVersion(APP_VERSION);
  }
  
  return {
    isNew,
    currentVersion,
    newVersion: APP_VERSION,
  };
};

export const getVersionHistory = (): VersionInfo[] => {
  const historyKey = 'duizhang_version_history';
  if (typeof window === 'undefined') return [];
  
  const history = localStorage.getItem(historyKey);
  if (!history) return [];
  
  try {
    return JSON.parse(history) as VersionInfo[];
  } catch {
    return [];
  }
};

export const addVersionHistory = (info: VersionInfo): void => {
  const historyKey = 'duizhang_version_history';
  if (typeof window === 'undefined') return;
  
  const history = getVersionHistory();
  history.unshift(info); // 添加到开头
  
  // 只保留最近 10 个版本记录
  const limitedHistory = history.slice(0, 10);
  localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
};

export const getChangelogForVersion = (version: string): string => {
  // 这里可以从 CHANGELOG.md 中解析，或者维护一个版本变更映射
  const changelogMap: Record<string, string> = {
    '1.2.0': `
新增功能：
- Toast 提示系统
- 确认对话框组件
- 批量操作功能
- 数据排序功能
- 快捷添加功能
- 年度统计视图
- 详细统计卡片
- Excel 导出功能
    `,
    '1.1.0': `
新增功能：
- 日期范围筛选
- 类别统计图表
- 月度统计报表
- 数据导入功能（CSV）
- 数据备份和恢复功能（JSON）
- 打印功能
    `,
    '1.0.0': `
初始版本：
- 基础对账记录管理
- 数据统计和筛选
- CSV 导出
- 响应式设计
    `,
  };
  
  return changelogMap[version] || '暂无更新日志';
};
