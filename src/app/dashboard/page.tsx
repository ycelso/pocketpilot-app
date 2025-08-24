'use client';

import { useState, useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Car, Utensils, ShoppingCart, Home, Heart, GraduationCap, Plane, Bus, Train, Car as CarIcon, Coffee, Pizza, ShoppingBag, Gift, Briefcase, DollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';
import { TransactionsContext } from '@/contexts/transactions-context';
import { BudgetsContext } from '@/contexts/budgets-context';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import MainLayout from '@/components/main-layout';
import PrivateRoute from '@/components/private-route';
import BalanceCard from '@/components/balance-card';
import PullToRefresh from '@/components/pull-to-refresh';

type TransactionTypeFilter = 'expense' | 'income';

// Función para obtener el icono y color de la categoría
const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  // Mapeo de categorías a iconos y colores
  const categoryMap: Record<string, { icon: any; color: string; bgColor: string }> = {
    'transporte': { icon: Car, color: '#3B82F6', bgColor: '#DBEAFE' },
    'comida': { icon: Utensils, color: '#EF4444', bgColor: '#FEE2E2' },
    'compras': { icon: ShoppingCart, color: '#8B5CF6', bgColor: '#EDE9FE' },
    'hogar': { icon: Home, color: '#10B981', bgColor: '#D1FAE5' },
    'salud': { icon: Heart, color: '#F59E0B', bgColor: '#FEF3C7' },
    'educación': { icon: GraduationCap, color: '#6366F1', bgColor: '#E0E7FF' },
    'viajes': { icon: Plane, color: '#EC4899', bgColor: '#FCE7F3' },
    'entretenimiento': { icon: Gift, color: '#F97316', bgColor: '#FED7AA' },
    'trabajo': { icon: Briefcase, color: '#6B7280', bgColor: '#F3F4F6' },
    'ingresos': { icon: DollarSign, color: '#10B981', bgColor: '#D1FAE5' },
    'salario': { icon: CreditCard, color: '#059669', bgColor: '#D1FAE5' },
    'ahorros': { icon: PiggyBank, color: '#7C3AED', bgColor: '#EDE9FE' },
    'otros': { icon: Wallet, color: '#6B7280', bgColor: '#F3F4F6' },
  };

  // Buscar coincidencia exacta o parcial
  for (const [key, value] of Object.entries(categoryMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }

  // Icono por defecto
  return { icon: Wallet, color: '#6B7280', bgColor: '#F3F4F6' };
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TransactionTypeFilter>('expense');
  const transactionsContext = useContext(TransactionsContext);
  const budgetsContext = useContext(BudgetsContext);
  const { user } = useAuth();

  if (!transactionsContext) throw new Error('DashboardPage must be used within TransactionsProvider');

  const { transactions, loading } = transactionsContext;
  const budgets = budgetsContext?.budgets || [];

  const handleRefresh = async () => {
    // Simulate refresh - in real app, this would refetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const recentTransactions = transactions
    .filter(t => t.type === activeTab)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <PrivateRoute>
      <MainLayout>
        <PullToRefresh onRefresh={handleRefresh} className="h-full">
          <div className="flex flex-col gap-6 p-4 md:p-6">
            <BalanceCard chartType={activeTab} />
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionTypeFilter)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="expense" className="text-sm font-medium">Gastos</TabsTrigger>
                <TabsTrigger value="income" className="text-sm font-medium">Ingresos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expense" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Recientes</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Cargando...</div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No hay gastos recientes
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => {
                          const categoryInfo = getCategoryIcon(transaction.category || 'otros');
                          const CategoryIcon = categoryInfo.icon;
                          return (
                          <div key={transaction.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: categoryInfo.bgColor }}
                              >
                                <CategoryIcon className="w-4 h-4" style={{ color: categoryInfo.color }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">{transaction.category || 'Sin categoría'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-red-600">
                                -{formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="income" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Recientes</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Cargando...</div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No hay ingresos recientes
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => {
                          const categoryInfo = getCategoryIcon(transaction.category || 'otros');
                          const CategoryIcon = categoryInfo.icon;
                          return (
                          <div key={transaction.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: categoryInfo.bgColor }}
                              >
                                <CategoryIcon className="w-4 h-4" style={{ color: categoryInfo.color }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">{transaction.category || 'Sin categoría'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">
                                +{formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PullToRefresh>
      </MainLayout>
    </PrivateRoute>
  );
}
