import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth-service.service';
import firebase from 'firebase/compat/app';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TransactionEntry } from '../transaction-entry.model';

/**
 * Service for generating and managing reports in the application.
 * It handles fetching transaction data for specified periods,
 * saving reports to Firestore, and managing existing reports.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  /** 
   * Get transactions for a specified period
   * @param {'monthly' | 'yearly'} periodType - The type of the period (monthly or yearly)
   * @param {number} periodValue - The value of the period (month or year)
   * @returns {Observable<TransactionEntry[]>} Observable containing the transactions
   */
  getTransactionsForPeriod(periodType: 'monthly' | 'yearly', periodValue: number): Observable<TransactionEntry[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) {
          let startDate: Date;
          let endDate: Date;

          const currentYear = new Date().getFullYear();

          if (periodType === 'monthly') {
            startDate = new Date(currentYear, periodValue - 1, 1); // month is 0-indexed
            endDate = new Date(currentYear, periodValue, 0); // last day of the month
          } else if (periodType === 'yearly') {
            startDate = new Date(periodValue, 0, 1);
            endDate = new Date(periodValue + 1, 0, 1);
          } else {
            throw new Error('Invalid period type');
          }

          return from(this.firestore.collection<TransactionEntry>('transactions', ref =>
            ref.where('date', '>=', startDate.toISOString())
              .where('date', '<=', endDate.toISOString())
              .orderBy('date')
          ).valueChanges()).pipe(
            catchError(error => {
              console.error('Error fetching transactions:', error);
              throw new Error('Failed to fetch transactions');
            })
          );
        } else {
          throw new Error('No user logged in');
        }
      })
    );
  }

  /** 
   * Save a report to Firestore
   * @param {{ id: string, name: string, blob: Blob }} report - The report object containing id, name, and blob
   * @returns {Promise<void>} A promise indicating the completion of the operation
   */
  saveReport(report: { id: string, name: string, blob: Blob }): Promise<void> {
    const reportRef = this.firestore.collection('reports').doc(report.id);

    return new Promise((resolve, reject) => {
      // Convert Blob to Base64 and save to Firestore
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;

        if (typeof base64data === 'string') {
          // Save the report in the Firestore collection "reports"
          reportRef.set({
            name: report.name,
            data: base64data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
            resolve();
          }).catch((error) => {
            console.error("Error saving report to Firestore:", error);
            reject(error);
          });
        } else {
          reject(new Error('Error converting Blob to base64'));
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading Blob:', error);
        reject(error);
      };

      // Convert Blob to Base64 string
      reader.readAsDataURL(report.blob);
    });
  }

  /** 
   * Retrieve all saved reports
   * @returns {Observable<any>} Observable containing the saved reports
   */
  getReports(): Observable<any> {
    return this.firestore.collection('reports', ref => ref.orderBy('createdAt', 'desc')).snapshotChanges();
  }

  /** 
   * Delete a report by its ID
   * @param {string} reportId - The ID of the report to delete
   * @returns {Promise<void>} A promise indicating the completion of the operation
   */
  deleteReport(reportId: string): Promise<void> {
    return this.firestore.collection('reports').doc(reportId).delete();
  }
}
