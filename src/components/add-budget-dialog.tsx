
'use client';

import React, { useState, useContext } from 'react';
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
import { BudgetsContext } from '@/contexts/budgets-context';

interface AddBudgetDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AddBudgetDialog({ isOpen, setIsOpen }: AddBudgetDialogProps) {
  const context = useContext(BudgetsContext);
  if (!context) throw new Error('AddBudgetDialog must be used within a BudgetsProvider');
  
  const { addBudget } = context;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setPeriod('monthly');
    setDate(new Date().toISOString().split('T')[0]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !category || !date) {
        toast({ title: "Por favor, rellena todos los campos.", variant: "destructive" });
        return;
    }
    addBudget({ 
        name,
        amount: parseFloat(amount),
        spent: 0, // Inicial en 0
        category,
        period,
        date,
    });
    toast({ 
        title: "Meta Añadida", 
        description: `¡A por la meta de ${name}!`,
        variant: "success"
      });
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b border-primary/10 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Crear Nueva Meta
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Define tu objetivo financiero, asigna un presupuesto y una fecha límite.
              </DialogDescription>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70"></div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Meta</Label>
              <Input 
                id="name" 
                placeholder="ej., Ahorrar para vacaciones" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Presupuesto</Label>
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
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</Label>
              <Input 
                id="category" 
                placeholder="ej., Alimentación, Transporte, Entretenimiento" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
                className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</Label>
              <Select value={period} onValueChange={(value: 'monthly' | 'yearly') => setPeriod(value)}>
                <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Límite</Label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Crear Meta
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
