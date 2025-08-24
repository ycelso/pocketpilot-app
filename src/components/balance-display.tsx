'use client';

import { useAppSettings } from '@/hooks/use-app-settings';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceDisplayProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
}

export function BalanceDisplay({ 
  amount, 
  className = "", 
  showIcon = true,
  formatOptions = { style: 'currency', currency: 'USD' }
}: BalanceDisplayProps) {
  const { hideBalances, mounted } = useAppSettings();

  if (!mounted) {
    return <span className={cn("animate-pulse bg-gray-200 dark:bg-gray-700 rounded", className)}>••••</span>;
  }

  const formattedAmount = new Intl.NumberFormat('en-US', formatOptions).format(amount);

  if (hideBalances) {
    return (
      <span className={cn("flex items-center gap-1", className)}>
        <span className="font-mono">••••</span>
        {showIcon && <EyeOff className="w-4 h-4 text-muted-foreground" />}
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-1", className)}>
      <span className="font-mono">{formattedAmount}</span>
      {showIcon && <Eye className="w-4 h-4 text-muted-foreground" />}
    </span>
  );
}




