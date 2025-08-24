'use client';

import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { AccountsContext } from '@/contexts/accounts-context';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import MainLayout from '@/components/main-layout';
import PrivateRoute from '@/components/private-route';
import AddAccountDialog from '@/components/add-account-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const accountsContext = useContext(AccountsContext);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!accountsContext) throw new Error('AccountsPage must be used within AccountsProvider');

  const { accounts, updateAccount, deleteAccount, getTotalBalance, loading } = accountsContext;

  const handleToggleAccount = async (accountId: string, isActive: boolean) => {
    try {
      await updateAccount(accountId, { isActive });
    } catch (error) {
      toast({ title: 'Error al actualizar cuenta', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la cuenta "${accountName}"?`)) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        toast({ title: 'Error al eliminar cuenta', variant: 'destructive' });
      }
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const labels = {
      bank: 'Banco',
      credit: 'Crédito',
      cash: 'Efectivo',
      savings: 'Ahorros',
      investment: 'Inversión'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      bank: 'bg-blue-100 text-blue-800',
      credit: 'bg-red-100 text-red-800',
      cash: 'bg-amber-100 text-amber-800',
      savings: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalBalance = getTotalBalance();
  const activeAccounts = accounts.filter(account => account.isActive);
  const inactiveAccounts = accounts.filter(account => !account.isActive);

  return (
    <PrivateRoute>
      <MainLayout>
        <div className="flex flex-col gap-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mis Cuentas</h1>
              <p className="text-muted-foreground">Gestiona tus cuentas bancarias y efectivo</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="h-10">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Cuenta
            </Button>
          </div>

          {/* Total Balance Card */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Saldo Total</p>
                  <p className="text-3xl font-bold">
                    {showBalances ? formatCurrency(totalBalance) : '••••••'}
                  </p>
                  <p className="text-sm opacity-75">
                    {activeAccounts.length} cuenta{activeAccounts.length !== 1 ? 's' : ''} activa{activeAccounts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalances(!showBalances)}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Accounts */}
          {loading ? (
            <div className="text-center py-8">Cargando cuentas...</div>
          ) : (
            <>
              {activeAccounts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Cuentas Activas</h2>
                  <div className="grid gap-4">
                    {activeAccounts.map((account) => (
                      <Card key={account.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${account.color}20` }}
                              >
                                <account.icon className="w-5 h-5" style={{ color: account.color }} />
                              </div>
                              <div>
                                <p className="font-medium">{account.name}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge className={cn("text-xs", getAccountTypeColor(account.type))}>
                                    {getAccountTypeLabel(account.type)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{account.currency}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="font-semibold">
                                  {showBalances ? formatCurrency(account.balance, account.currency as any) : '••••••'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {account.balance >= 0 ? (
                                    <span className="text-green-600 flex items-center">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Positivo
                                    </span>
                                  ) : (
                                    <span className="text-red-600 flex items-center">
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                      Negativo
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Switch
                                  checked={account.isActive}
                                  onCheckedChange={(checked) => handleToggleAccount(account.id, checked)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteAccount(account.id, account.name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Accounts */}
              {inactiveAccounts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">Cuentas Inactivas</h2>
                  <div className="grid gap-4">
                    {inactiveAccounts.map((account) => (
                      <Card key={account.id} className="opacity-60 hover:opacity-80 transition-opacity">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${account.color}20` }}
                              >
                                <account.icon className="w-5 h-5" style={{ color: account.color }} />
                              </div>
                              <div>
                                <p className="font-medium">{account.name}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge className={cn("text-xs", getAccountTypeColor(account.type))}>
                                    {getAccountTypeLabel(account.type)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{account.currency}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="font-semibold">
                                  {showBalances ? formatCurrency(account.balance, account.currency as any) : '••••••'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Switch
                                  checked={account.isActive}
                                  onCheckedChange={(checked) => handleToggleAccount(account.id, checked)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteAccount(account.id, account.name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {accounts.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No tienes cuentas</h3>
                        <p className="text-muted-foreground">
                          Añade tu primera cuenta para empezar a gestionar tus finanzas
                        </p>
                      </div>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Primera Cuenta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <AddAccountDialog
          isOpen={isAddDialogOpen}
          setIsOpen={setIsAddDialogOpen}
        />
      </MainLayout>
    </PrivateRoute>
  );
}


