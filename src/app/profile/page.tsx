
'use client';
import MainLayout from '@/components/main-layout';
import PageHeader from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, Trash2, FileDown, ChevronRight, FileText, FileSpreadsheet, Download, Settings, Shield, Moon, Sun, Eye, EyeOff, Calendar, TrendingUp, Target, Wallet } from 'lucide-react';
import { useContext, useState } from 'react';
import { TransactionsContext } from '@/contexts/transactions-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import PrivateRoute from '@/components/private-route';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { BudgetsContext } from '@/contexts/budgets-context';
import { AccountsContext } from '@/contexts/accounts-context';
import { ExportService } from '@/lib/export-service';
import type { ExportFormat, ExportType } from '@/lib/types';
import { format as formatDate, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppSettings } from '@/hooks/use-app-settings';

const exportTypes: { value: ExportType; label: string; description: string; icon: React.ComponentType<any> }[] = [
  {
    value: 'summary',
    label: 'Resumen General',
    description: 'Resumen completo con estadísticas',
    icon: FileText
  },
  {
    value: 'transactions',
    label: 'Transacciones',
    description: 'Lista detallada de movimientos',
    icon: FileText
  },
  {
    value: 'budgets',
    label: 'Presupuestos',
    description: 'Información de metas',
    icon: FileText
  },
  {
    value: 'accounts',
    label: 'Cuentas',
    description: 'Estado de cuentas bancarias',
    icon: FileText
  }
];

const dateRangeOptions = [
  { value: 'all', label: 'Todo el tiempo' },
  { value: 'current_month', label: 'Mes actual' },
  { value: 'last_month', label: 'Mes anterior' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'last_6_months', label: 'Últimos 6 meses' }
];

