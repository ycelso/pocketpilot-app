'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/bottom-nav';
import AddTransactionDialog from '@/components/add-transaction-dialog';
import { useNotificationTriggers } from '@/hooks/use-notification-triggers';

interface MainLayoutProps {
  children: React.ReactNode;
  openAddBudgetDialog?: () => void;
}

export default function MainLayout({ children, openAddBudgetDialog }: MainLayoutProps) {
  const pathname = usePathname();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isTransactionDialogActuallyOpen, setIsTransactionDialogActuallyOpen] = useState(false);
  
  useNotificationTriggers();

  const isBudgetPage = pathname === '/budgets';
  const hiddenFabRoutes = ['/login', '/register', '/profile'];

  const handleFabClick = () => {
    if (isBudgetPage && openAddBudgetDialog) {
      openAddBudgetDialog();
    } else {
      setIsTransactionDialogOpen(true);
    }
  };

  useEffect(() => {
    setIsTransactionDialogActuallyOpen(isTransactionDialogOpen);
  }, [isTransactionDialogOpen]);

  const showFab = !hiddenFabRoutes.includes(pathname) && !isTransactionDialogActuallyOpen;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-card shadow-2xl">
      <div className="flex-1 overflow-y-auto pb-24">{children}</div>
      {showFab && (
        <div className="fixed bottom-24 right-4 z-[9999] pointer-events-auto">
          <Button
            size="icon"
            className="rounded-full h-16 w-16 bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-background cursor-pointer"
            onClick={handleFabClick}
            aria-label={isBudgetPage ? "Añadir meta" : "Añadir transacción"}
            style={{ zIndex: 9999, pointerEvents: 'auto', position: 'relative' }}
          >
            {isBudgetPage ? (<Target className="h-7 w-7" />) : (<Plus className="h-7 w-7" />)}
          </Button>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping pointer-events-none" />
        </div>
      )}
      <BottomNav />
      <AddTransactionDialog isOpen={isTransactionDialogActuallyOpen} setIsOpen={setIsTransactionDialogOpen} />
    </div>
  );
}
