import type { LucideIcon } from 'lucide-react';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  endDate: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string; // Cambiado a string para Supabase
  date: string;
  categoryId?: string; // Opcional para compatibilidad
  accountId?: string; // Optional: Link transaction to an account
  budgetId?: string; // Optional: Link transaction to a budget/goal
  isRecurring?: boolean;
  recurrence?: Recurrence;
  linkedRecurrenceId?: string;
}

export type StoredTransaction = Transaction & {
  accountId?: string; // Make accountId optional in stored transactions
};

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export type AccountType = 'bank' | 'cash' | 'credit' | 'investment' | 'savings';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: LucideIcon;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'monthly' | 'yearly';
  date?: string; // Opcional para compatibilidad
}

export type NotificationType = 'reminder' | 'alert' | 'info' | 'success' | 'warning';

export type NotificationCategory = 
  | 'transaction_reminder' 
  | 'budget_alert' 
  | 'low_balance' 
  | 'recurring_payment' 
  | 'goal_achieved' 
  | 'system_update';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  scheduledFor?: string; // ISO string for scheduled notifications
  expiresAt?: string; // ISO string for expiring notifications
  actionUrl?: string; // URL to navigate when notification is clicked
  actionLabel?: string; // Label for the action button
  metadata?: Record<string, any>; // Additional data (transactionId, accountId, etc.)
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  transactionReminders: boolean;
  budgetAlerts: boolean;
  lowBalanceAlerts: boolean;
  recurringPaymentReminders: boolean;
  goalAchievementNotifications: boolean;
  systemUpdates: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  pushNotifications: boolean;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

// Export types
export type ExportFormat = 'pdf' | 'excel';
export type ExportType = 'transactions' | 'budgets' | 'accounts' | 'summary';

export interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  dateRange?: {
    start: string;
    end: string;
  };
  includeCharts?: boolean;
  includeCategories?: boolean;
}

export interface ExportData {
  transactions?: StoredTransaction[];
  budgets?: Budget[];
  accounts?: Account[];
  summary?: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    topCategories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    monthlyData: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
  };
}
