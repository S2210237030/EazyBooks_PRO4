import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * YearDialogComponent allows the user to select a year
 * within a dialog interface. It ensures that the selected 
 * year does not exceed the current year and provides methods
 * to validate and close the dialog.
 */
@Component({
  selector: 'app-year-dialog',
  templateUrl: './year-dialog.component.html',
  styleUrls: ['./year-dialog.component.css']
})
export class YearDialogComponent implements OnInit {

  selectedYear: number; // The year selected by the user
  maxYear: number = new Date().getFullYear(); // The maximum year allowed, defaults to the current year

  constructor(
    public dialogRef: MatDialogRef<YearDialogComponent>, // Reference to the dialog instance
    @Inject(MAT_DIALOG_DATA) public data: any // Injected data passed to the dialog
  ) {
    // Initialize selectedYear with the value from the injected data
    this.selectedYear = data.selectedYear;
  }

  ngOnInit(): void {
    // Log the maximum year to the console for debugging
    console.log("maxYear " + this.maxYear);
  }

  /**
   * Closes the dialog without returning any data.
   */
  closeDialog(): void {
    this.dialogRef.close(); // Close the dialog
  }

  /**
   * Validates the selected year and adjusts it if it exceeds the maximum year.
   */
  validateYear(): void {
    if (this.selectedYear > this.maxYear) {
      this.selectedYear = this.maxYear; // Reset the selected year to the maximum allowed
    }
  }
}
