import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionServiceComponent } from '../transaction-service/transaction-service.component';
import { TransactionEntry } from '../transaction-entry.model';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

/**
 * TransactionsComponent manages the display and handling of transactions.
 * It allows users to view, add, edit, and delete transactions, 
 * as well as filter them by year and month.
 */
@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactionsList: TransactionEntry[] = []; // List of all transactions
  groupedTransactions: { [key: string]: TransactionEntry[] } = {}; // Grouped transactions by month and year
  filteredTransactions: TransactionEntry[] = []; // Transactions filtered by the selected year
  totalIncome: number = 0; // Total income from filtered transactions
  totalExpenses: number = 0; // Total expenses from filtered transactions
  selectedYear: number = new Date().getFullYear(); // Currently selected year
  selectedMonth: number = new Date().getMonth() + 1; // Currently selected month
  selectedMonthText: string = ''; // Text representation of the selected month
  filterType: string = '--'; // Current filter type (e.g., Year)
  private subscription: Subscription = new Subscription(); // Subscription to handle multiple observables
  documentIcons: { [key: string]: SafeResourceUrl } = {}; // Icons for different document types

  months: string[] = []; // Array of month names

  constructor(
    private dialog: MatDialog, // MatDialog for opening dialog components
    private transactionService: TransactionServiceComponent, // Service for transaction operations
    private sanitizer: DomSanitizer, // Sanitizer for safe resource URLs
    private translate: TranslateService // Translate service for internationalization
  ) { }

  ngOnInit(): void {
    this.loadTransactions(); // Load all transactions on component initialization
    this.loadIcons(); // Load document icons for display
    this.loadMonths(); // Load month names for filtering
  }

  /**
   * Loads the icons for different document types and sanitizes the URLs.
   */
  loadIcons() {
    this.documentIcons['png'] = this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/png_icon.svg');
    this.documentIcons['jpeg'] = this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/jpeg_icon.svg');
    this.documentIcons['default'] = this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/doc_icon.svg');
    this.documentIcons['pdf'] = this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/pdf_icon.svg');
  }

  /**
   * Returns the icon type based on the document name.
   * @param documentName - The name of the document
   * @returns SafeResourceUrl - The URL of the corresponding icon
   */
  getIconType(documentName: string): SafeResourceUrl {
    if (documentName.includes('png')) {
      return this.documentIcons['png'];
    } else if (documentName.includes('jpeg') || documentName.includes('jpg')) {
      return this.documentIcons['jpeg'];
    } else if (documentName.includes('pdf')) {
      return this.documentIcons['pdf'];
    } else {
      return this.documentIcons['default'];
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to avoid memory leaks
    this.subscription.unsubscribe();
  }

  /**
   * Opens the transaction dialog for editing a transaction.
   * @param transaction - The transaction to edit
   */
  editTransaction(transaction: TransactionEntry): void {
    this.openTransactionDialog(transaction); // Open the dialog with the selected transaction
  }

  /**
   * Loads transactions from the transaction service and processes them.
   */
  loadTransactions(): void {
    const transactionSub = this.transactionService.getTransactions().subscribe(
      (transactions: TransactionEntry[]) => {
        this.transactionsList = transactions; // Assign loaded transactions to the component's list
        this.filterTransactions(); // Filter transactions based on the selected year
        this.calculateTotals(); // Calculate total income and expenses
        this.groupTransactionsByMonth(); // Group transactions by month
      },
      error => {
        console.error('Error fetching transactions:', error); // Log any errors that occur during fetching
      }
    );

    this.subscription.add(transactionSub); // Add the subscription to the main subscription
    this.selectedMonthText = this.getMonthName(this.selectedMonth); // Get the text for the selected month
  }

  /**
   * Groups transactions by month and year.
   */
  groupTransactionsByMonth(): void {
    this.groupedTransactions = this.transactionsList.reduce((groups, transaction) => {
      const date = new Date(transaction.date); // Parse the transaction date
      const monthYear = this.getMonthName(date.getMonth() + 1) + ' ' + date.getFullYear(); // Get month and year

      if (!groups[monthYear]) {
        groups[monthYear] = []; // Initialize the group if it doesn't exist
      }

      groups[monthYear].push(transaction); // Add transaction to the corresponding group
      return groups;
    }, {} as { [key: string]: TransactionEntry[] });
  }

  /**
   * Returns the sorted list of month-year strings.
   * @returns string[] - Array of sorted month-year strings
   */
  getSortedMonths(): string[] {
    return Object.keys(this.groupedTransactions).sort((a, b) => {
      const dateA = this.getDateFromMonthYearString(a);
      const dateB = this.getDateFromMonthYearString(b);
      return dateB.getTime() - dateA.getTime(); // Sort in descending order
    });
  }

  /**
   * Converts a month-year string to a Date object.
   * @param monthYear - The month-year string (e.g., "January 2024")
   * @returns Date - The corresponding Date object
   */
  getDateFromMonthYearString(monthYear: string): Date {
    const [month, year] = monthYear.split(' '); // Split month and year

    // Convert month string to a number (0 for January, 1 for February, etc.)
    const monthIndex = this.getMonthIndex(month);

    return new Date(parseInt(year, 10), monthIndex); // Return the corresponding Date object
  }

  /**
   * Loads month names for display and filtering.
   */
  loadMonths(): void {
    const monthKeys = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    this.translate.get(monthKeys).subscribe(translations => {
      this.months = monthKeys.map(key => translations[key]); // Map keys to their translated names
    });

    // Print the months for debugging purposes
    for (let i = 0; i < this.months.length; i++) {
      console.log(this.months[i]);
    }
  }

  /**
   * Returns the index of the month name in the months array.
   * @param monthName - The name of the month
   * @returns number - The index of the month (0-11)
   */
  getMonthIndex(monthName: string): number {
    // Assuming months are already loaded
    return this.months.indexOf(monthName); // Return the index of the month
  }

  /**
   * Calculates the total income and expenses from filtered transactions.
   */
  calculateTotals() {
    this.totalIncome = this.sumAllIncomes(); // Calculate total income
    this.totalExpenses = this.sumAllExpenses(); // Calculate total expenses
  }

  /**
   * Sums all income amounts from filtered transactions.
   * @returns number - The total income
   */
  sumAllIncomes(): number {
    return this.filteredTransactions
      .filter(transaction => transaction.incomeExpenses === 'income') // Filter for income transactions
      .reduce((total, transaction) => total + transaction.gross, 0); // Sum the gross amounts
  }

  /**
   * Sums all expense amounts from filtered transactions.
   * @returns number - The total expenses
   */
  sumAllExpenses(): number {
    return this.filteredTransactions
      .filter(transaction => transaction.incomeExpenses === 'expense') // Filter for expense transactions
      .reduce((total, transaction) => total + transaction.gross, 0); // Sum the gross amounts
  }

  /**
   * Filters transactions based on the selected year and updates the filtered transactions.
   */
  filterTransactions(): void {
    this.filteredTransactions = this.filterType === 'Year'
      ? this.transactionsList.filter(transaction => this.getYear(transaction.date) === this.selectedYear) // Filter by year
      : this.transactionsList; // If no filter, return all transactions

    this.selectedMonthText = this.getMonthName(this.selectedMonth); // Update the text for the selected month
  }

  /**
   * Returns the year from a given date string.
   * @param date - The date string
   * @returns number - The year as a number
   */
  getYear(date: string): number {
    return new Date(date).getFullYear(); // Return the year from the date
  }

  /**
   * Returns the name of the month based on its index.
   * @param month - The month number (1-12)
   * @returns string - The name of the month
   */
  getMonthName(month: number): string {
    const monthKeys = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return this.translate.instant(monthKeys[month - 1]); // Return the translated month name
  }

  /**
   * Filters transactions by year.
   * @param year - The year to filter by
   */
  filterByYear(year: number) {
    this.selectedYear = year; // Set the selected year
    this.filterType = 'Year'; // Set the filter type
    this.filterTransactions(); // Apply the filter
  }

  /**
   * Deletes a transaction after user confirmation.
   * @param transaction - The transaction to delete
   */
  deleteTransaction(transaction: TransactionEntry) {
    if (confirm(`Are you sure you want to delete transaction ${transaction.documentNumber}?`)) {
      this.transactionService.deleteTransaction(transaction.documentNumber).subscribe(() => {
        this.loadTransactions(); // Reload transactions after deletion
      }, error => {
        console.error('Error deleting transaction:', error); // Log any error during deletion
      });
    }
  }

  /**
   * Opens the transaction dialog for adding or editing a transaction.
   * @param transaction - The transaction to edit (optional)
   */
  openTransactionDialog(transaction?: TransactionEntry): void {
    console.log('openTransactionDialog called');
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '500px',
      data: transaction || {} // Pass the transaction data to the dialog, if available
    });

    const dialogSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTransactions(); // Reload transactions if the dialog returns a result
      }
    });

    this.subscription.add(dialogSub); // Add the dialog subscription to the main subscription
  }
}
