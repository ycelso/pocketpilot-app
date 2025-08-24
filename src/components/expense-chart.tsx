'use client';

import { Pie, PieChart, Cell, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { expenseCategories as allCategories } from '@/lib/data';
import { useMemo, useContext } from 'react';
import { TransactionsContext } from '@/contexts/transactions-context';
import { CurrencyContext } from '@/contexts/currency-context';
import { formatCurrency } from '@/lib/utils';


export default function ExpenseChart() {
  const transactionsContext = useContext(TransactionsContext);
  const currencyContext = useContext(CurrencyContext);

  if (!transactionsContext || !currencyContext) throw new Error('ExpenseChart must be used within a TransactionsProvider and CurrencyProvider');
  
  const { transactions } = transactionsContext;
  const { currency } = currencyContext;

  const chartData = useMemo(() => {
    const expenseByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryName = t.category || 'Otros';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return allCategories
      .map((category) => ({
        name: category.name,
        value: expenseByCategory[category.name] || 0,
        fill: category.color,
      }))
      .filter((item) => item.value > 0)
      .sort((a,b) => b.value - a.value);
  }, [transactions]);

  const chartConfig = Object.fromEntries(
    chartData.map((item) => [item.name, { label: item.name, color: item.fill }])
  );

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            No hay gastos para mostrar.
        </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent 
            hideLabel 
            formatter={(value, name, props) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{props.payload.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(props.payload.value, currency)}</span>
                </div>
            )}
           />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          strokeWidth={5}
          labelLine={false}
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            percent,
          }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            
            if (percent < 0.05) return null;

            return (
              <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="text-xs font-bold"
              >
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}
