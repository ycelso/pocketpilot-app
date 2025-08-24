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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AccountsContext } from '@/contexts/accounts-context';
import { cn } from '@/lib/utils';
import type { AccountType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface AddAccountDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const accountTypes: { value: AccountType; label: string; description: string }[] = [
  { value: 'bank', label: 'Cuenta Bancaria', description: 'Cuenta corriente o de ahorros' },
  { value: 'credit', label: 'Tarjeta de Crédito', description: 'Tarjeta de crédito bancaria' },
  { value: 'cash', label: 'Efectivo', description: 'Dinero en efectivo' },
  { value: 'savings', label: 'Cuenta de Ahorros', description: 'Cuenta específica para ahorros' },
  { value: 'investment', label: 'Inversiones', description: 'Cuenta de inversión o bolsa' },
];

export default function AddAccountDialog({ isOpen, setIsOpen }: AddAccountDialogProps) {
  const accountsContext = useContext(AccountsContext);
  const { toast } = useToast();

  if (!accountsContext) {
    return null;
  }

  const { addAccount } = accountsContext;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setType('bank');
    setBalance('');
    setCurrency('USD');
    setIsActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !balance) {
      toast({ title: "Por favor, rellena todos los campos requeridos.", variant: "destructive" });
      return;
    }

    const balanceNumber = parseFloat(balance);
    if (isNaN(balanceNumber)) {
      toast({ title: "El saldo debe ser un número válido.", variant: "destructive" });
      return;
    }

    try {
      addAccount({
        name: name.trim(),
        type,
        balance: balanceNumber,
        currency,
        color: '', // Will be set by context
        icon: null as any, // Will be set by context
        isActive,
      });
      
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Error al añadir cuenta", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b border-primary/10 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Añadir Nueva Cuenta
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Crea una nueva cuenta para organizar mejor tus finanzas.
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
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Cuenta</Label>
              <Input 
                id="name" 
                placeholder="ej., Cuenta Principal" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Cuenta</Label>
              <Select value={type} onValueChange={(value) => setType(value as AccountType)}>
                <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Banco</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="savings">Ahorros</SelectItem>
                  <SelectItem value="investment">Inversión</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Inicial</Label>
              <div className="relative">
                <Input 
                  id="balance" 
                  type="number" 
                  placeholder="0.00" 
                  value={balance} 
                  onChange={(e) => setBalance(e.target.value)} 
                  required 
                  className="h-12 text-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  inputMode="decimal"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary/30 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                  <SelectValue placeholder="Selecciona la moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - Libra Esterlina</SelectItem>
                  <SelectItem value="JPY">JPY - Yen Japonés</SelectItem>
                  <SelectItem value="CAD">CAD - Dólar Canadiense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cuenta Activa
              </Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Añadir Cuenta
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

