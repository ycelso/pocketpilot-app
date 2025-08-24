'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, CreditCard, BarChart3, Target, User, Wallet } from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: Home,
  },
  {
    href: '/transactions',
    label: 'Transacciones',
    icon: CreditCard,
  },
  {
    href: '/analysis',
    label: 'Análisis',
    icon: BarChart3,
  },
  {
    href: '/accounts',
    label: 'Cuentas',
    icon: Wallet,
  },
  {
    href: '/budgets',
    label: 'Metas',
    icon: Target,
  },
  {
    href: '/profile',
    label: 'Perfil',
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const handleNavClick = (href: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 border-t bg-card/95 backdrop-blur-sm max-w-md mx-auto z-50">
      <div className="h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
      <nav className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary transition-all duration-200 active:scale-95 min-h-[44px]"
              onClick={() => handleNavClick(item.href)}
            >
              <div className={cn(
                'relative p-2 rounded-full transition-all duration-200',
                isActive && 'bg-primary/10'
              )}>
                <item.icon className={cn(
                  'h-5 w-5 transition-all duration-200',
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                )} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                'text-xs font-medium mt-1 transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
