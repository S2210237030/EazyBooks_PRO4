import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { YearDialogComponent } from '../year-dialog/year-dialog.component';
import { TransactionServiceComponent } from '../transaction-service/transaction-service.component';
import Chart from 'chart.js/auto';

/**
 * The `DashboardComponent` class is responsible for displaying a dashboard that shows 
 * financial data including total income, expenses, and balance for a selected year.
 * It utilizes Chart.js for visualizing this data in a bar chart format.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  /**
   * Total income formatted as a string.
   */
  totalIncome = "0,00";

  /**
   * Total expenses formatted as a string.
   */
  totalExpenses = "0,00";

  /**
   * Calculated balance formatted as a string.
   */
  saldo = "0,00";

  /**
   * The year selected for viewing financial data.
   */
  selectedYear = 2024;

  /**
   * ViewChild reference for the chart canvas element.
   */
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>; // ViewChild for the canvas element

  /**
   * Instance of the Chart.js chart for displaying data.
   */
  private chart?: Chart<'bar'>; // Store the chart instance

  /**
   * Constructor that injects necessary services for dialog handling,
   * transaction data management, and translation.
   * 
   * @param dialog - Dialog service for opening dialog components.
   * @param transactionService - Service for managing transaction data.
   * @param translate - Service for handling translations.
   */
  constructor(private dialog: MatDialog,
    private transactionService: TransactionServiceComponent,
    private translate: TranslateService) {
    console.log("dashboard is active");
  }

  /**
   * Lifecycle hook that is called when the component is initialized.
   * It updates the dashboard data for the initially selected year.
   */
  ngOnInit(): void {
    this.updateDashboardData(this.selectedYear);
  }

  /**
   * Lifecycle hook that is called after the view has been initialized.
   * It generates the chart using the available data.
   */
  ngAfterViewInit(): void {
    this.generateChart();
  }

  /**
   * Updates the dashboard data by fetching total income and expenses
   * for the given year and recalculating the balance.
   * 
   * @param year - The year for which the data should be updated.
   */
  updateDashboardData(year: number): void {
    this.transactionService.getTotalIncome(year).subscribe((income: string) => {
      this.totalIncome = income;
      console.log('Total Income:', this.totalIncome);
      this.updateSaldo();
    });

    this.transactionService.getTotalExpenses(year).subscribe((expenses: string) => {
      this.totalExpenses = expenses;
      this.updateSaldo();
    });
  }

  /**
   * Parses formatted monetary amounts from string format to number.
   * 
   * @param amount - The formatted amount as a string.
   * @returns The parsed amount as a number.
   */
  private parseFormattedAmount(amount: string): number {
    // Remove all thousand separators (dots) and replace the decimal separator (comma) with a dot
    return parseFloat(amount.replace(/\./g, '').replace(',', '.'));
  }

  /**
   * Updates the balance by calculating the difference between total income and expenses.
   */
  updateSaldo(): void {
    // Use the helper function to parse the amounts
    const income = this.parseFormattedAmount(this.totalIncome);
    const expenses = this.parseFormattedAmount(this.totalExpenses);

    // Calculate the balance
    const saldo = income - expenses;

    // Format the balance in the format "1.000,00"
    this.saldo = this.formatAmount(saldo);
  }

  /**
   * Formats a numeric amount into a string representation with localized formatting.
   * 
   * @param amount - The amount to be formatted.
   * @returns The formatted amount as a string.
   */
  private formatAmount(amount: number): string {
    if (isNaN(amount)) return '0,00';

    // Format as "1.000,00"
    const formattedAmount = amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Check if the amount is negative
    if (amount < 0) {
      return `- ${formattedAmount.substring(1)}`; // Remove the leading minus sign and add a space
    } else {
      return `${formattedAmount}`; // For positive amounts
    }
  }

  /**
   * Opens a dialog for selecting a different year to view the dashboard data.
   */
  openYearDialog(): void {
    console.log('openYearDialog called');
    const dialogRef = this.dialog.open(YearDialogComponent, {
      width: '250px',
      data: { selectedYear: this.selectedYear }
    });

    dialogRef.afterClosed().subscribe((result: number) => {
      if (result) {
        this.selectedYear = result;
        this.updateDashboardData(this.selectedYear);
        this.generateChart();
      }
    });
  }

  /**
   * Generates a bar chart based on the income, expenses, and balance data 
   * for the selected year. It updates the chart whenever the year changes.
   */
  generateChart(): void {
    if (this.chartCanvas) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        // Use data from the service for the chart
        this.transactionService.getChartData(this.selectedYear).subscribe((chartData: any) => {
          const incomeData = chartData.income || [];
          const expensesData = chartData.expenses || [];
          const saldoData = incomeData.map((income: number, index: number) => income - expensesData[index]);

          const saldoPositive = saldoData.map((saldo: number) => saldo > 0 ? saldo : 0);
          const saldoNegative = saldoData.map((saldo: number) => saldo < 0 ? -saldo : 0);

          if (this.chart) {
            this.chart.destroy();
          }

          // Create the chart instance
          this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: chartData.months,
              datasets: [
                {
                  label: this.translate.instant('INCOME'),
                  data: incomeData,
                  backgroundColor: 'rgba(0, 128, 0, 0.6)', // Dark green for income
                  borderColor: 'rgba(0, 128, 0, 1)',
                  borderWidth: 1,
                  stack: 'stack1'
                },
                {
                  label: this.translate.instant('EXPENSES'),
                  data: expensesData,
                  backgroundColor: 'rgba(255, 0, 0, 0.6)', // Dark red for expenses
                  borderColor: 'rgba(255, 0, 0, 1)',
                  borderWidth: 1,
                  stack: 'stack2'
                },
                {
                  label: this.translate.instant('BALANCE'),
                  data: saldoPositive,
                  backgroundColor: 'rgba(128, 128, 128, 0.6)', // Gray for positive balances
                  borderColor: 'rgba(128, 128, 128, 1)',
                  borderWidth: 1,
                  stack: 'stack2', // Positive balance on stack2
                  type: 'bar',
                  order: 0 // Lower order so that it is behind other bars
                },
                {
                  label: '',
                  data: saldoNegative,
                  backgroundColor: 'rgba(128, 128, 128, 0.6)', // Gray for negative balances
                  borderColor: 'rgba(128, 128, 128, 1)',
                  borderWidth: 1,
                  stack: 'stack1', // Negative balance on stack1
                  type: 'bar',
                  order: 1, // Higher order than other balances
                }
              ]
            },
            options: {
              plugins: {
                legend: {
                  labels: {
                    filter: function (legendItem) {
                      return legendItem.text !== '';
                    }
                  },
                  onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex ?? -1;
                    const chart = legend.chart;

                    if (index === 0) {
                      const incomeDataset = chart.data.datasets[0];
                      incomeDataset.hidden = !incomeDataset.hidden;
                    } else if (index === 1) {
                      const expensesDataset = chart.data.datasets[1];
                      expensesDataset.hidden = !expensesDataset.hidden;
                    } else if (index === 2) {
                      const saldoPositiveDataset = chart.data.datasets[2];
                      saldoPositiveDataset.hidden = !saldoPositiveDataset.hidden;
                      const saldoNegativeDataset = chart.data.datasets[3];
                      saldoNegativeDataset.hidden = !saldoNegativeDataset.hidden;
                    }

                    chart.toggleDataVisibility(index);
                    chart.update();
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const value = tooltipItem.raw as number;
                      return ` € ${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  stacked: true
                },
                x: {
                  stacked: true // Stacking the bars on the x-axis
                }
              }
            }
          });
        }, error => {
          console.error('Chart Data Error:', error); // Log any potential errors
        });
      }
    }
  }
}
