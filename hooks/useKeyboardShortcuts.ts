import { useEffect } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了 Ctrl 或 Cmd
      const isModifierPressed = e.ctrlKey || e.metaKey;
      
      // 组合键格式：Ctrl+K 或 Cmd+K
      const key = isModifierPressed ? `ctrl+${e.key.toLowerCase()}` : e.key.toLowerCase();
      
      // 检查是否有对应的快捷键
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
