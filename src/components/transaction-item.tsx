import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Trash2, Car, Utensils, ShoppingCart, Home, Heart, GraduationCap, Plane, Bus, Train, Car as CarIcon, Coffee, Pizza, ShoppingBag, Gift, Briefcase, DollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';
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
import { Button } from './ui/button';
import { useContext } from 'react';
import { TransactionsContext } from '@/contexts/transactions-context';
import { CurrencyContext } from '@/contexts/currency-context';

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

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { type, description, amount, category, date, id } = transaction;
  const transactionsContext = useContext(TransactionsContext);
  const currencyContext = useContext(CurrencyContext);

  if (!transactionsContext || !currencyContext) throw new Error('TransactionItem must be used within a TransactionsProvider and CurrencyProvider');
  
  const { deleteTransaction } = transactionsContext;
  const { currency } = currencyContext;

  const amountColor = type === 'income' ? 'text-green-600' : 'text-red-600';
  const amountSign = type === 'income' ? '+' : '-';
  
  const categoryInfo = getCategoryIcon(category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="flex items-center justify-between animate-fade-in-up group py-2">
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: categoryInfo.bgColor }}
        >
          <CategoryIcon className="w-5 h-5" style={{ color: categoryInfo.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{description}</p>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn('font-bold text-sm whitespace-nowrap text-right', amountColor)}>
            {amountSign}
            {formatCurrency(amount, currency)}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full transition-opacity opacity-100 md:opacity-0 group-hover:md:opacity-100 flex-shrink-0">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la transacción
                de <span className="font-semibold">{description}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTransaction(id)}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
