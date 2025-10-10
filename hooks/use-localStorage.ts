import { useState, useEffect, useRef } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, SaveStatus] {
  key = `holdfire-${key}`
  // Function to get the initial value from localStorage
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      // Check if the item exists in localStorage
      if (item) {
        return JSON.parse(item) as T;
      }
      // If not, return the initialValue and set it in localStorage
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage with key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value and save status
  const [storedValue, setStoredValue] = useState<T>(getInitialValue);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  
  // Ref to track if this is the first render
  const isFirstRender = useRef(true);

  // Save to localStorage whenever value changes (except on first render)
  useEffect(() => {
    // Skip saving on the first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    try {
      setSaveStatus('saving');
      localStorage.setItem(key, JSON.stringify(storedValue));
      setSaveStatus('saved');
      
      // Reset status after delay
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error(`Error saving data to localStorage with key "${key}":`, error);
      setSaveStatus('error');
    }
  }, [key, storedValue]);

  // Return a wrapped version of useState's setter function that supports functional updates
  const setValue = (value: T | ((prevValue: T) => T)) => {
    setSaveStatus('saving');
    if (typeof value === 'function') {
      // @ts-ignore
      setStoredValue(prev => value(prev as T));
    } else {
      setStoredValue(value);
    }
  };

  return [storedValue, setValue, saveStatus];
}