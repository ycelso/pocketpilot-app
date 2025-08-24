'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CurrencyContext, Currency } from '@/contexts/currency-context';

export function CurrencySelector() {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    throw new Error('CurrencySelector must be used within a CurrencyProvider');
  }
  const { currency, setCurrency } = context;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 w-auto"
        >
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
          <DropdownMenuRadioItem value="USD">Dólar (USD)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="DOP">Peso Dominicano (DOP)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="EUR">Euro (EUR)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
