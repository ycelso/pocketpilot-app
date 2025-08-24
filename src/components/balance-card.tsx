
'use client';

import { useState, useContext, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionsContext } from '@/contexts/transactions-context';
import { ArrowUpCircle, ArrowDownCircle, User } from 'lucide-react';
import { Pie, PieChart, Cell, Sector } from 'recharts';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { expenseCategories, incomeCategories } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { CurrencySelector } from './currency-selector';
import { CurrencyContext } from '@/contexts/currency-context';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BalanceDisplay } from './balance-display';
import { ThemeToggleButton } from '@/components/theme-toggle-button';


const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, currency } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-xs font-bold">
        {payload.name}
      </text>
       <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={fill} className="text-sm">
        {formatCurrency(payload.value, currency)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

interface BalanceCardProps {
    chartType?: 'income' | 'expense';
}

export default function BalanceCard({ chartType = 'expense'}: BalanceCardProps) {
  const transactionsContext = useContext(TransactionsContext);
  const currencyContext = useContext(CurrencyContext);
  const { user } = useAuth();

  if (!transactionsContext || !currencyContext) throw new Error('BalanceCard must be used within a TransactionsProvider and CurrencyProvider');
  
  const { transactions, loading } = transactionsContext;
  const { currency } = currencyContext;
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Función para procesar la URL de la foto de Google
  const getProcessedPhotoURL = (photoURL: string | null | undefined) => {
    if (!photoURL) return undefined;
    
    // Para URLs de Google, usar la URL original con parámetros optimizados
    if (photoURL.includes('googleusercontent.com')) {
      // Remover parámetros existentes y agregar los nuestros
      const baseURL = photoURL.split('?')[0].split('=s')[0];
      const optimizedURL = `${baseURL}=s96-c`;
      
      return optimizedURL;
    }
    
    return photoURL;
  };

  const { totalBalance, totalIncome, totalExpense, chartData } = useMemo(() => {
    const income = transactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const expense = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const dataByCategory = transactions
      .filter((t: Transaction) => t.type === chartType)
      .reduce((acc: Record<string, number>, t: Transaction) => {
        const categoryName = t.category || 'Otros';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {});

    const allCategories = chartType === 'expense' ? expenseCategories : incomeCategories;
    
    const chartData = allCategories
      .map((category) => ({
        name: category.name,
        value: dataByCategory[category.name] || 0,
        fill: category.color,
      }))
      .filter((item) => item.value > 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
      chartData: chartData,
    };
  }, [transactions, chartType]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };


  if (loading) {
    return <BalanceCardSkeleton />;
  }

  const noData = chartData.length === 0;

  return (
    <Card className="bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-lg overflow-hidden rounded-3xl -mt-2">
      <CardContent className="relative flex flex-col p-6 gap-4">
         <div className="absolute top-4 left-4 flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-white/20 shadow-lg rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white">
                {user?.user_metadata?.avatar_url ? (
                    <img 
                        src={getProcessedPhotoURL(user.user_metadata.avatar_url)} 
                        alt={user?.user_metadata?.full_name ?? 'Usuario'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                            // Ocultar la imagen si falla
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${user?.user_metadata?.avatar_url ? 'hidden' : ''}`}>
                    {user?.user_metadata?.full_name ? (
                        <span className="text-sm font-bold">
                            {user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>
            </div>
            <span className="text-sm font-medium text-primary-foreground/90">
                Hola, {user?.user_metadata?.full_name?.split(' ')[0] ?? 'Usuario'}
            </span>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 h-10">
            <CurrencySelector />
            <ThemeToggleButton variant="green" />
        </div>
        
        <div className="flex items-center w-full pt-16 gap-4">
            <div className="flex-1 text-left">
              <p className="text-sm sm:text-base font-normal text-primary-foreground/80 mb-1">Saldo Total</p>
              <div className="text-2xl sm:text-3xl font-bold">
                <BalanceDisplay 
                  amount={totalBalance} 
                  className="text-primary-foreground"
                  showIcon={false}
                  formatOptions={{ style: 'currency', currency }}
                />
              </div>
            </div>
             <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 sm:w-36 sm:h-36">
                    <ChartContainer config={{}} className="mx-auto aspect-square h-full">
                       {noData ? (
                           <PieChart>
                                <Pie data={[{ value: 1 }]} dataKey="value" innerRadius="60%" stroke="none">
                                    <Cell fill="hsla(0, 0%, 100%, 0.1)" />
                                </Pie>
                           </PieChart>
                       ) : (
                           <PieChart>
                                <Pie 
                                    activeIndex={activeIndex}
                                    activeShape={(props: any) => renderActiveShape({...props, currency})}
                                    data={chartData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    innerRadius="60%" 
                                    strokeWidth={5}
                                    cornerRadius={10}
                                    paddingAngle={5}
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={onPieLeave}
                                    onClick={onPieEnter}
                                >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} className="cursor-pointer" />
                                ))}
                                </Pie>
                            </PieChart>
                       )}
                    </ChartContainer>
                     {noData && (
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                            <p className="text-xs text-primary-foreground/60">Sin transacciones</p>
                        </div>
                     )}
                </div>
            </div>
        </div>

        <div className="flex justify-between gap-4 mt-2">
          <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-300" />
              <div>
                  <p className="text-primary-foreground/70 text-xs">Ingresos</p>
                  <p className="font-semibold text-xs">
                    <BalanceDisplay 
                      amount={totalIncome} 
                      className="text-primary-foreground"
                      showIcon={false}
                      formatOptions={{ style: 'currency', currency }}
                    />
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-red-300" />
              <div>
                  <p className="text-primary-foreground/70 text-xs">Gastos</p>
                  <p className="font-semibold text-xs">
                    <BalanceDisplay 
                      amount={totalExpense} 
                      className="text-primary-foreground"
                      showIcon={false}
                      formatOptions={{ style: 'currency', currency }}
                    />
                  </p>
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceCardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardContent className="flex justify-between items-center p-6">
        <div>
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-6">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
            <Skeleton className="w-36 h-36 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
