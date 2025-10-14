'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the type for a prompt
type Prompt = {
  id: string;
  message: string;
  defaultValue?: string;
  resolve: (value: string | null) => void;
};

// Define action types
const actionTypes = {
  ADD_PROMPT: 'ADD_PROMPT',
  REMOVE_PROMPT: 'REMOVE_PROMPT',
} as const;

// State interface
interface State {
  prompts: Prompt[];
}

// Action types
type ActionType = typeof actionTypes;
type Action =
  | {
      type: ActionType['ADD_PROMPT'];
      prompt: Prompt;
    }
  | {
      type: ActionType['REMOVE_PROMPT'];
      promptId: string;
    };

// Reducer function
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_PROMPT':
      return {
        ...state,
        prompts: [...state.prompts, action.prompt],
      };
    case 'REMOVE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.filter((prompt) => prompt.id !== action.promptId),
      };
    default:
      return state;
  }
};

// Initial state
const initialState: State = { prompts: [] };

// Global state
let memoryState: State = initialState;

// Listeners array
const listeners: Array<(state: State) => void> = [];

// Dispatch function
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Counter for generating IDs
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Function to show a prompt
function showPrompt(message: string, defaultValue?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const id = genId();
    
    dispatch({
      type: 'ADD_PROMPT',
      prompt: {
        id,
        message,
        defaultValue: defaultValue || '',
        resolve,
      },
    });
  });
}

// Hook to use prompts
function usePrompt() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    showPrompt,
  };
}

// PromptDialog component that renders the dialog UI
export function PromptDialog() {
  const { prompts } = usePrompt();

  const currentPrompt = prompts[0]; // Take the first prompt (FIFO)

  const [inputValue, setInputValue] = React.useState(currentPrompt?.defaultValue || '');

  React.useEffect(() => {
    if (currentPrompt) {
      setInputValue(currentPrompt.defaultValue || '');
    }
  }, [currentPrompt]);

  const handleOk = () => {
    if (currentPrompt) {
      currentPrompt.resolve(inputValue);
      dispatch({ type: 'REMOVE_PROMPT', promptId: currentPrompt.id });
    }
    setInputValue('');
  };

  const handleCancel = () => {
    if (currentPrompt) {
      currentPrompt.resolve(null);
      dispatch({ type: 'REMOVE_PROMPT', promptId: currentPrompt.id });
    }
    setInputValue('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOk();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!currentPrompt) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className="w-[400px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>输入</DialogTitle>
          <DialogDescription>{currentPrompt.message}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={inputValue}
            onChange={handleChange}
            autoFocus
            data-testid="prompt-input"
          />
          <div className="flex justify-end gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleCancel}
              data-testid="prompt-cancel"
            >
              取消
            </Button>
            <Button 
              type="button"
              onClick={handleOk}
              data-testid="prompt-ok"
            >
              确定
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { usePrompt };