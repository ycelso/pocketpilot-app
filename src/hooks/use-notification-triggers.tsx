'use client';

import { useEffect, useContext } from 'react';
import { NotificationsContext } from '@/contexts/notifications-context';
import { AccountsContext } from '@/contexts/accounts-context';
import { BudgetsContext } from '@/contexts/budgets-context';
import { TransactionsContext } from '@/contexts/transactions-context';

export function useNotificationTriggers() {
  const notificationsContext = useContext(NotificationsContext);
  const accountsContext = useContext(AccountsContext);
  const budgetsContext = useContext(BudgetsContext);
  const transactionsContext = useContext(TransactionsContext);

  if (!notificationsContext || !accountsContext || !budgetsContext || !transactionsContext) {
    return;
  }

  const { 
    createLowBalanceAlert, 
    createBudgetAlert, 
    createGoalAchievementNotification,
    settings 
  } = notificationsContext;

  const { accounts } = accountsContext;
  const { budgets } = budgetsContext;
  const { transactions } = transactionsContext;

  // Check for low balance alerts
  useEffect(() => {
    if (!settings?.lowBalanceAlerts) return;

    const LOW_BALANCE_THRESHOLD = 100; // $100 threshold
    const activeAccounts = accounts.filter(account => account.isActive);

    activeAccounts.forEach(account => {
      if (account.balance < LOW_BALANCE_THRESHOLD && account.balance > 0) {
        createLowBalanceAlert(account.id, account.balance);
      }
    });
  }, [accounts, settings?.lowBalanceAlerts, createLowBalanceAlert]);

  // Check for budget alerts
  useEffect(() => {
    if (!settings?.budgetAlerts) return;

    budgets.forEach(budget => {
      const budgetTransactions = transactions.filter(
        transaction => transaction.budgetId === budget.id && transaction.type === 'expense'
      );

      const totalSpent = budgetTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const remainingBudget = budget.amount - totalSpent;

      // Alert when 80% of budget is spent
      if (totalSpent >= budget.amount * 0.8 && totalSpent < budget.amount) {
        createBudgetAlert(
          budget.id, 
          `Has gastado el ${Math.round((totalSpent / budget.amount) * 100)}% de tu presupuesto "${budget.name}". Te quedan $${remainingBudget.toFixed(2)}`
        );
      }

      // Alert when budget is exceeded
      if (totalSpent > budget.amount) {
        createBudgetAlert(
          budget.id, 
          `Has excedido tu presupuesto "${budget.name}" por $${Math.abs(remainingBudget).toFixed(2)}`
        );
      }
    });
  }, [budgets, transactions, settings?.budgetAlerts, createBudgetAlert]);

  // Check for goal achievements
  useEffect(() => {
    if (!settings?.goalAchievementNotifications) return;

    budgets.forEach(budget => {
      const budgetTransactions = transactions.filter(
        transaction => transaction.budgetId === budget.id && transaction.type === 'expense'
      );

      const totalSpent = budgetTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const remainingBudget = budget.amount - totalSpent;

      // Check if goal is achieved (savings goal reached)
      if (remainingBudget >= budget.amount) {
        createGoalAchievementNotification(budget.id, budget.name);
      }
    });
  }, [budgets, transactions, settings?.goalAchievementNotifications, createGoalAchievementNotification]);

  // Daily transaction reminder (simulated)
  useEffect(() => {
    if (!settings?.transactionReminders) return;

    // Evitar ejecutar múltiples veces
    let hasRun = false;

    const checkForDailyReminder = () => {
      if (hasRun) return;
      hasRun = true;
      const today = new Date();
      const lastTransaction = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!lastTransaction) {
        // No transactions yet, remind user to start
        // Verificar si ya existe una notificación de bienvenida
        const existingWelcomeNotification = notificationsContext.notifications.find(
          n => n.title === '¡Bienvenido a PocketPilot!' && n.category === 'transaction_reminder'
        );
        
        if (!existingWelcomeNotification) {
          notificationsContext.addNotification({
            type: 'reminder',
            category: 'transaction_reminder',
            title: '¡Bienvenido a PocketPilot!',
            message: 'Comienza registrando tu primera transacción para llevar el control de tus finanzas',
            isRead: false,
            isArchived: false,
            actionUrl: '/dashboard',
            actionLabel: 'Añadir Transacción',
          });
        }
        return;
      }

      const lastTransactionDate = new Date(lastTransaction.date);
      const daysSinceLastTransaction = Math.floor(
        (today.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Remind if no transactions in 2 days
      if (daysSinceLastTransaction >= 2) {
        notificationsContext.addNotification({
          type: 'reminder',
          category: 'transaction_reminder',
          title: 'Recordatorio de Transacciones',
          message: `Han pasado ${daysSinceLastTransaction} días desde tu última transacción. ¿Has tenido gastos recientes?`,
          isRead: false,
          isArchived: false,
          actionUrl: '/transactions',
          actionLabel: 'Ver Transacciones',
        });
      }
    };

    // Check once per day
    const interval = setInterval(checkForDailyReminder, 24 * 60 * 60 * 1000);
    
    // Initial check
    checkForDailyReminder();

    return () => clearInterval(interval);
  }, [transactions, settings?.transactionReminders, notificationsContext]);

  // Recurring payment reminders
  useEffect(() => {
    if (!settings?.recurringPaymentReminders) return;

    const checkRecurringPayments = () => {
      const today = new Date();
      const recurringTransactions = transactions.filter(t => t.isRecurring);

      recurringTransactions.forEach(transaction => {
        if (!transaction.recurrence) return;

        const nextPaymentDate = new Date(transaction.recurrence.endDate);
        const daysUntilPayment = Math.floor(
          (nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Remind 1 day before
        if (daysUntilPayment === 1) {
          notificationsContext.createRecurringPaymentReminder(
            transaction.id,
            nextPaymentDate.toISOString()
          );
        }
      });
    };

    // Check once per day
    const interval = setInterval(checkRecurringPayments, 24 * 60 * 60 * 1000);
    
    // Initial check
    checkRecurringPayments();

    return () => clearInterval(interval);
  }, [transactions, settings?.recurringPaymentReminders, notificationsContext]);

  return null;
}


