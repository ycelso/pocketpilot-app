'use client';

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
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <MainLayout>
        <div className="flex flex-col gap-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Configurar Notificaciones</h1>
              <p className="text-muted-foreground">Personaliza cómo recibir notificaciones</p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="h-10"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar
            </Button>
          </div>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Tipos de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recordatorios de Transacciones</Label>
                      <p className="text-xs text-muted-foreground">Recordatorios diarios para registrar gastos</p>
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.transactionReminders}
                    onCheckedChange={() => handleToggle('transactionReminders')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Alertas de Presupuesto</Label>
                      <p className="text-xs text-muted-foreground">Notificaciones cuando excedas tu presupuesto</p>
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.budgetAlerts}
                    onCheckedChange={() => handleToggle('budgetAlerts')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Alertas de Saldo Bajo</Label>
                      <p className="text-xs text-muted-foreground">Notificaciones cuando tu saldo sea bajo</p>
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.lowBalanceAlerts}
                    onCheckedChange={() => handleToggle('lowBalanceAlerts')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recordatorios de Pagos Recurrentes</Label>
                      <p className="text-xs text-muted-foreground">Notificaciones para pagos programados</p>
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.recurringPaymentReminders}
                    onCheckedChange={() => handleToggle('recurringPaymentReminders')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Logros de Metas</Label>
                      <p className="text-xs text-muted-foreground">Celebraciones cuando alcances tus metas</p>
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.goalAchievementNotifications}
                    onCheckedChange={() => handleToggle('goalAchievementNotifications')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Actualizaciones del Sistema</Label>
                      <p className="text-xs text-muted-foreground">Notificaciones sobre nuevas funciones</p>
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.systemUpdates}
                    onCheckedChange={() => handleToggle('systemUpdates')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Notificaciones Push</Label>
                    <p className="text-xs text-muted-foreground">Notificaciones en tiempo real en tu dispositivo</p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.pushNotifications}
                  onCheckedChange={() => handleToggle('pushNotifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Notificaciones por Email</Label>
                    <p className="text-xs text-muted-foreground">Resúmenes semanales por correo electrónico</p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Horas Silenciosas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Activar Horas Silenciosas</Label>
                  <p className="text-xs text-muted-foreground">
                    Pausar notificaciones durante las horas de descanso
                  </p>
                </div>
                <Switch
                  checked={localSettings.quietHours.enabled}
                  onCheckedChange={handleQuietHoursToggle}
                />
              </div>

              {localSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-sm">Hora de Inicio</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={localSettings.quietHours.startTime}
                      onChange={(e) => handleTimeChange('startTime', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-sm">Hora de Fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={localSettings.quietHours.endTime}
                      onChange={(e) => handleTimeChange('endTime', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          {hasChanges && (
            <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full h-12"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    </PrivateRoute>
  );
}

