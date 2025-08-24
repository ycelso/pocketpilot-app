'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function useAppSettings() {
  const { theme, setTheme } = useTheme();
  const [hideBalances, setHideBalances] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (mounted) {
      const savedHideBalances = localStorage.getItem('hideBalances');
      if (savedHideBalances !== null) {
        setHideBalances(JSON.parse(savedHideBalances));
      }
    }
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const toggleHideBalances = () => {
    const newValue = !hideBalances;
    setHideBalances(newValue);
    localStorage.setItem('hideBalances', JSON.stringify(newValue));
  };

  const isDarkMode = theme === 'dark';

  return {
    isDarkMode,
    hideBalances,
    toggleTheme,
    toggleHideBalances,
    mounted
  };
}




