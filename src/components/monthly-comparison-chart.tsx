'use client';

import { useMemo, useContext } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TransactionsContext } from '@/contexts/transactions-context';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { CurrencyContext } from '@/contexts/currency-context';


export default function MonthlyComparisonChart() {
    const transactionsContext = useContext(TransactionsContext);
    const currencyContext = useContext(CurrencyContext);

    if (!transactionsContext || !currencyContext) throw new Error('MonthlyComparisonChart must be used within a TransactionsProvider and CurrencyProvider');
    
    const { transactions } = transactionsContext;
    const { currency } = currencyContext;

    const monthlyData = useMemo(() => {
        const data: { [key: string]: { month: string; income: number; expense: number } } = {};

        transactions.forEach((transaction: Transaction) => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
            
            if (!data[monthKey]) {
                data[monthKey] = { month: monthName, income: 0, expense: 0 };
            }

            if (transaction.type === 'income') {
                data[monthKey].income += transaction.amount;
            } else {
                data[monthKey].expense += transaction.amount;
            }
        });
        
        return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));

    }, [transactions]);
    
    if (monthlyData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos suficientes para mostrar el análisis mensual.
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => formatCurrency(value as number, currency)} tickLine={false} axisLine={false}/>
                <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload, label }) =>
                        active && (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-1 gap-2">
                                <p className="text-sm font-medium">{label}</p>
                                {payload?.map(item => (
                                    <div key={item.dataKey} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}/>
                                        <p className="text-sm text-muted-foreground capitalize">{item.name}:</p>
                                        <p className="text-sm font-medium">{formatCurrency(item.value as number, currency)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )
                    }
                />
                <Legend />
                <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Gastos" />
            </BarChart>
        </ResponsiveContainer>
    );
}
