'use client';
import { useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BudgetsContext } from '@/contexts/budgets-context';
import { TransactionsContext } from '@/contexts/transactions-context';
import { CurrencyContext } from '@/contexts/currency-context';
import { Target, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";

export default function BudgetList() {
    const budgetsContext = useContext(BudgetsContext);
    const transactionsContext = useContext(TransactionsContext);
    const currencyContext = useContext(CurrencyContext);

    if (!budgetsContext || !transactionsContext || !currencyContext) {
        throw new Error('BudgetList must be used within its providers');
    }

    const { budgets, deleteBudget, loading } = budgetsContext;
    const { transactions } = transactionsContext;
    const { currency } = currencyContext;

    const expensesByBudget = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'expense' && t.category) {
                // Usar el nombre de la categoría como clave
                const categoryName = t.category;
                acc[categoryName] = (acc[categoryName] || 0) + t.amount;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [transactions]);

    if (loading) {
        return <div>Cargando metas...</div>
    }

    if (budgets.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Target className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No has creado ninguna meta</h3>
                <p className="mt-2 text-sm">Empieza a planificar tus objetivos financieros.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {budgets.map((budget) => {
                const spentAmount = expensesByBudget[budget.category] || budget.spent;
                const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
                const progressColor = progress > 100 ? 'bg-red-500' : 'bg-primary';

                return (
                    <Card key={budget.id}>
                        <CardHeader className="pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">{budget.name}</CardTitle>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es permanente. Se borrará la meta "{budget.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteBudget(budget.id)}>Continuar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                <div>
                                    <Progress value={Math.min(progress, 100)} indicatorClassName={progressColor} />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>Gastado: {formatCurrency(spentAmount, currency)}</span>
                                        <span>Presupuesto: {formatCurrency(budget.amount, currency)}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Categoría: {budget.category} • Período: {budget.period === 'monthly' ? 'Mensual' : 'Anual'}
                                    {budget.date && <div>Fecha Límite: {formatDate(budget.date)}</div>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
