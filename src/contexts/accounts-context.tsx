'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';
import { Account, AccountType } from '@/lib/types';
import { 
  Landmark, 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  TrendingUp,
  Banknote
} from 'lucide-react';

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (accountId: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  getAccountById: (accountId: string) => Account | undefined;
  getTotalBalance: () => number;
}

export const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Default account icons based on type
  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank': return Landmark;
      case 'credit': return CreditCard;
      case 'savings': return PiggyBank;
      case 'cash': return Wallet;
      case 'investment': return TrendingUp;
      default: return Banknote;
    }
  };

  // Default account colors based on type
  const getAccountColor = (type: AccountType) => {
    switch (type) {
      case 'bank': return '#3b82f6'; // blue
      case 'credit': return '#ef4444'; // red
      case 'savings': return '#10b981'; // green
      case 'cash': return '#f59e0b'; // amber
      case 'investment': return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  };

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    // Cargar cuentas iniciales
    loadAccounts();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('accounts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando cuentas:', error);
        return;
      }

      const accountsData: Account[] = data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        balance: item.balance,
        currency: item.currency,
        color: item.color,
        icon: getAccountIcon(item.type),
        isActive: item.is_active ?? true, // Usar is_active de Supabase
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at, // Usar updated_at si existe
      }));

      setAccounts(accountsData);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        color: account.color || getAccountColor(account.type),
      });

    if (error) {
      console.error('Error agregando cuenta:', error);
      throw error;
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    if (!user) throw new Error('Usuario no autenticado');

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.balance !== undefined) updateData.balance = updates.balance;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.color !== undefined) updateData.color = updates.color;

    const { error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error actualizando cuenta:', error);
      throw error;
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error eliminando cuenta:', error);
      throw error;
    }
  };

  const getAccountById = (accountId: string): Account | undefined => {
    return accounts.find(account => account.id === accountId);
  };

  const getTotalBalance = (): number => {
    return accounts
      .filter(account => account.isActive)
      .reduce((total, account) => total + account.balance, 0);
  };

  return (
    <AccountsContext.Provider value={{
      accounts,
      loading,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById,
      getTotalBalance,
    }}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}

