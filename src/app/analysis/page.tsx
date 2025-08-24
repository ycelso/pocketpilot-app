
'use client';

import MainLayout from '@/components/main-layout';
import PrivateRoute from '@/components/private-route';
import PageHeader from '@/components/page-header';
import AnalysisView from '@/components/analysis-view';

export default function AnalysisPage() {

  return (
    <PrivateRoute>
      <MainLayout>
        <PageHeader title="Análisis de Transacciones" />
        <div className="p-4 md:p-6">
            <AnalysisView />
        </div>
      </MainLayout>
    </PrivateRoute>
  );
}
