'use client';

import { useState } from 'react';
import { readExcelFile, type ExcelSheetData } from '@/lib/excel';

interface ExcelViewerProps {
  onDataLoaded?: (sheets: ExcelSheetData[]) => void;
}

export default function ExcelViewer({ onDataLoaded }: ExcelViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<ExcelSheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile);
        setError('');
        setLoading(true);
        
        try {
          const data = await readExcelFile(selectedFile);
          setSheets(data);
          setActiveSheetIndex(0);
          if (onDataLoaded) {
            onDataLoaded(data);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '读取文件失败');
          setSheets([]);
        } finally {
          setLoading(false);
        }
      } else {
        setError('请选择 Excel 文件（.xlsx 或 .xls）');
        setFile(null);
        setSheets([]);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-md"
      >
        查看 Excel
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Excel 文件查看器</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setFile(null);
            setSheets([]);
            setError('');
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择 Excel 文件
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              已选择: {file.name}
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            正在读取文件...
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {sheets.length > 0 && (
          <div className="space-y-4">
            {/* 工作表切换 */}
            {sheets.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择工作表
                </label>
                <div className="flex flex-wrap gap-2">
                  {sheets.map((sheet, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSheetIndex(index)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSheetIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 数据表格 */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
              <table className="w-full text-sm">
                <tbody>
                  {sheets[activeSheetIndex]?.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${
                        rowIndex === 0
                          ? 'bg-gray-100 dark:bg-gray-700 font-semibold'
                          : rowIndex % 2 === 0
                          ? 'bg-gray-50 dark:bg-gray-800'
                          : ''
                      } border-b border-gray-200 dark:border-gray-700`}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                        >
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 工作表信息 */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              工作表: {sheets[activeSheetIndex]?.name} | 
              行数: {sheets[activeSheetIndex]?.data.length} | 
              列数: {sheets[activeSheetIndex]?.data[0]?.length || 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
