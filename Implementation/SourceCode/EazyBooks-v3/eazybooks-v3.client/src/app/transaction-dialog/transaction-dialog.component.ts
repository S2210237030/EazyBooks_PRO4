import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionEntry } from '../transaction-entry.model';
import { TransactionServiceComponent } from '../transaction-service/transaction-service.component';
import { CategoriesService } from '../services/categories.service';

/**
 * TransactionDialogComponent handles the dialog for adding or updating a transaction.
 * It allows users to enter transaction details and select categories.
 */
@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.css']
})
export class TransactionDialogComponent implements OnInit {

  transaction: TransactionEntry = new TransactionEntry('', '', 0, 0, '', '', '', 0); // Initialize with default values
  categories: any[] = []; // List of categories for the transaction
  imageName: string = ''; // Store the name of the uploaded image file

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>, // Reference to the dialog
    @Inject(MAT_DIALOG_DATA) public data: any, // Injected data passed to the dialog
    private transactionService: TransactionServiceComponent, // Service for transaction operations
    private categoriesService: CategoriesService // Service for category operations
  ) {
    this.transaction = data || new TransactionEntry('', '', 0, 0, '', '', '', Date.now()); // Initialize transaction from data or with default values
  }

  ngOnInit(): void {
    this.loadCategories(); // Load categories on component initialization
  }

  /**
   * Loads categories from the CategoriesService and stores them in the component.
   */
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe((categories: any[]) => {
      this.categories = categories; // Assign loaded categories to the component's categories property
    });
  }

  /**
   * Closes the transaction dialog.
   */
  closeDialog(): void {
    this.dialogRef.close(); // Close the dialog without returning any data
  }

  /**
   * Adds or updates the transaction based on whether it has a document number.
   * Validates required fields before proceeding.
   */
  addTransaction(): void {
    if (!this.transaction.date || !this.transaction.gross || !this.transaction.description || !this.transaction.incomeExpenses) {
      console.error('All fields are required'); // Log an error if required fields are missing
      return;
    }

    this.calculateNetAmount(); // Calculate net amount based on gross value

    if (this.transaction.documentNumber) {
      // Update the existing transaction
      this.transactionService.updateTransaction(this.transaction).subscribe(
        () => {
          console.log('Transaction updated successfully'); // Log success message
          this.dialogRef.close(this.transaction); // Close the dialog and return the updated transaction
        },
        error => {
          console.error('Error updating transaction:', error); // Log any error that occurs during update
        }
      );
    } else {
      // Add a new transaction
      this.transactionService.addTransaction(this.transaction).subscribe({
        next: () => {
          console.log('Transaction added successfully'); // Log success message
          this.dialogRef.close(this.transaction); // Close the dialog and return the new transaction
        },
        error: (err) => {
          console.error('Error adding transaction:', err); // Log any error that occurs during addition
        }
      });
    }
  }

  /**
   * Handles file input changes to read the selected file and set the transaction document name.
   * @param event - The file input change event
   */
  onFileChange(event: any): void {
    const file = event.target.files[0]; // Get the first selected file
    if (file) {
      const reader = new FileReader(); // Create a FileReader to read the file
      reader.onload = (e: any) => {
        this.transaction.documentName = e.target.result; // Set the document name to the file's data URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
      this.imageName = file.name; // Store the name of the uploaded image
    }
  }

  /**
   * Calculates the net amount based on the gross amount and whether the transaction is an expense or income.
   */
  calculateNetAmount(): void {
    if (this.transaction.incomeExpenses === 'expense') {
      this.transaction.net = this.transaction.gross / 1.2; // Calculate net for expenses
    } else {
      this.transaction.net = this.transaction.gross; // Net is the same as gross for income
    }
  }
}
