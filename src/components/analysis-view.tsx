
'use client';

import { useState, useMemo, useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { TransactionsContext } from '@/contexts/transactions-context';
import { CurrencyContext } from '@/contexts/currency-context';
import { expenseCategories, incomeCategories } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { subMonths, startOfMonth, endOfMonth, format, startOfYear, endOfYear, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Transaction } from '@/lib/types';


type TransactionType = 'expense' | 'income';
type PeriodType = 'month' | 'year';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, currency } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xl font-bold">
        {formatCurrency(value, currency)}
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


export default function AnalysisView() {
  const [type, setType] = useState<TransactionType>('expense');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const transactionsContext = useContext(TransactionsContext);
  const currencyContext = useContext(CurrencyContext);
  if (!transactionsContext || !currencyContext) throw new Error('AnalysisView must be used within its providers');
  
  const { transactions } = transactionsContext;
  const { currency } = currencyContext;

  const periods = useMemo(() => {
    const now = new Date();
    if (period === 'month') {
        return [
            { label: 'Este mes', from: startOfMonth(now), to: endOfMonth(now) },
            { label: 'Mes pasado', from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) },
            { label: format(subMonths(now, 2), 'yyyy.M'), from: startOfMonth(subMonths(now, 2)), to: endOfMonth(subMonths(now, 2)) },
            { label: format(subMonths(now, 3), 'yyyy.M'), from: startOfMonth(subMonths(now, 3)), to: endOfMonth(subMonths(now, 3)) },
        ]
    } else { // year
        return [
            { label: 'Este año', from: startOfYear(now), to: endOfYear(now) },
            { label: 'Año pasado', from: startOfYear(subYears(now, 1)), to: endOfYear(subYears(now, 1)) },
            { label: format(subYears(now, 2), 'yyyy'), from: startOfYear(subYears(now, 2)), to: endOfYear(subYears(now, 2)) },
        ]
    }
  }, [period]);

  const filteredData = useMemo(() => {
    const selectedPeriod = periods[selectedPeriodIndex];
    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    const filteredTransactions = transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === type &&
        transactionDate >= selectedPeriod.from &&
        transactionDate <= selectedPeriod.to
      );
    });

    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    const dataByCategory = filteredTransactions.reduce((acc, t) => {
      const categoryId = t.categoryId;
      if (categoryId) {
        acc[categoryId] = (acc[categoryId] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    if (total === 0) {
      return { chartData: [], listData: [], total: 0 };
    }
    
    const chartData = Object.entries(dataByCategory).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Otros',
        value: amount,
        fill: category?.color || '#8884d8',
      };
    }).filter(item => item.value > 0);

    const listData = categories
      .map(category => {
        const amount = dataByCategory[category.id] || 0;
        return {
          ...category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        };
      })
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { chartData, listData, total };
  }, [transactions, type, selectedPeriodIndex, periods]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };


  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4 bg-primary/10">
          <div className="grid grid-cols-2 gap-4">
            <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gastos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={period} onValueChange={(v) => { setPeriod(v as PeriodType); setSelectedPeriodIndex(0); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="month">Mes</TabsTrigger>
                <TabsTrigger value="year">Año</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
           <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-1 border-b">
                    {periods.map((p, index) => (
                        <button 
                            key={p.label}
                            onClick={() => setSelectedPeriodIndex(index)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${selectedPeriodIndex === index ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
              <ScrollBar orientation="horizontal" className="h-1"/>
            </ScrollArea>
        </CardContent>
      </Card>
      
      {filteredData.total > 0 ? (
        <>
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/2 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="90%"
                            dataKey="value"
                            activeIndex={activeIndex}
                            activeShape={(props: any) => renderActiveShape({...props, value: filteredData.total, currency: currency as any})}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                        >
                        {filteredData.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                        ))}
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-2 text-sm">
                    {filteredData.listData.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="flex-1 text-muted-foreground">{item.name}</span>
                            <span className="font-medium">{item.percentage.toFixed(2)}%</span>
                        </div>
                    ))}
                </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 pt-4 space-y-4">
                    {filteredData.listData.map(item => (
                        <div key={item.id}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}20`}}>
                                        <item.icon className="w-5 h-5" style={{ color: item.color }}/>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.percentage.toFixed(2)}%</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold">{formatCurrency(item.amount, currency)}</div>
                            </div>
                            <Progress value={item.percentage} style={{ backgroundColor: item.color, height: '6px' }} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
      ) : (
        <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
                <p>No hay datos de {type === 'expense' ? 'gastos' : 'ingresos'} para este período.</p>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
