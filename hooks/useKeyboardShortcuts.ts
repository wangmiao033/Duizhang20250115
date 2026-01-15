import { useEffect, useRef } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const shortcutsRef = useRef(shortcuts);
  
  // 更新 ref，但不触发重新注册事件监听器
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了 Ctrl 或 Cmd
      const isModifierPressed = e.ctrlKey || e.metaKey;
      
      // 组合键格式：Ctrl+K 或 Cmd+K
      const key = isModifierPressed ? `ctrl+${e.key.toLowerCase()}` : e.key.toLowerCase();
      
      // 检查是否有对应的快捷键
      if (shortcutsRef.current[key]) {
        e.preventDefault();
        shortcutsRef.current[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // 空依赖数组，只在组件挂载时注册一次
};
