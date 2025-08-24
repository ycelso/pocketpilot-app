
'use client';
import { useState } from 'react';
import MainLayout from '@/components/main-layout';
import PageHeader from '@/components/page-header';
import BudgetList from '@/components/budget-list';
import PrivateRoute from '@/components/private-route';
import { BudgetsProvider } from '@/contexts/budgets-context';
import AddBudgetDialog from '@/components/add-budget-dialog';

export default function BudgetsPage() {
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);

  return (
    <PrivateRoute>
      <BudgetsProvider>
        <MainLayout openAddBudgetDialog={() => setIsAddBudgetDialogOpen(true)}>
          <PageHeader title="Mis Metas" />
          <div className="p-4 md:p-6">
            <BudgetList />
          </div>
          <AddBudgetDialog isOpen={isAddBudgetDialogOpen} setIsOpen={setIsAddBudgetDialogOpen} />
        </MainLayout>
      </BudgetsProvider>
    </PrivateRoute>
  );
}
