import { Injectable } from '@angular/core';
import { throwError, Observable, from } from 'rxjs';
import { TransactionEntry } from '../transaction-entry.model';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

interface IncomeData {
  totalIncome: number;
}

interface ExpensesData {
  totalExpenses: number;
}

interface ChartData {
  chartData: number[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionServiceComponent {
  private countNumber = 1; // Counter for document numbers

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  /**
   * Adds a new transaction to the Firestore database.
   * @param transaction - The transaction data to be added.
   * @returns An observable that completes when the transaction is added.
   */
  addTransaction(transaction: TransactionEntry): Observable<void> {
    // Count existing transactions to set documentNumber
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          // Count transactions
          return from(this.firestore.collection('transactions').get()).pipe(
            map(querySnapshot => {
              // Set documentNumber based on existing transactions count
              const documentNumber = querySnapshot.size + 1;
              transaction.documentNumber = documentNumber.toString();
              return transaction;
            }),
            switchMap(updatedTransaction => {
              // Ensure dateInMillis is set
              if (!updatedTransaction.dateInMillis) {
                updatedTransaction.dateInMillis = new Date(updatedTransaction.date).getTime();
              }

              // Check for required fields
              if (!updatedTransaction.date || updatedTransaction.gross == null || updatedTransaction.net == null || !updatedTransaction.description || !updatedTransaction.incomeExpenses) {
                return new Observable<void>(observer => {
                  observer.error(new Error('Transaction has undefined or null fields'));
                });
              }

              // Prepare transaction data for Firestore
              const transactionData = {
                documentNumber: updatedTransaction.documentNumber,
                date: new Date(updatedTransaction.date).toISOString(),
                gross: updatedTransaction.gross,
                net: updatedTransaction.net,
                description: updatedTransaction.description,
                category: updatedTransaction.category,
                incomeExpenses: updatedTransaction.incomeExpenses,
                dateInMillis: updatedTransaction.dateInMillis,
                documentName: updatedTransaction.documentName || '' // Ensure documentName is never undefined
              };

              // Log transaction data for debugging
              console.log('Transaction Data:', transactionData);

              // Save transaction to Firestore
              return from(this.firestore.collection('transactions').doc(updatedTransaction.documentNumber).set(transactionData)).pipe(
                tap(() => console.log('Transaction successfully saved:', transactionData)),
                catchError(error => {
                  console.error('Error saving transaction:', error);
                  return throwError(() => new Error('Failed to save transaction in Firestore'));
                })
              );
            }),
            catchError(error => {
              console.error('Error counting transactions:', error);
              return throwError(() => new Error('Failed to count transactions'));
            })
          );
        } else {
          console.error('No user logged in to save transaction');
          return throwError(() => new Error('No user logged in'));
        }
      }),
      catchError(error => {
        console.error('Error during transaction process:', error);
        return throwError(() => new Error(error));
      })
    );
  }

  /**
   * Deletes a transaction from the Firestore database by its document number.
   * @param documentNumber - The document number of the transaction to delete.
   * @returns An observable that completes when the transaction is deleted.
   */
  deleteTransaction(documentNumber: string): Observable<void> {
    return from(this.firestore.collection('transactions').doc(documentNumber).delete()).pipe(
      tap(() => console.log(`Transaction ${documentNumber} deleted successfully`)),
      catchError(error => {
        console.error('Error deleting transaction:', error);
        return throwError(() => new Error('Failed to delete transaction'));
      })
    );
  }

  /**
   * Retrieves all transactions for the current user from Firestore.
   * @returns An observable containing an array of TransactionEntry objects.
   */
  getTransactions(): Observable<TransactionEntry[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user: firebase.User | null) => {
        if (user) {
          return this.firestore.collection<TransactionEntry>('transactions', ref =>
            ref.orderBy('dateInMillis', 'desc') // Order by date descending
          ).valueChanges();
        } else {
          return new Observable<TransactionEntry[]>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }

  /**
   * Calculates the total income for a given year.
   * @param year - The year to calculate total income for.
   * @returns An observable that emits the total income formatted as a string.
   */
  getTotalIncome(year: number): Observable<string> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          return from(this.firestore.collection('transactions', ref =>
            ref.where('incomeExpenses', '==', 'income') // Filter for income transactions
              .where('date', '>=', new Date(year, 0, 1).toISOString()) // Filter for the year
              .where('date', '<=', new Date(year + 1, 0, 1).toISOString())
              .orderBy('date') // Optional: order by date
          ).get()).pipe(
            map(querySnapshot => {
              let totalIncome = 0;
              querySnapshot.forEach(doc => {
                const data = doc.data() as TransactionEntry;
                if (data && typeof data.gross === 'number') {
                  totalIncome += data.gross; // Sum up gross income
                }
              });
              console.log('Calculated Total Income:', totalIncome);
              return this.formatAmount(totalIncome); // Format total income
            }),
            catchError(error => {
              console.error('Error fetching total income:', error);
              return throwError(() => new Error('Failed to fetch total income'));
            })
          );
        } else {
          return new Observable<string>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }

  /**
   * Calculates the total expenses for a given year.
   * @param year - The year to calculate total expenses for.
   * @returns An observable that emits the total expenses formatted as a string.
   */
  getTotalExpenses(year: number): Observable<string> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          return from(this.firestore.collection('transactions', ref =>
            ref.where('incomeExpenses', '==', 'expense') // Filter for expense transactions
              .where('date', '>=', new Date(year, 0, 1).toISOString()) // Filter for the year
              .where('date', '<=', new Date(year + 1, 0, 1).toISOString())
              .orderBy('date') // Optional: order by date
          ).get()).pipe(
            map(querySnapshot => {
              let totalExpenses = 0;
              querySnapshot.forEach(doc => {
                const data = doc.data() as TransactionEntry;
                if (data && typeof data.gross === 'number') {
                  totalExpenses += data.gross; // Sum up gross expenses
                }
              });
              console.log('Calculated Total Expenses:', totalExpenses);
              return this.formatAmount(totalExpenses); // Format total expenses
            }),
            catchError(error => {
              console.error('Error fetching total expenses:', error);
              return throwError(() => new Error('Failed to fetch total expenses'));
            })
          );
        } else {
          return new Observable<string>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }

  /**
   * Retrieves chart data for a given year, including monthly income and expenses.
   * @param year - The year for which to fetch chart data.
   * @returns An observable that emits an object containing months, income, and expenses arrays.
   */
  getChartData(year: number): Observable<{ months: string[], income: number[], expenses: number[] }> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          const startOfYear = new Date(year, 0, 1).toISOString();
          const endOfYear = new Date(year + 1, 0, 1).toISOString();

          return this.firestore.collection('transactions', ref =>
            ref.where('date', '>=', startOfYear)
              .where('date', '<=', endOfYear)
          ).get().pipe(
            map(querySnapshot => {
              // Debugging: Log the number of documents fetched
              console.log('Fetched documents:', querySnapshot.size);

              const months = Array(12).fill(0).map((_, i) => new Date(year, i, 1).toLocaleString('de-DE', { month: 'short' }));
              const incomeData = Array(12).fill(0);
              const expensesData = Array(12).fill(0);

              querySnapshot.forEach(doc => {
                const data = doc.data() as TransactionEntry;
                console.log('Document data:', data); // Debugging: Log document data

                const month = new Date(data.date).getMonth(); // Extract month from date

                if (data.incomeExpenses === 'income') {
                  incomeData[month] += data.gross; // Accumulate income
                } else {
                  expensesData[month] += data.gross; // Accumulate expenses
                }
              });

              return { months, income: incomeData, expenses: expensesData };
            }),
            catchError(error => {
              console.error('Error fetching chart data:', error);
              return throwError(() => new Error('Failed to fetch chart data'));
            })
          );
        } else {
          return throwError(() => new Error('No user logged in'));
        }
      })
    );
  }

  /**
   * Formats a given amount to a localized string with two decimal places.
   * @param amount - The amount to format.
   * @returns The formatted amount as a string.
   */
  private formatAmount(amount: number): string {
    if (isNaN(amount)) return '0';
    return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Retrieves transactions that occurred between two specified dates.
   * @param startDate - The starting date for the transaction range.
   * @param endDate - The ending date for the transaction range.
   * @returns An observable containing an array of TransactionEntry objects.
   */
  getTransactionsBetweenDates(startDate: Date, endDate: Date): Observable<TransactionEntry[]> {
    // Convert dates to ISO string format
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          return from(this.firestore.collection<TransactionEntry>('transactions', ref =>
            ref.where('date', '>=', startIso) // Start date
              .where('date', '<=', endIso)   // End date
              .orderBy('date')               // Optional: order by date
          ).get()).pipe(
            map(querySnapshot => {
              // Map results to an array of transactions
              return querySnapshot.docs.map(doc => doc.data() as TransactionEntry);
            }),
            catchError(error => {
              console.error('Error fetching transactions between dates:', error);
              return throwError(() => new Error('Failed to fetch transactions'));
            })
          );
        } else {
          return throwError(() => new Error('No user logged in'));
        }
      })
    );
  }

  /**
   * Updates an existing transaction in the Firestore database.
   * @param transaction - The transaction data with updated fields.
   * @returns An observable that completes when the transaction is updated.
   */
  updateTransaction(transaction: TransactionEntry): Observable<void> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          // Ensure all required fields are set
          if (!transaction.date || transaction.gross == null || transaction.net == null || !transaction.description || !transaction.incomeExpenses) {
            return throwError(() => new Error('Transaction has undefined or null fields'));
          }

          const transactionData = {
            date: new Date(transaction.date).toISOString(),
            gross: transaction.gross,
            net: transaction.net,
            description: transaction.description,
            category: transaction.category,
            incomeExpenses: transaction.incomeExpenses,
            dateInMillis: transaction.dateInMillis || new Date(transaction.date).getTime(),
            documentName: transaction.documentName || '' // Ensure documentName is never undefined
          };

          return from(this.firestore.collection('transactions').doc(transaction.documentNumber).update(transactionData)).pipe(
            tap(() => console.log('Transaction successfully updated:', transactionData)),
            catchError(error => {
              console.error('Error updating transaction:', error);
              return throwError(() => new Error('Failed to update transaction in Firestore'));
            })
          );
        } else {
          return throwError(() => new Error('No user logged in'));
        }
      }),
      catchError(error => {
        console.error('Error during transaction update process:', error);
        return throwError(() => new Error(error));
      })
    );
  }
}
