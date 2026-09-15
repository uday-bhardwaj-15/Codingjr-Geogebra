import { useEffect } from 'react';
import { useConstructionStore } from '../store/useConstructionStore';

export function useKeyboardShortcuts() {
  const undo = useConstructionStore((state) => state.undo);
  const redo = useConstructionStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Unconditionally skip when user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            // Ctrl/Cmd + Shift + Z -> Redo
            e.preventDefault();
            redo();
          } else {
            // Ctrl/Cmd + Z -> Undo
            e.preventDefault();
            undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          // Ctrl/Cmd + Y -> Redo
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}
