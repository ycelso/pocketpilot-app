'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import TransactionItem from '@/components/transaction-item';
import type { Transaction } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TransactionsContext } from '@/contexts/transactions-context';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getRelativeDate, formatCurrency } from '@/lib/utils';
import { CurrencyContext } from '@/contexts/currency-context';
import { Separator } from './ui/separator';

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsList({ limit, showFilters = false, defaultFilter = 'all' }: { limit?: number, showFilters?: boolean, defaultFilter?: FilterType }) {
  const transactionsCtx = useContext(TransactionsContext);
  const currencyCtx = useContext(CurrencyContext);

  if (!transactionsCtx || !currencyCtx) throw new Error('TransactionsList must be used within its providers');
  
  const { transactions, loading } = transactionsCtx;
  const { currency } = currencyCtx;

  const [filter, setFilter] = useState<FilterType>(defaultFilter);

  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const filtered = filter === 'all' ? sorted : sorted.filter(t => t.type === filter);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [transactions, filter, limit]);

  const groupedTransactions = useMemo(() => {
    if (!showFilters) return {}; // Don't group if filters are not shown
    return filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions, showFilters]);

  const transactionEntries = Object.entries(groupedTransactions);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 5)].map((_, i) => (
          <TransactionItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
            <p>Aún no hay transacciones.</p>
            {showFilters && <p className="text-sm">¡Añade una para empezar!</p>}
        </div>
      )
  }
  
  if (filteredTransactions.length === 0 && !showFilters) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No hay {filter === 'expense' ? 'gastos' : 'ingresos'} recientes.</p>
      </div>
    )
  }


  return (
    <div>
      {showFilters && (
        <ToggleGroup 
            type="single" 
            value={filter}
            className="mb-4 grid grid-cols-3"
            onValueChange={(value: FilterType) => value && setFilter(value)}
        >
            <ToggleGroupItem value="all">Todo</ToggleGroupItem>
            <ToggleGroupItem value="income">Ingresos</ToggleGroupItem>
            <ToggleGroupItem value="expense">Gastos</ToggleGroupItem>
        </ToggleGroup>
      )}
      
      {showFilters ? (
        transactionEntries.length > 0 ? (
          <div className="space-y-4">
            {transactionEntries.map(([date, transactionsOnDate]) => {
              const dailyIncome = transactionsOnDate
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
              const dailyExpense = transactionsOnDate
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

              return (
                <Card key={date} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between p-3 bg-muted/50 border-b">
                    <p className="font-semibold text-sm">{getRelativeDate(date)}</p>
                    <div className="text-xs space-x-2">
                      {dailyIncome > 0 && <span className="text-green-600 font-medium">{formatCurrency(dailyIncome, currency)}</span>}
                      {dailyExpense > 0 && <span className="text-red-600 font-medium">-{formatCurrency(dailyExpense, currency)}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {transactionsOnDate.map(transaction => (
                        <div key={transaction.id} className="px-3">
                          <TransactionItem transaction={transaction} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          !loading && <p className="text-center text-muted-foreground py-8">No hay transacciones para este filtro.</p>
        )
      ) : (
        // Simple list for dashboard
        <div className="space-y-2">
            <div className="divide-y">
            {filteredTransactions.map(transaction => (
                <div key={transaction.id}>
                  <TransactionItem transaction={transaction} />
                </div>
            ))}
            </div>
            {limit && transactions.length > limit && (
                <div className="pt-2 text-center">
                    <Button variant="link" asChild>
                        <Link href="/transactions">Ver Todas</Link>
                    </Button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}


function TransactionItemSkeleton() {
    return (
      <div className="flex items-center space-x-4 py-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }
