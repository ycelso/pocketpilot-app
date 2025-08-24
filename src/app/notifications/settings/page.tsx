'use client';

// Página temporalmente deshabilitada - NotificationsProvider comentado
export default function NotificationSettingsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Configuración de Notificaciones</h1>
        <p className="text-muted-foreground">
          Esta funcionalidad está temporalmente deshabilitada.
        </p>
      </div>
    </div>
  );
}

/*
import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  CreditCard,
  TrendingDown,
  Settings,
  Save,
  Smartphone,
  Mail
} from 'lucide-react';
import { NotificationsContext } from '@/contexts/notifications-context';
import { NotificationSettings } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import MainLayout from '@/components/main-layout';
import PrivateRoute from '@/components/private-route';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const notificationsContext = useContext(NotificationsContext);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!notificationsContext) throw new Error('NotificationSettingsPage must be used within NotificationsProvider');

  const { settings, updateSettings } = notificationsContext;

  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when context settings change
  if (settings && !localSettings) {
    setLocalSettings(settings);
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!localSettings) return;
    setLocalSettings(prev => prev ? {
      ...prev,
      [key]: !prev[key]
    } : null);
  };

  const handleQuietHoursToggle = () => {
    if (!localSettings) return;
    setLocalSettings(prev => prev ? {
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled
      }
    } : null);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (!localSettings) return;
    setLocalSettings(prev => prev ? {
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    } : null);
  };

  const handleSave = async () => {
    if (!localSettings) return;
    
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({ 
        title: 'Configuración guardada exitosamente',
        variant: 'success'
      });
    } catch (error) {
      toast({ 
        title: 'Error al guardar configuración', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  if (!localSettings) {
    return (
      <PrivateRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando configuración...</p>
            </div>
          </div>
        </MainLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <MainLayout>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Configuración de Notificaciones</h1>
              <p className="text-muted-foreground">Personaliza cómo recibes las notificaciones</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tu dispositivo
                  </p>
                </div>
                <Switch
                  checked={localSettings.pushNotifications}
                  onCheckedChange={() => handleToggle('pushNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Notificaciones de Metas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Logros de Metas</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones cuando alcances tus metas financieras
                  </p>
                </div>
                <Switch
                  checked={localSettings.goalAchievementNotifications}
                  onCheckedChange={() => handleToggle('goalAchievementNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Recordatorios de Metas</Label>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios para contribuir a tus metas
                  </p>
                </div>
                <Switch
                  checked={localSettings.goalReminders}
                  onCheckedChange={() => handleToggle('goalReminders')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Notificaciones de Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Recordatorios de Transacciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios para registrar transacciones regulares
                  </p>
                </div>
                <Switch
                  checked={localSettings.transactionReminders}
                  onCheckedChange={() => handleToggle('transactionReminders')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Pagos Recurrentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios para pagos que se repiten regularmente
                  </p>
                </div>
                <Switch
                  checked={localSettings.recurringPaymentReminders}
                  onCheckedChange={() => handleToggle('recurringPaymentReminders')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Alertas Financieras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Saldo Bajo</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas cuando tu saldo esté por debajo del límite
                  </p>
                </div>
                <Switch
                  checked={localSettings.lowBalanceAlerts}
                  onCheckedChange={() => handleToggle('lowBalanceAlerts')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Exceso de Presupuesto</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas cuando excedas tu presupuesto mensual
                  </p>
                </div>
                <Switch
                  checked={localSettings.budgetExceededAlerts}
                  onCheckedChange={() => handleToggle('budgetExceededAlerts')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horas Silenciosas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Activar Horas Silenciosas</Label>
                  <p className="text-sm text-muted-foreground">
                    No recibir notificaciones durante ciertas horas
                  </p>
                </div>
                <Switch
                  checked={localSettings.quietHours.enabled}
                  onCheckedChange={handleQuietHoursToggle}
                />
              </div>

              {localSettings.quietHours.enabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hora de Inicio</Label>
                      <Input
                        type="time"
                        value={localSettings.quietHours.startTime}
                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Fin</Label>
                      <Input
                        type="time"
                        value={localSettings.quietHours.endTime}
                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </PrivateRoute>
  );
}
*/

