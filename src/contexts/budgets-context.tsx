'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';
import { Budget } from '@/lib/types';

interface BudgetsContextType {
  budgets: Budget[];
  loading: boolean;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  clearBudgets: () => Promise<void>;
  getBudgetByCategory: (category: string) => Budget | undefined;
}

export const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    // Cargar presupuestos iniciales
    loadBudgets();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('budgets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadBudgets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando presupuestos:', error);
        return;
      }

      const budgetsData: Budget[] = data.map(item => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        spent: item.spent,
        category: item.category,
        period: item.period,
        date: item.created_at, // Usar created_at como fecha
      }));

      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error cargando presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        name: budget.name,
        amount: budget.amount,
        spent: budget.spent || 0,
        category: budget.category,
        period: budget.period,
      });

    if (error) {
      console.error('Error agregando presupuesto:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) throw new Error('Usuario no autenticado');

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.spent !== undefined) updateData.spent = updates.spent;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.period !== undefined) updateData.period = updates.period;

    const { error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error actualizando presupuesto:', error);
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error eliminando presupuesto:', error);
      throw error;
    }
  };

  const clearBudgets = async () => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error eliminando presupuestos:', error);
      throw error;
    }
  };

  const getBudgetByCategory = (category: string): Budget | undefined => {
    return budgets.find(budget => budget.category === category);
  };

  return (
    <BudgetsContext.Provider value={{
      budgets,
      loading,
      addBudget,
      updateBudget,
      deleteBudget,
      clearBudgets,
      getBudgetByCategory,
    }}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return context;
}
