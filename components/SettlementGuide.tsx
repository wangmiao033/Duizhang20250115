'use client';

interface SettlementGuideProps {
  onClose: () => void;
}

export default function SettlementGuide({ onClose }: SettlementGuideProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          结算对账使用指南
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">📝 使用流程</h4>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>点击"新增结算记录"按钮</li>
            <li>填写游戏流水数据（游戏名称、充值金额等）</li>
            <li>系统自动计算实际结算金额和结算金额</li>
            <li>添加完所有游戏记录后，点击"查看对账单"</li>
            <li>核对无误后，点击"打印对账单"生成PDF或打印</li>
            <li>将打印的对账单盖章后寄给研发方</li>
          </ol>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">💡 重要说明</h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>实际结算金额</strong> = 充值金额 - 测试费金额 - 代金券金额 - 退款</li>
            <li><strong>结算金额</strong> = 实际结算金额 × 结算比例（如25%）</li>
            <li>所有金额字段系统会自动计算，无需手动输入</li>
            <li>序号会自动递增，也可以手动修改</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">📋 必填字段</h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>序号</strong>：记录的顺序号</li>
            <li><strong>计费周期</strong>：如"2025年12月"</li>
            <li><strong>游戏名称</strong>：游戏的完整名称</li>
            <li><strong>流水</strong>：游戏的总流水金额</li>
            <li><strong>充值金额</strong>：实际充值到账的金额</li>
            <li><strong>结算比例</strong>：通常为25%（根据合同约定）</li>
          </ul>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">⚡ 快捷操作</h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>可以批量导入Excel文件（支持从研发方提供的报表导入）</li>
            <li>对账单会自动汇总所有记录并计算合计</li>
            <li>支持编辑和删除已添加的记录</li>
            <li>打印时会自动隐藏操作按钮，只显示对账单内容</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
