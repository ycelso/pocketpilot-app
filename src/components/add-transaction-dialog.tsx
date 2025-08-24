
'use client';

import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { incomeCategories, expenseCategories } from '@/lib/data';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsContext } from '@/contexts/transactions-context';
import { BudgetsContext } from '@/contexts/budgets-context';
import { AccountsContext } from '@/contexts/accounts-context';
import { cn } from '@/lib/utils';
import type { Category, StoredTransaction, RecurrenceFrequency } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AddTransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AddTransactionDialog({ isOpen, setIsOpen }: AddTransactionDialogProps) {
  const transactionsContext = useContext(TransactionsContext);
  const budgetsContext = useContext(BudgetsContext);
  const accountsContext = useContext(AccountsContext);

  if (!transactionsContext || !budgetsContext || !accountsContext) {
    return null;
  }
  
  const { addTransaction } = transactionsContext;
  const { budgets } = budgetsContext;
  const { accounts } = accountsContext;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(expenseCategories[0].id);
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [budgetId, setBudgetId] = useState<string | undefined>(undefined);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);

  const { toast } = useToast();

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;
  const activeAccounts = accounts.filter(account => account.isActive);

  useEffect(() => {
    setCategoryId(currentCategories[0].id);
  }, [type, currentCategories]);

  useEffect(() => {
    // Set default account if none selected and accounts exist
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0].id);
    }
  }, [accountId, activeAccounts]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId(expenseCategories[0].id);
    setAccountId(activeAccounts.length > 0 ? activeAccounts[0].id : '');
    setDate(new Date().toISOString().split('T')[0]);
    setBudgetId(undefined);
    setIsRecurring(false);
    setRecurrenceFrequency('monthly');
    setRecurrenceEndDate(undefined);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !categoryId || (isRecurring && (!recurrenceFrequency || !recurrenceEndDate))) {
        toast({ title: "Por favor, rellena todos los campos requeridos.", variant: "destructive" });
        return;
    }

    const transactionData: any = {
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      date,
      isRecurring,
    };
    
    // Only include accountId if it's selected
    if (accountId) {
      transactionData.accountId = accountId;
    }
    
    if (type === 'expense' && budgetId) {
      transactionData.budgetId = budgetId;
    }

    if (isRecurring && recurrenceEndDate) {
      transactionData.recurrence = {
        frequency: recurrenceFrequency,
        endDate: recurrenceEndDate.toISOString().split('T')[0],
      }
    }

    try {
      addTransaction(transactionData);
      toast({ 
        title: "Transacción Añadida", 
        description: `${description}: ${formatCurrency(parseFloat(amount))}`,
        variant: "success"
      });
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast({ 
        title: "Error al añadir transacción", 
        description: "Hubo un problema al guardar la transacción",
        variant: "destructive" 
      });
    }
  };
  
  const CategoryChip = ({ category }: { category: Category }) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        'h-auto py-3 px-4 rounded-full flex items-center gap-2 border-2 whitespace-nowrap min-h-[44px]',
        categoryId === category.id
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border'
      )}
       style={{
          backgroundColor: categoryId === category.id ? `${category.color}20` : undefined,
          borderColor: categoryId === category.id ? category.color : undefined,
          color: categoryId === category.id ? category.color : undefined,
       }}
      onClick={() => setCategoryId(category.id)}
    >
      <category.icon className="w-5 h-5" />
      <span className="text-sm font-medium">{category.name}</span>
    </Button>
  );

  const AccountChip = ({ account }: { account: any }) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        'h-auto py-3 px-4 rounded-full flex items-center gap-2 border-2 whitespace-nowrap min-h-[44px]',
        accountId === account.id
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border'
      )}
      onClick={() => setAccountId(account.id)}
    >
      <account.icon className="w-5 h-5" style={{ color: account.color }} />
      <span className="text-sm font-medium">{account.name}</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b border-primary/10 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Añadir Transacción
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Añade un nuevo ingreso o gasto a tu cuenta.
              </DialogDescription>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70"></div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <Tabs
              value={type}
              onValueChange={(value) => setType(value as 'income' | 'expense')}
              className="w-full"
          >
              <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <TabsTrigger 
                    value="expense" 
                    className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    Gasto
                  </TabsTrigger>
                  <TabsTrigger 
                    value="income" 
                    className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    Ingreso
                  </TabsTrigger>
              </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</Label>
                <div className="relative">
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                    className="h-12 text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    inputMode="decimal"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary/30 rounded-full"></div>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</Label>
              <Input 
                id="description" 
                placeholder="ej., Café, Salario" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="account" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta (Opcional)</Label>
              </div>
              {activeAccounts.length === 0 ? (
                <div className="text-center py-6 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No tienes cuentas activas. La transacción se guardará sin asignar a una cuenta específica.
                  </p>
                </div>
              ) : (
                <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex w-max space-x-3 pb-2 px-3 py-2">
                    {activeAccounts.map((account) => (
                      <AccountChip key={account.id} account={account} />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>
             
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</Label>
              </div>
              <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex w-max space-x-3 pb-2 px-3 py-2">
                  {currentCategories.map((cat) => (
                    <CategoryChip key={cat.id} category={cat} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            
            {type === 'expense' && budgets.length > 0 && (
               <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700 dark:text-gray-300">Asignar a Meta (Opcional)</Label>
                   <Select value={budgetId} onValueChange={setBudgetId}>
                    <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                      <SelectValue placeholder="Selecciona una meta" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgets.map((budget) => (
                        <SelectItem key={budget.id} value={budget.id}>
                          {budget.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            )}

            <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <Label htmlFor="recurring-switch" className="font-medium text-sm text-gray-700 dark:text-gray-300">Transacción Recurrente</Label>
                <Switch id="recurring-switch" checked={isRecurring} onCheckedChange={setIsRecurring} />
              </div>
              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-sm text-gray-700 dark:text-gray-300">Frecuencia</Label>
                    <Select value={recurrenceFrequency} onValueChange={(value) => setRecurrenceFrequency(value as RecurrenceFrequency)}>
                      <SelectTrigger id="frequency" className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-sm text-gray-700 dark:text-gray-300">Fecha de Fin</Label>
                     <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="end-date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                            !recurrenceEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurrenceEndDate ? format(recurrenceEndDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={recurrenceEndDate}
                          onSelect={setRecurrenceEndDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Añadir Transacción
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
