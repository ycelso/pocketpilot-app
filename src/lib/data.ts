import type { Category, Account } from '@/lib/types';
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  MoreHorizontal,
  Landmark,
  Store,
  TrendingUp,
  Gift,
} from 'lucide-react';

export const expenseCategories: Category[] = [
  { id: 'exp1', name: 'Comida', icon: Utensils, color: 'hsl(16 100% 70%)' },
  { id: 'exp2', name: 'Transporte', icon: Car, color: 'hsl(180 82% 50%)' },
  { id: 'exp3', name: 'Compras', icon: ShoppingBag, color: 'hsl(200 82% 50%)' },
  { id: 'exp4', name: 'Entretenimiento', icon: Film, color: 'hsl(48 95% 55%)' },
  { id: 'exp5', name: 'Salud', icon: HeartPulse, color: 'hsl(250 82% 60%)' },
  { id: 'exp6', name: 'Educación', icon: GraduationCap, color: 'hsl(250 82% 75%)' },
  { id: 'exp7', name: 'Viajes', icon: Plane, color: 'hsl(330 82% 70%)' },
  { id: 'exp8', name: 'Otros', icon: MoreHorizontal, color: 'hsl(210 10% 50%)' },
];

export const incomeCategories: Category[] = [
  { id: 'inc1', name: 'Sueldo', icon: Landmark, color: 'hsl(140 82% 50%)' },
  { id: 'inc2', name: 'Ventas', icon: Store, color: 'hsl(160 82% 50%)' },
  { id: 'inc3', name: 'Inversiones', icon: TrendingUp, color: 'hsl(120 82% 50%)' },
  { id: 'inc4', name: 'Regalos', icon: Gift, color: 'hsl(350 82% 70%)' },
  { id: 'inc5', name: 'Otros', icon: MoreHorizontal, color: 'hsl(210 10% 50%)' },
]

export const accounts: Account[] = [
  { 
    id: 'acc1', 
    name: 'Cuenta Principal', 
    type: 'bank' as const,
    balance: 0,
    currency: 'USD',
    color: '#0891b2',
    icon: Landmark,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];
