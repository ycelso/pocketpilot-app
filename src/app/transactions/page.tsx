import MainLayout from '@/components/main-layout';
import TransactionsList from '@/components/transactions-list';
import PrivateRoute from '@/components/private-route';
import PageHeader from '@/components/page-header';

export default function TransactionsPage() {
  return (
    <PrivateRoute>
      <MainLayout>
        <PageHeader title="Historial de Transacciones" />
        <div className="p-4 md:p-6">
          <TransactionsList showFilters={true} />
        </div>
      </MainLayout>
    </PrivateRoute>
  );
}
