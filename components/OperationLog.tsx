'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  action: string;
  type: 'create' | 'update' | 'delete' | 'import' | 'export' | 'backup' | 'restore';
  target: string;
  timestamp: string;
  details?: string;
}

export default function OperationLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | LogEntry['type']>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const stored = localStorage.getItem('operationLogs');
    if (stored) {
      try {
        const parsedLogs = JSON.parse(stored);
        setLogs(parsedLogs.slice(-50).reverse()); // 只显示最近50条
      } catch (error) {
        console.error('Failed to load logs:', error);
      }
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const getTypeColor = (type: LogEntry['type']) => {
    const colors = {
      create: 'text-green-600 dark:text-green-400',
      update: 'text-blue-600 dark:text-blue-400',
      delete: 'text-red-600 dark:text-red-400',
      import: 'text-purple-600 dark:text-purple-400',
      export: 'text-indigo-600 dark:text-indigo-400',
      backup: 'text-amber-600 dark:text-amber-400',
      restore: 'text-orange-600 dark:text-orange-400',
    };
    return colors[type] || 'text-gray-600 dark:text-gray-400';
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      import: '📥',
      export: '📤',
      backup: '💾',
      restore: '🔄',
    };
    return icons[type] || '📝';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-slate-500 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
      >
        📋 操作日志
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">操作日志</h3>
        <div className="flex gap-3 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">全部</option>
            <option value="create">创建</option>
            <option value="update">更新</option>
            <option value="delete">删除</option>
            <option value="import">导入</option>
            <option value="export">导出</option>
            <option value="backup">备份</option>
            <option value="restore">恢复</option>
          </select>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无操作记录
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-xl">{getTypeIcon(log.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium text-sm ${getTypeColor(log.type)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {log.target}
                  {log.details && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      - {log.details}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 日志记录工具函数
export const logOperation = (
  action: string,
  type: LogEntry['type'],
  target: string,
  details?: string
) => {
  const log: LogEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    action,
    type,
    target,
    timestamp: new Date().toISOString(),
    details,
  };

  const stored = localStorage.getItem('operationLogs');
  const logs: LogEntry[] = stored ? JSON.parse(stored) : [];
  logs.push(log);
  
  // 只保留最近1000条日志
  if (logs.length > 1000) {
    logs.shift();
  }
  
  localStorage.setItem('operationLogs', JSON.stringify(logs));
};
