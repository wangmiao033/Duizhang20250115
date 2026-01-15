'use client';

import { useState, useEffect } from 'react';
import { APP_VERSION, checkVersionUpdate, getVersionHistory, getChangelogForVersion, addVersionHistory, type VersionInfo } from '@/lib/version';

export default function VersionInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [versionUpdate, setVersionUpdate] = useState<{ isNew: boolean; currentVersion: string; newVersion: string } | null>(null);
  const [versionHistory, setVersionHistory] = useState<VersionInfo[]>([]);

  useEffect(() => {
    const update = checkVersionUpdate();
    setVersionUpdate(update);
    
    if (update.isNew) {
      addVersionHistory({
        version: update.newVersion,
        updateTime: new Date().toISOString(),
        changelog: getChangelogForVersion(update.newVersion),
      });
    }
    
    setVersionHistory(getVersionHistory());
  }, []);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded-md shadow-lg transition-colors"
          title="查看版本信息"
        >
          v{APP_VERSION}
        </button>
        {versionUpdate?.isNew && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            !
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">版本信息</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">当前版本</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            v{APP_VERSION}
          </div>
        </div>

        {versionUpdate?.isNew && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              检测到新版本更新！
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              从 v{versionUpdate.currentVersion} 更新到 v{versionUpdate.newVersion}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            更新日志
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 max-h-40 overflow-y-auto">
            {versionHistory.length > 0 ? (
              versionHistory.map((info, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                  <div className="font-semibold">v{info.version}</div>
                  <div className="text-gray-500 dark:text-gray-500">
                    {new Date(info.updateTime).toLocaleString('zh-CN')}
                  </div>
                  <div className="mt-1 whitespace-pre-line">{info.changelog}</div>
                </div>
              ))
            ) : (
              <div>暂无版本历史记录</div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <a
            href="https://github.com/wangmiao033/Duizhang20250115/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            查看完整更新日志 →
          </a>
        </div>
      </div>
    </div>
  );
}
