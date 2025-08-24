// hooks/use-transactions.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { expenseCategories, incomeCategories } from '@/lib/data';

function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing transactions from localStorage:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    // Find category name
    const allCategories = [...expenseCategories, ...incomeCategories];
    const category = allCategories.find(cat => cat.id === transaction.categoryId);
    
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem('transactions');
  }, []);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
  };
}

export default useTransactions;
