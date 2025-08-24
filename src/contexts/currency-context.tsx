'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Currency = 'USD' | 'DOP' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'pocketpilot_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (storedCurrency && ['USD', 'DOP', 'EUR'].includes(storedCurrency)) {
        setCurrencyState(storedCurrency as Currency);
      }
    } catch (error) {
      console.error('Failed to load currency from localStorage', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setCurrency = useCallback((newCurrency: Currency) => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Failed to save currency to localStorage', error);
    }
  }, [isInitialized]);

  const value = { currency, setCurrency };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
