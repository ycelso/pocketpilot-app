'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import type { Notification, NotificationSettings, NotificationType, NotificationCategory } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock,
  DollarSign,
  Target,
  CreditCard,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface NotificationsContextType {
  notifications: Notification[];
  settings: NotificationSettings | null;
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  archiveNotification: (notificationId: string) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  createTransactionReminder: (transactionId: string, scheduledFor: string) => void;
  createBudgetAlert: (budgetId: string, message: string) => void;
  createLowBalanceAlert: (accountId: string, currentBalance: number) => void;
  createRecurringPaymentReminder: (transactionId: string, scheduledFor: string) => void;
  createGoalAchievementNotification: (budgetId: string, goalName: string) => void;
  loading: boolean;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getNotificationsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.id, 'notifications');
  }, [user]);

  const getSettingsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.id, 'notificationSettings');
  }, [user]);

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'alert': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      default: return Bell;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'reminder': return '#3b82f6'; // blue
      case 'alert': return '#ef4444'; // red
      case 'info': return '#6b7280'; // gray
      case 'success': return '#10b981'; // green
      case 'warning': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  };

  // Fetch notifications
  useEffect(() => {
    const notificationsCollection = getNotificationsCollection();
    if (!notificationsCollection) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Simplified query to avoid composite index requirement
    const q = query(
      notificationsCollection,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as Notification))
        .filter(notification => !notification.isArchived) // Filter client-side
        .slice(0, 50);
      
      setNotifications(fetchedNotifications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      toast({ title: 'Error al cargar notificaciones', variant: 'destructive' });
      setNotifications([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, getNotificationsCollection, toast]);

  // Fetch notification settings
  useEffect(() => {
    const settingsCollection = getSettingsCollection();
    if (!settingsCollection) {
      setSettings(null);
      return;
    }

    const fetchSettings = async () => {
      try {
        const querySnapshot = await getDocs(settingsCollection);
        if (!querySnapshot.empty) {
          const settingsDoc = querySnapshot.docs[0];
          setSettings({ ...settingsDoc.data(), id: settingsDoc.id } as NotificationSettings);
        } else {
          // Create default settings if none exist
          const defaultSettings: Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: user!.id,
            transactionReminders: true,
            budgetAlerts: true,
            lowBalanceAlerts: true,
            recurringPaymentReminders: true,
            goalAchievementNotifications: true,
            systemUpdates: true,
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '08:00',
            },
            pushNotifications: true,
            emailNotifications: false,
          };

          const docRef = await addDoc(settingsCollection, {
            ...defaultSettings,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          setSettings({ ...defaultSettings, id: docRef.id } as NotificationSettings);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast({ title: 'Error al cargar configuración', variant: 'destructive' });
      }
    };

    fetchSettings();
  }, [user, getSettingsCollection, toast]);

  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const notificationsCollection = getNotificationsCollection();
    if (!notificationsCollection) return;

    try {
      const notification = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(notificationsCollection, notification);
      setNotifications(prev => [{ ...notification, id: docRef.id }, ...prev]);
      
      // Show toast for immediate notifications
      if (!notification.scheduledFor || new Date(notification.scheduledFor) <= new Date()) {
        toast({ 
          title: notification.title, 
          description: notification.message,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      toast({ title: 'Error al crear notificación', variant: 'destructive' });
    }
  }, [getNotificationsCollection, toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id, 'notifications', notificationId), {
        isRead: true,
        updatedAt: new Date().toISOString(),
      });
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, updatedAt: new Date().toISOString() }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({ title: 'Error al marcar como leída', variant: 'destructive' });
    }
  }, [user, toast]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'users', user.id, 'notifications', notification.id);
        batch.update(notificationRef, {
          isRead: true,
          updatedAt: new Date().toISOString(),
        });
      });

      await batch.commit();
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true,
        updatedAt: new Date().toISOString(),
      })));
      
      toast({ 
        title: 'Todas las notificaciones marcadas como leídas',
        variant: 'success'
      });
    } catch (error) {
      toast({ 
        title: 'Error al marcar como leídas', 
        variant: 'destructive' 
      });
    }
  }, [user, notifications, toast]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id, 'notifications', notificationId));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({ title: 'Error al eliminar notificación', variant: 'destructive' });
    }
  }, [user, toast]);

  const archiveNotification = useCallback(async (notificationId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id, 'notifications', notificationId), {
        isArchived: true,
        updatedAt: new Date().toISOString(),
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast({ title: 'Error al archivar notificación', variant: 'destructive' });
    }
  }, [user, toast]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!user || !settings) return;
    try {
      await updateDoc(doc(db, 'users', user.id, 'notificationSettings', settings.id), {
        ...newSettings,
        updatedAt: new Date().toISOString(),
      });
      setSettings(prev => prev ? { ...prev, ...newSettings, updatedAt: new Date().toISOString() } : null);
      toast({ 
        title: 'Configuración actualizada',
        variant: 'success'
      });
    } catch (error) {
      toast({ 
        title: 'Error al actualizar configuración', 
        variant: 'destructive' 
      });
    }
  }, [user, settings, toast]);

  // Helper functions for creating specific types of notifications
  const createTransactionReminder = useCallback((transactionId: string, scheduledFor: string) => {
    addNotification({
      type: 'reminder',
      category: 'transaction_reminder',
      title: 'Recordatorio de Transacción',
      message: 'No olvides registrar tus transacciones del día',
      isRead: false,
      isArchived: false,
      scheduledFor,
      actionUrl: '/transactions',
      actionLabel: 'Ver Transacciones',
      metadata: { transactionId },
    });
  }, [addNotification]);

  const createBudgetAlert = useCallback((budgetId: string, message: string) => {
    addNotification({
      type: 'alert',
      category: 'budget_alert',
      title: 'Alerta de Presupuesto',
      message,
      isRead: false,
      isArchived: false,
      actionUrl: '/budgets',
      actionLabel: 'Ver Presupuestos',
      metadata: { budgetId },
    });
  }, [addNotification]);

  const createLowBalanceAlert = useCallback((accountId: string, currentBalance: number) => {
    addNotification({
      type: 'warning',
      category: 'low_balance',
      title: 'Saldo Bajo',
      message: `Tu cuenta tiene un saldo bajo: $${currentBalance.toFixed(2)}`,
      isRead: false,
      isArchived: false,
      actionUrl: '/accounts',
      actionLabel: 'Ver Cuentas',
      metadata: { accountId, currentBalance },
    });
  }, [addNotification]);

  const createRecurringPaymentReminder = useCallback((transactionId: string, scheduledFor: string) => {
    addNotification({
      type: 'reminder',
      category: 'recurring_payment',
      title: 'Pago Recurrente',
      message: 'Tienes un pago recurrente programado para hoy',
      isRead: false,
      isArchived: false,
      scheduledFor,
      actionUrl: '/transactions',
      actionLabel: 'Ver Transacciones',
      metadata: { transactionId },
    });
  }, [addNotification]);

  const createGoalAchievementNotification = useCallback((budgetId: string, goalName: string) => {
    addNotification({
      type: 'success',
      category: 'goal_achieved',
      title: '¡Meta Alcanzada!',
      message: `¡Felicitaciones! Has alcanzado tu meta: ${goalName}`,
      isRead: false,
      isArchived: false,
      actionUrl: '/budgets',
      actionLabel: 'Ver Metas',
      metadata: { budgetId, goalName },
    });
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      settings,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      archiveNotification,
      updateSettings,
      createTransactionReminder,
      createBudgetAlert,
      createLowBalanceAlert,
      createRecurringPaymentReminder,
      createGoalAchievementNotification,
      loading,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}