export default function ProfilePage() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [type, setType] = useState<ExportType>('summary');
  const [dateRange, setDateRange] = useState('current_month');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Función para procesar la URL de la foto de Google
  const getProcessedPhotoURL = (photoURL: string | null | undefined) => {
    if (!photoURL) return undefined;
    
    // Para URLs de Google, usar la URL original con parámetros optimizados
    if (photoURL.includes('googleusercontent.com')) {
      // Remover parámetros existentes y agregar los nuestros
      const baseURL = photoURL.split('?')[0].split('=s')[0];
      const optimizedURL = `${baseURL}=s192-c`;
      
      return optimizedURL;
    }
    
    return photoURL;
  };
  const { isDarkMode, hideBalances, toggleTheme, toggleHideBalances, mounted } = useAppSettings();
  
  const transactionsContext = useContext(TransactionsContext);
  const budgetsContext = useContext(BudgetsContext);
  const accountsContext = useContext(AccountsContext);
  const router = useRouter();
  
  if (!transactionsContext || !budgetsContext || !accountsContext) throw new Error('ProfilePage must be used within its providers');

  // Prevent hydration issues
  if (!mounted) {
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
  const { transactions, clearTransactions } = transactionsContext;
  const { budgets, clearBudgets } = budgetsContext;
  const { accounts } = accountsContext;

  // Calculate user statistics
  const userStats = {
    totalTransactions: transactions.length,
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    activeBudgets: budgets.length,
    totalAccounts: accounts.filter(a => a.isActive).length,
    daysActive: user?.created_at ? 
      differenceInDays(new Date(), new Date(user.created_at)) : 0
  };

  const handleClearData = () => {
    clearTransactions();
    clearBudgets();
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      toast({ 
        title: 'Error al cerrar sesión', 
        description: 'Inténtalo de nuevo',
        variant: 'destructive'
      });
    }
  };

  const getDateRange = () => {
    const now = new Date();
    
    switch (dateRange) {
      case 'current_month':
        return {
          start: formatDate(startOfMonth(now), 'yyyy-MM-dd'),
          end: formatDate(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return {
          start: formatDate(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: formatDate(endOfMonth(lastMonth), 'yyyy-MM-dd')
        };
      case 'last_3_months':
        return {
          start: formatDate(subMonths(now, 3), 'yyyy-MM-dd'),
          end: formatDate(now, 'yyyy-MM-dd')
        };
      case 'last_6_months':
        return {
          start: formatDate(subMonths(now, 6), 'yyyy-MM-dd'),
          end: formatDate(now, 'yyyy-MM-dd')
        };
      default:
        return undefined;
    }
  };

  const filterTransactionsByDateRange = (transactions: any[], dateRange?: { start: string; end: string }) => {
    if (!dateRange) return transactions;
    
    return transactions.filter(transaction => {
      const transactionDate = transaction.date;
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    });
  };

  const prepareExportData = () => {
    const dateRangeData = getDateRange();
    const filteredTransactions = filterTransactionsByDateRange(transactions, dateRangeData);

    const data: any = {};

    if (type === 'summary' || type === 'transactions') {
      data.transactions = filteredTransactions;
    }

    if (type === 'summary' || type === 'budgets') {
      data.budgets = budgets;
    }

    if (type === 'summary' || type === 'accounts') {
      data.accounts = accounts;
    }

    if (type === 'summary') {
      data.summary = ExportService.calculateSummaryData(filteredTransactions);
    }

    return data;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const exportData = prepareExportData();
      const options = {
        format,
        type,
        dateRange: getDateRange(),
        includeCharts,
        includeCategories
      };

      await ExportService.exportData(exportData, options);
      
      setExportSuccess(true);
      toast({ 
        title: 'Exportación exitosa', 
        description: `Archivo ${format.toUpperCase()} generado correctamente`
      });

      setTimeout(() => {
        setIsExportDialogOpen(false);
        setExportSuccess(false);
        setIsExporting(false);
      }, 2000);

    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Error en la exportación', 
        description: 'No se pudo generar el archivo. Inténtalo de nuevo.',
        variant: 'destructive'
      });
      setIsExporting(false);
    }
  };

  const resetExportForm = () => {
    setFormat('pdf');
    setType('summary');
    setDateRange('current_month');
    setIncludeCharts(true);
    setIncludeCategories(true);
    setExportSuccess(false);
    setIsExporting(false);
  };

  const handleCloseExportDialog = () => {
    if (!isExporting) {
      resetExportForm();
      setIsExportDialogOpen(false);
    }
  };

  const ProfileListItem = ({ icon: Icon, text, onClick, asTrigger = false, children, badge }: { 
    icon: React.ElementType, 
    text: string, 
    onClick?: () => void, 
    asTrigger?: boolean, 
    children?: React.ReactNode,
    badge?: string
  }) => {
    const Component = asTrigger ? 'div' : Button;
    
    const buttonClasses = "w-full justify-start h-14 px-4 flex items-center text-left";
    const ghostVariantClasses = "hover:bg-accent hover:text-accent-foreground";

    return (
      <Component
        variant={asTrigger ? undefined : "ghost"}
        className={cn(
          buttonClasses,
          asTrigger && `cursor-pointer rounded-md ${ghostVariantClasses}`
        )}
        onClick={onClick}
      >
        <div className="flex items-center w-full h-full">
          <Icon className="mr-4 h-5 w-5 text-muted-foreground" />
          <span className="flex-1 text-left">{text}</span>
          {badge && (
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full mr-2">
              {badge}
            </span>
          )}
          {children ? children : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
      </Component>
    );
  };

  return (
    <PrivateRoute>
      <MainLayout>
        <PageHeader title="Perfil" />
        <div className="p-4 md:p-6 space-y-8">
          
          {/* User Profile Card */}
          <div className="rounded-2xl p-6 flex flex-col items-center text-center bg-primary text-primary-foreground">
            <div className="w-24 h-24 mb-4 ring-4 ring-background shadow-lg rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary relative">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={getProcessedPhotoURL(user.user_metadata.avatar_url)} 
                  alt={user?.user_metadata?.full_name ?? 'Usuario'} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('❌ Profile avatar image failed to load:', e);
                    // Ocultar la imagen si falla
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center ${user?.user_metadata?.avatar_url ? 'hidden' : ''}`}>
                {user?.user_metadata?.full_name ? (
                  <span className="text-2xl font-bold">
                    {user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold font-headline">{user?.user_metadata?.full_name ?? 'Usuario'}</h2>
            <p className="text-primary-foreground/80">{user?.email}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Miembro desde {user?.created_at ? 
                formatDate(new Date(user.created_at), 'MMM yyyy', { locale: es }) : 
                'recientemente'}</span>
            </div>
          </div>

          {/* User Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground px-4">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg overflow-hidden rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.totalTransactions}</p>
                  <p className="text-xs text-white/70">Transacciones</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg overflow-hidden rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.activeBudgets}</p>
                  <p className="text-xs text-white/70">Metas Activas</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg overflow-hidden rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.totalAccounts}</p>
                  <p className="text-xs text-white/70">Cuentas</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg overflow-hidden rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.daysActive}</p>
                  <p className="text-xs text-white/70">Días Activo</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground px-4">Datos</h3>
            <div className="rounded-2xl border bg-card text-card-foreground overflow-hidden">
              <ProfileListItem
                icon={Download}
                text="Exportar Datos"
                onClick={() => setIsExportDialogOpen(true)}
              />
              <Separator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <ProfileListItem
                    icon={Trash2}
                    text="Borrar Todos los Datos"
                    asTrigger
                  />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se borrarán permanentemente todas tus transacciones y metas de tu cuenta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>Continuar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* App Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground px-4">Configuración</h3>
            <div className="rounded-2xl border bg-card text-card-foreground overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  {isDarkMode ? <Moon className="mr-4 h-5 w-5 text-muted-foreground" /> : <Sun className="mr-4 h-5 w-5 text-muted-foreground" />}
                  <span>Modo Oscuro</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  {hideBalances ? <EyeOff className="mr-4 h-5 w-5 text-muted-foreground" /> : <Eye className="mr-4 h-5 w-5 text-muted-foreground" />}
                  <span>Ocultar Saldos</span>
                </div>
                <Switch
                  checked={hideBalances}
                  onCheckedChange={toggleHideBalances}
                />
              </div>
            </div>
          </div>
          
          {/* Application */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground px-4">Aplicación</h3>
             <div className="rounded-2xl border bg-card text-card-foreground overflow-hidden">
              <ProfileListItem
                icon={LogOut}
                text="Cerrar Sesión"
                onClick={handleLogout}
              />
            </div>
          </div>

        </div>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={handleCloseExportDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar Datos
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Genera reportes en PDF o Excel con tus datos financieros
              </DialogDescription>
            </DialogHeader>

            {exportSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">¡Exportación Exitosa!</h3>
                <p className="text-sm text-muted-foreground">
                  Tu archivo se ha descargado correctamente
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Format Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Formato de Archivo</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={format === 'pdf' ? 'default' : 'outline'}
                      className="h-12 flex flex-col items-center gap-1"
                      onClick={() => setFormat('pdf')}
                    >
                      <FileText className="w-5 h-5" />
                      <span className="text-xs">PDF</span>
                    </Button>
                    <Button
                      variant={format === 'excel' ? 'default' : 'outline'}
                      className="h-12 flex flex-col items-center gap-1"
                      onClick={() => setFormat('excel')}
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      <span className="text-xs">Excel</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Export Type Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tipo de Reporte</Label>
                  <div className="grid gap-3">
                    {exportTypes.map((exportType) => {
                      const Icon = exportType.icon;
                      return (
                        <Button
                          key={exportType.value}
                          variant={type === exportType.value ? 'default' : 'outline'}
                          className="h-auto p-4 justify-start"
                          onClick={() => setType(exportType.value)}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{exportType.label}</div>
                            <div className="text-xs opacity-75">{exportType.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Date Range Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Rango de Fechas</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rango" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Additional Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Opciones Adicionales</Label>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-charts" className="text-sm">Incluir Gráficos</Label>
                      <p className="text-xs text-muted-foreground">Añadir visualizaciones al reporte</p>
                    </div>
                    <Switch
                      id="include-charts"
                      checked={includeCharts}
                      onCheckedChange={setIncludeCharts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="include-categories" className="text-sm">Incluir Categorías</Label>
                      <p className="text-xs text-muted-foreground">Mostrar análisis por categorías</p>
                    </div>
                    <Switch
                      id="include-categories"
                      checked={includeCategories}
                      onCheckedChange={setIncludeCategories}
                    />
                  </div>
                </div>

                {/* Preview Card */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Vista Previa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium">{exportTypes.find(t => t.value === type)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formato:</span>
                      <span className="font-medium">{format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rango:</span>
                      <span className="font-medium">{dateRangeOptions.find(r => r.value === dateRange)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transacciones:</span>
                      <span className="font-medium">{filterTransactionsByDateRange(transactions, getDateRange()).length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              {!exportSuccess && (
                <>
                  <Button variant="outline" onClick={handleCloseExportDialog} disabled={isExporting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </PrivateRoute>
  );
}
