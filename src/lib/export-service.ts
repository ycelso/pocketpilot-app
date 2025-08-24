import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { ExportOptions, ExportData, StoredTransaction, Budget, Account } from './types';
import { formatCurrency } from './utils';
import { expenseCategories, incomeCategories } from './data';
import { format as formatDate, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export class ExportService {
  private static getCategoryName(categoryId: string): string {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const category = allCategories.find(cat => cat.id === categoryId);
    return category?.name || 'Sin categoría';
  }

  private static formatDate(dateString: string): string {
    try {
      return formatDate(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  }

  private static generatePDF(data: ExportData, options: ExportOptions): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PocketPilot - Reporte Financiero', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary section
    if (data.summary) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen Financiero', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Saldo Total: ${formatCurrency(data.summary.totalBalance)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Ingresos Totales: ${formatCurrency(data.summary.totalIncome)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Gastos Totales: ${formatCurrency(data.summary.totalExpenses)}`, 20, yPosition);
      yPosition += 15;

      // Top categories table
      if (data.summary.topCategories.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Categorías Principales', 20, yPosition);
        yPosition += 10;

        const categoryData = data.summary.topCategories.map(cat => [
          cat.name,
          formatCurrency(cat.amount),
          `${cat.percentage.toFixed(1)}%`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Categoría', 'Monto', 'Porcentaje']],
          body: categoryData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // Transactions section
    if (data.transactions && data.transactions.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Transacciones', 20, yPosition);
      yPosition += 10;

      const transactionData = data.transactions.map(transaction => [
        this.formatDate(transaction.date),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Ingreso' : 'Gasto',
        formatCurrency(transaction.amount)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
        body: transactionData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Budgets section
    if (data.budgets && data.budgets.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Presupuestos y Metas', 20, yPosition);
      yPosition += 10;

      const budgetData = data.budgets.map(budget => [
        budget.name,
        formatCurrency(budget.amount),
        budget.date ? this.formatDate(budget.date) : 'Sin fecha',
        'Activo'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nombre', 'Meta', 'Fecha', 'Estado']],
        body: budgetData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 }
      });
    }

    // Accounts section
    if (data.accounts && data.accounts.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Cuentas', 20, yPosition);
      yPosition += 10;

      const accountData = data.accounts.map(account => [
        account.name,
        account.type,
        formatCurrency(account.balance, account.currency as any),
        account.isActive ? 'Activa' : 'Inactiva'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nombre', 'Tipo', 'Saldo', 'Estado']],
        body: accountData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 }
      });
    }

    return doc;
  }

  private static generateExcel(data: ExportData, options: ExportOptions): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (data.summary) {
      const summaryData = [
        ['Resumen Financiero'],
        [''],
        ['Saldo Total', formatCurrency(data.summary.totalBalance)],
        ['Ingresos Totales', formatCurrency(data.summary.totalIncome)],
        ['Gastos Totales', formatCurrency(data.summary.totalExpenses)],
        [''],
        ['Categorías Principales'],
        ['Categoría', 'Monto', 'Porcentaje'],
        ...data.summary.topCategories.map(cat => [
          cat.name,
          cat.amount,
          `${cat.percentage.toFixed(1)}%`
        ])
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    }

    // Transactions sheet
    if (data.transactions && data.transactions.length > 0) {
      const transactionData = [
        ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto', 'Cuenta'],
        ...data.transactions.map(transaction => [
          this.formatDate(transaction.date),
          transaction.description,
          transaction.category,
          transaction.type === 'income' ? 'Ingreso' : 'Gasto',
          transaction.amount,
          transaction.accountId || 'N/A'
        ])
      ];

      const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transacciones');
    }

    // Budgets sheet
    if (data.budgets && data.budgets.length > 0) {
      const budgetData = [
        ['Nombre', 'Meta', 'Fecha', 'Estado'],
        ...data.budgets.map(budget => [
          budget.name,
          budget.amount,
          budget.date ? this.formatDate(budget.date) : 'Sin fecha',
          'Activo'
        ])
      ];

      const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Presupuestos');
    }

    // Accounts sheet
    if (data.accounts && data.accounts.length > 0) {
      const accountData = [
        ['Nombre', 'Tipo', 'Saldo', 'Moneda', 'Estado'],
        ...data.accounts.map(account => [
          account.name,
          account.type,
          account.balance,
          account.currency,
          account.isActive ? 'Activa' : 'Inactiva'
        ])
      ];

      const accountSheet = XLSX.utils.aoa_to_sheet(accountData);
      XLSX.utils.book_append_sheet(workbook, accountSheet, 'Cuentas');
    }

    return workbook;
  }

  static async exportData(data: ExportData, options: ExportOptions): Promise<void> {
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HH-mm');
    const fileName = `pocketpilot_${options.type}_${timestamp}`;

    try {
      if (options.format === 'pdf') {
        const doc = this.generatePDF(data, options);
        const pdfBlob = doc.output('blob');
        saveAs(pdfBlob, `${fileName}.pdf`);
      } else if (options.format === 'excel') {
        const workbook = this.generateExcel(data, options);
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(excelBlob, `${fileName}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Error al generar el archivo de exportación');
    }
  }

  static calculateSummaryData(transactions: StoredTransaction[]): ExportData['summary'] {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;

    // Calculate top categories
    const categoryTotals = new Map<string, number>();
    transactions.forEach(transaction => {
      const categoryName = transaction.category;
      const current = categoryTotals.get(categoryName) || 0;
      categoryTotals.set(categoryName, current + transaction.amount);
    });

    const topCategories = Array.from(categoryTotals.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate monthly data
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    transactions.forEach(transaction => {
      const month = formatDate(parseISO(transaction.date), 'yyyy-MM');
      const current = monthlyData.get(month) || { income: 0, expenses: 0 };
      
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
      
      monthlyData.set(month, current);
    });

    const monthlyDataArray = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: formatDate(parseISO(`${month}-01`), 'MMMM yyyy', { locale: es }),
        income: data.income,
        expenses: data.expenses
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      topCategories,
      monthlyData: monthlyDataArray
    };
  }
}
