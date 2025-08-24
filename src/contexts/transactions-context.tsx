'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';
import { Transaction } from '@/lib/types';
import { expenseCategories, incomeCategories } from '@/lib/data';

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearTransactions: () => Promise<void>;
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getTotalByType: (type: 'expense' | 'income') => number;
}

export const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Cargar transacciones iniciales
    loadTransactions();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error cargando transacciones:', error);
        return;
      }

      const transactionsData: Transaction[] = data.map(item => ({
        id: item.id,
        amount: item.amount,
        type: item.type,
        category: item.category,
        categoryId: item.category, // Usar category como categoryId también
        description: item.description,
        date: item.date,
        accountId: item.account_id,
      }));

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) {
      console.error('❌ Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    console.log('👤 Usuario autenticado:', {
      id: user.id,
      email: user.email
    });

    // Convertir categoryId a category name si es necesario
    let categoryName = transaction.category;
    if (transaction.categoryId && !transaction.category) {
      // Buscar la categoría por ID
      const allCategories = [...expenseCategories, ...incomeCategories];
      const category = allCategories.find(cat => cat.id === transaction.categoryId);
      categoryName = category ? category.name : 'Sin categoría';
    }

    console.log('🔍 Intentando agregar transacción:', {
      user_id: user.id,
      amount: transaction.amount,
      type: transaction.type,
      category: categoryName,
      description: transaction.description,
      date: transaction.date,
      account_id: transaction.accountId,
    });

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: transaction.amount,
        type: transaction.type,
        category: categoryName,
        description: transaction.description,
        date: transaction.date,
        account_id: transaction.accountId,
      })
      .select();

    if (error) {
      console.error('❌ Error agregando transacción:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Transacción agregada exitosamente:', data);
    
    // Recargar las transacciones para actualizar la UI
    await loadTransactions();
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) throw new Error('Usuario no autenticado');

    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.accountId !== undefined) updateData.account_id = updates.accountId;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error actualizando transacción:', error);
      throw error;
    }
    
    // Recargar las transacciones para actualizar la UI
    await loadTransactions();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error eliminando transacción:', error);
      throw error;
    }
    
    // Recargar las transacciones para actualizar la UI
    await loadTransactions();
  };

  const clearTransactions = async () => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error eliminando transacciones:', error);
      throw error;
    }
  };

  const getTransactionsByMonth = (year: number, month: number): Transaction[] => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });
  };

  const getTotalByType = (type: 'expense' | 'income'): number => {
    return transactions
      .filter(transaction => transaction.type === type)
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  return (
    <TransactionsContext.Provider value={{
      transactions,
      loading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      clearTransactions,
      getTransactionsByMonth,
      getTotalByType,
    }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
