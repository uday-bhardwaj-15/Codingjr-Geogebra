import { create } from 'zustand';

export interface ActiveMathInputTarget {
  id: string;
  insertText: (text: string) => void;
  backspace: () => void;
  focus?: () => void;
}

interface MathInputState {
  activeTarget: ActiveMathInputTarget | null;
  isKeyboardOpen: boolean;
  setActiveTarget: (target: ActiveMathInputTarget | null) => void;
  toggleKeyboard: () => void;
  setKeyboardOpen: (open: boolean) => void;
  insertToken: (token: string) => void;
  handleBackspace: () => void;
}

export const useActiveMathInputStore = create<MathInputState>((set, get) => ({
  activeTarget: null,
  isKeyboardOpen: false,
  setActiveTarget: (target) => set({ activeTarget: target }),
  toggleKeyboard: () => set((state) => ({ isKeyboardOpen: !state.isKeyboardOpen })),
  setKeyboardOpen: (open) => set({ isKeyboardOpen: open }),
  insertToken: (token) => {
    const target = get().activeTarget;
    if (target) {
      target.insertText(token);
      target.focus?.();
    }
  },
  handleBackspace: () => {
    const target = get().activeTarget;
    if (target) {
      target.backspace();
      target.focus?.();
    }
  },
}));

/**
 * Helper hook for inputs (AlgebraInputRow, TableView, Probability inputs, ValueInputModal, etc.)
 * to register with the Virtual Math Keyboard.
 */
export function useRegisterMathInput(
  id: string,
  value: string,
  setValue: (val: string) => void,
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
) {
  const setActiveTarget = useActiveMathInputStore((s) => s.setActiveTarget);

  const onFocus = () => {
    setActiveTarget({
      id,
      insertText: (token: string) => {
        const el = inputRef?.current;
        if (el && typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const currentVal = el.value;
          const updated = currentVal.slice(0, start) + token + currentVal.slice(end);
          setValue(updated);
          setTimeout(() => {
            el.focus();
            const newPos = start + token.length;
            el.setSelectionRange(newPos, newPos);
          }, 0);
        } else {
          setValue(value + token);
        }
      },
      backspace: () => {
        const el = inputRef?.current;
        if (el && typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const currentVal = el.value;
          if (start === end && start > 0) {
            const updated = currentVal.slice(0, start - 1) + currentVal.slice(end);
            setValue(updated);
            setTimeout(() => {
              el.focus();
              el.setSelectionRange(start - 1, start - 1);
            }, 0);
          } else if (start !== end) {
            const updated = currentVal.slice(0, start) + currentVal.slice(end);
            setValue(updated);
            setTimeout(() => {
              el.focus();
              el.setSelectionRange(start, start);
            }, 0);
          }
        } else if (value.length > 0) {
          setValue(value.slice(0, -1));
        }
      },
      focus: () => {
        inputRef?.current?.focus();
      },
    });
  };

  return { onFocus };
}
