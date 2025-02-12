import { type Dispatch, type SetStateAction, useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T | null): [T | null, Dispatch<SetStateAction<T | null>>] {
  const [value, setValue] = useState<T | null>(
    typeof window !== "undefined" && window.localStorage.getItem(key)
      ? JSON.parse(window.localStorage.getItem(key)!) as T
      : null
  );

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setValue(item ? JSON.parse(item) as T : defaultValue);
    }
    catch (error) {
      setValue(defaultValue);
    }
      
  }, [key, defaultValue]);
  
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
};