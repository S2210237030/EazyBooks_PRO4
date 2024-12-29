import { Component, OnInit } from '@angular/core';
import { TransactionServiceComponent } from '../transaction-service/transaction-service.component'; // Anpassen, falls nötig
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TranslateService } from '@ngx-translate/core';
import { ReportService } from '../services/report.service';

/**
 * Component for generating and managing reports.
 */
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  /** Selected month for report generation. */
  selectedMonth: number | null = null;
  /** Selected year for report generation. */
  selectedYear: number | null = null;
  /** List of reports with their IDs, names, and blob data. */
  reports: { id: string, name: string, blob: Blob }[] = [];

  /** Array to hold month options. */
  months: { value: number, name: string }[] = [];

  /**
   * Constructor for ReportsComponent.
   * @param transactionService Service for handling transactions.
   * @param translate Service for translations.
   * @param reportService Service for managing reports.
   */
  constructor(
    private transactionService: TransactionServiceComponent,
    private translate: TranslateService,
    private reportService: ReportService
  ) { }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Loads months and reports.
   */
  ngOnInit(): void {
    this.loadMonths();
    this.loadReports();
  }

  /**
   * Loads month names in different languages.
   */
  private loadMonths(): void {
    this.translate.get('MONTHS').subscribe((months: string[]) => {
      this.months = [
        { value: 1, name: months[0] },
        { value: 2, name: months[1] },
        { value: 3, name: months[2] },
        { value: 4, name: months[3] },
        { value: 5, name: months[4] },
        { value: 6, name: months[5] },
        { value: 7, name: months[6] },
        { value: 8, name: months[7] },
        { value: 9, name: months[8] },
        { value: 10, name: months[9] },
        { value: 11, name: months[10] },
        { value: 12, name: months[11] }
      ];
    });
  }

  /**
   * Loads reports from the report service.
   */
  private loadReports(): void {
    this.reportService.getReports().subscribe((snapshot) => {
      this.reports = snapshot.map((doc: { payload: { doc: { data: () => { name: string; data: string; }; id: any; }; }; }) => {
        const data = doc.payload.doc.data() as { name: string, data: string };
        const id = doc.payload.doc.id;

        // Blob aus Base64-Daten erstellen
        const base64Data = data.data.split(',')[1]; // Base64-Teil extrahieren
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/pdf' });

        return { id, name: data.name, blob };
      });
    }, error => {
      console.error('Error loading reports:', error);
    });
  }

  /**
   * Deletes a report by its ID.
   * @param reportId The ID of the report to be deleted.
   */
  deleteReport(reportId: string): void {
    this.reportService.deleteReport(reportId).then(() => {
      this.reports = this.reports.filter(report => report.id !== reportId);
      console.log('Report deleted successfully');
    }).catch(error => {
      console.error('Error deleting report:', error);
    });
  }

  /**
   * Generates a report based on the selected type (monthly or yearly).
   * @param reportType Type of report to generate ('monthly' or 'yearly').
   */
  generateReport(reportType: 'monthly' | 'yearly'): void {
    let startDate: Date;
    let endDate: Date;

    if (reportType === 'monthly' && this.selectedMonth && this.selectedYear) {
      const selectedMonthNumber = Number(this.selectedMonth);
      const monthObject = this.months.find(m => m.value === selectedMonthNumber);

      if (!monthObject) {
        console.error('Invalid month:', selectedMonthNumber);
        return;
      }

      const monthName = monthObject.name;
      startDate = new Date(this.selectedYear, selectedMonthNumber - 1, 1);
      endDate = new Date(this.selectedYear, selectedMonthNumber, 0);

      this.transactionService.getTransactionsBetweenDates(startDate, endDate).subscribe(transactions => {
        if (this.selectedYear) {
          const baseName = `${this.translate.instant('MONTHLY_REPORT')} ${monthName} ${this.selectedYear}`;
          const reportData = this.createPdf(transactions, reportType, monthName);
          const reportName = this.generateUniqueReportName(baseName);
          this.reports.push({
            id: Date.now().toString(),
            name: reportName,
            blob: reportData
          });
          this.saveReportToDatabase(reportName, reportData);

          this.selectedMonth = null;
          this.selectedYear = null;
        } else {
          console.error('Year is missing');
        }
      });

    } else if (reportType === 'yearly' && this.selectedYear) {
      startDate = new Date(this.selectedYear, 0, 1);
      endDate = new Date(this.selectedYear + 1, 0, 0);

      this.transactionService.getTransactionsBetweenDates(startDate, endDate).subscribe(transactions => {
        if (this.selectedYear) {
          const baseName = `${this.translate.instant('YEARLY_REPORT')} ${this.selectedYear}`;
          const reportData = this.createPdf(transactions, reportType, this.selectedYear.toString());
          const reportName = this.generateUniqueReportName(baseName);
          this.reports.push({
            id: Date.now().toString(),
            name: reportName,
            blob: reportData
          });
          this.saveReportToDatabase(reportName, reportData);

          this.selectedMonth = null;
          this.selectedYear = null;
        } else {
          console.error('Year is missing');
        }
      });
    } else {
      console.error('Invalid input');
      return;
    }
  }

  /**
   * Generates a unique report name based on a base name.
   * @param baseName The base name for the report.
   * @returns A unique report name.
   */
  generateUniqueReportName(baseName: string): string {
    let count = 2;
    let uniqueName = baseName;

    while (this.reports.some(report => report.name === uniqueName)) {
      uniqueName = `${baseName} - ${count}`;
      count++;
    }

    return uniqueName;
  }

  /**
   * Saves a report to the database.
   * @param reportName The name of the report.
   * @param reportData The blob data of the report.
   */
  saveReportToDatabase(reportName: string, reportData: Blob): void {
    const reportId = Date.now().toString();
    this.reportService.saveReport({ id: reportId, name: reportName, blob: reportData })
      .then(() => {
        console.log('Report saved successfully');
      })
      .catch(error => {
        console.error('Error saving report:', error);
      });
  }

  /**
   * Creates a PDF report from the provided transactions.
   * @param transactions The list of transactions to include in the report.
   * @param reportType The type of report ('monthly' or 'yearly').
   * @param period The period for the report (month name or year).
   * @returns The generated PDF as a Blob.
   */
  createPdf(transactions: any[], reportType: string, period: string): Blob {
    const doc = new jsPDF();

    // Colors and styles from your CSS file
    const headerColor: [number, number, number] = [138, 184, 245]; // Example: #8ab8f5
    const textColor: [number, number, number] = [51, 51, 51]; // Example: #333333
    const backgroundColor: [number, number, number] = [255, 255, 255]; // Example: #ffffff
    const borderColor: [number, number, number] = [204, 204, 204]; // Example: #cccccc

    // Title page
    doc.setFillColor(...backgroundColor);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    doc.setFontSize(22);
    doc.setTextColor(...headerColor);
    doc.text(this.translate.instant('REPORT'), 10, 20);

    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text(reportType === 'monthly' ? `${this.translate.instant('MONTHLY_REPORT')}: ${period}` : `${this.translate.instant('YEARLY_REPORT')}: ${period}`, 10, 30);
    doc.text(`${this.translate.instant('CREATED_ON')}: ${new Date().toLocaleDateString()}`, 10, 40);

    // Table headers
    doc.setFontSize(18);
    doc.setTextColor(...headerColor);
    doc.text(this.translate.instant('CATEGORIES'), 10, 60);
    const categoriesData = this.calculateCategories(transactions);
    (doc as any).autoTable({
      head: [[this.translate.instant('CATEGORY'), this.translate.instant('AMOUNT')]],
      body: categoriesData,
      startY: 70,
      theme: 'striped',
      headStyles: { fillColor: headerColor },
      styles: { cellPadding: 4, fontSize: 12, textColor: [0, 0, 0], fillColor: backgroundColor, lineColor: borderColor },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.height;
        const y = (doc as any).autoTable.previous.finalY || 60;
        if (y > pageHeight - 20) {
          doc.addPage();
        }
      }
    });

    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(...headerColor);
    doc.text(this.translate.instant('PROFIT_AND_LOSS_STATEMENT'), 10, 20);
    const guvData = this.calculateGuV(transactions);
    (doc as any).autoTable({
      head: [[this.translate.instant('DESCRIPTION'), this.translate.instant('AMOUNT')]],
      body: guvData,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: headerColor },
      styles: { cellPadding: 4, fontSize: 12, textColor: [0, 0, 0], fillColor: backgroundColor, lineColor: borderColor },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.height;
        const y = (doc as any).autoTable.previous.finalY || 30;
        if (y > pageHeight - 20) {
          doc.addPage();
        }
      }
    });

    if (transactions.length > 0) {
      doc.addPage();

      doc.setFontSize(18);
      doc.setTextColor(...headerColor);
      doc.text(this.translate.instant('TRANSACTIONS'), 10, 20);

      const tableData = transactions.map((transaction) => [
        this.formatDate(transaction.date) || this.translate.instant('N/A'),
        transaction.description || this.translate.instant('N/A'),
        '€ ' + (transaction.gross?.toFixed(2) || this.translate.instant('N/A')),
        transaction.incomeExpenses === 'income' ? this.translate.instant('INCOME_SINGLE') : this.translate.instant('EXPENSE')
      ]);

      (doc as any).autoTable({
        head: [[this.translate.instant('DATE'), this.translate.instant('DESCRIPTION'), this.translate.instant('AMOUNT'), this.translate.instant('TYPE')]],
        body: tableData,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: headerColor },
        styles: { cellPadding: 4, fontSize: 12, textColor: [0, 0, 0], fillColor: backgroundColor, lineColor: borderColor }
      });
    }

    return doc.output('blob');
  }

  /**
 * Formats a date string into a readable format (DD.MM.YYYY).
 * @param dateString - The date string to format, or undefined.
 * @returns The formatted date as a string, or a translation of 'N/A' if the date string is undefined.
 */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return this.translate.instant('N/A');
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /**
   * Calculates total amounts for each transaction category.
   * @param transactions - An array of transaction objects to calculate category totals from.
   * @returns An array of categories with their respective total amounts formatted as strings.
   */
  calculateCategories(transactions: any[]): any[] {
    const categoryTotals: Record<string, number> = transactions.reduce((acc, transaction) => {
      const category = transaction.category || this.translate.instant('OTHER');
      const amount = parseFloat(transaction.gross) || 0;
      if (acc[category]) {
        acc[category] += amount;
      } else {
        acc[category] = amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => [category, '€ ' + amount.toFixed(2)]);
  }

  /**
   * Calculates the profit and loss statement from a list of transactions.
   * @param transactions - An array of transaction objects to analyze for income and expenses.
   * @returns An array containing revenue, costs, and balance, each formatted with translations.
   */
  calculateGuV(transactions: any[]): any[] {
    const income = transactions.filter(t => t.incomeExpenses === 'income');
    const expenses = transactions.filter(t => t.incomeExpenses === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + (parseFloat(t.gross) || 0), 0).toFixed(2);
    const totalExpenses = expenses.reduce((sum, t) => sum + (parseFloat(t.gross) || 0), 0).toFixed(2);
    const profitBeforeTax = (parseFloat(totalIncome) - parseFloat(totalExpenses)).toFixed(2);
    const tax = (parseFloat(profitBeforeTax) * 0.20).toFixed(2); // Example tax: 20%
    const netProfit = (parseFloat(profitBeforeTax) - parseFloat(tax)).toFixed(2);

    return [
      [this.translate.instant('REVENUE'), this.formatAmount(totalIncome)],
      [this.translate.instant('COSTS'), this.formatAmount(totalExpenses)],
      [this.translate.instant('BALANCE'), this.formatAmount(profitBeforeTax)],
      // [this.translate.instant('TAXES'), `${tax} €`],
      // [this.translate.instant('NET_PROFIT'), `${netProfit} €`]
    ];
  }

  /**
   * Formats an amount string for display, adding a currency symbol.
   * @param amount - The amount string to format.
   * @returns The formatted amount with the Euro symbol, with special handling for negative amounts.
   */
  formatAmount(amount: string): string {
    // Prüfen, ob der Betrag negativ ist
    if (amount.startsWith('-')) {
      // Minuszeichen und Betrag trennen und ein Leerzeichen hinzufügen
      return `€ - ${amount.substring(1)}`;
    } else {
      return `€ ${amount}`;
    }
  }

  /**
   * Downloads a report by its ID, saving it as a PDF file.
   * @param reportId - The ID of the report to download.
   */
  downloadReport(reportId: string): void {
    const report = this.reports.find(r => r.id === reportId);

    if (report && report.blob) {
      saveAs(report.blob, `${report.name}.pdf`);
    } else {
      console.error('Report not found');
    }
  }

}
