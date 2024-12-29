import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetEntry } from '../budget-entry.model';
import { CategoriesService } from '../services/categories.service';

/**
 * `BudgetDialogComponent` is responsible for managing the dialog interface 
 * where users can create or edit a budget entry. 
 * This component is presented as a modal window and interacts with the parent component 
 * to either save or cancel the action. 
 * 
 * The form is initialized with data if a budget entry is being edited, 
 * or it starts with default values for a new entry.
 */
@Component({
  selector: 'app-budget-dialog',
  templateUrl: './budget-dialog.component.html',
  styleUrls: ['./budget-dialog.component.css']
})
export class BudgetDialogComponent implements OnInit {

  /**
   * `budgetForm` holds the form group that manages the budget entry fields.
   * It is initialized with default values or with data passed through the dialog.
   */
  budgetForm: FormGroup;

  /**
   * List of available categories, which will be loaded from a service.
   * Used to populate the category dropdown in the form.
   */
  categories: any[] = [];

  /**
   * List of budget types available for selection. This defines whether the budget 
   * entry is for "saving" or "spending".
   */
  budgetTypes = [
    { value: 'saving', label: 'Saving' },
    { value: 'spending', label: 'Spending' }
  ];

  /**
   * Constructor initializes the component and sets up the form with initial values.
   * 
   * @param fb - FormBuilder service used to create the reactive form.
   * @param dialogRef - Reference to the dialog window, allowing for close and save actions.
   * @param data - The budget entry data passed into the dialog for editing, if available.
   * @param categoriesService - Service to load available categories for the budget.
   */
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BudgetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BudgetEntry,
    private categoriesService: CategoriesService
  ) {
    // Initialize the form with existing budget data or default values
    this.budgetForm = this.fb.group({
      id: [data.id || ''],
      title: [data.title || '', Validators.required], // Title is required
      amount: [data.amount || 0, [Validators.required, Validators.min(0)]], // Amount must be positive
      spent: [data.spent || 0, [Validators.required, Validators.min(0)]], // Spent must be positive
      goalDate: [data.goalDate || new Date().toISOString(), Validators.required], // Goal date is required
      goalDateInMillis: [data.goalDateInMillis || new Date().getTime()], // Goal date in milliseconds
      category: [data.category || '', Validators.required], // Category is required
      status: [data.status || 'active', Validators.required], // Status is required
      type: [data.type || 'saving', Validators.required], // Budget type is required (saving or spending)
      createdAt: [data.createdAt || new Date().toISOString()], // Auto-generated creation timestamp
      createdAtInMillis: [data.createdAtInMillis || new Date().getTime()], // Timestamp in milliseconds
      updatedAt: [data.updatedAt || new Date().toISOString()], // Auto-generated updated timestamp
      updatedAtInMillis: [data.updatedAtInMillis || new Date().getTime()] // Updated timestamp in milliseconds
    });
  }

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * This method loads the available categories from the `CategoriesService` 
   * when the dialog is opened.
   */
  ngOnInit(): void {
    this.loadCategories(); // Load categories for the dropdown
  }

  /**
   * Dynamically changes the label for the "spent" field depending on the type of budget.
   * If it's a "spending" budget, the label will be "SPENT", otherwise "SAVED".
   * 
   * @returns A string representing the label for the spent field.
   */
  get spentLabel(): string {
    return this.budgetForm.get('type')?.value === 'spending' ? 'SPENT' : 'SAVED';
  }

  /**
   * Loads the list of available categories by subscribing to the `CategoriesService`.
   * This populates the category dropdown for the user to choose from.
   */
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe((categories: any[]) => {
      this.categories = categories; // Set categories after loading from service
    });
  }

  /**
   * Called when the user submits the form. 
   * If the form is valid, the dialog is closed, returning the form data.
   */
  onSave(): void {
    if (this.budgetForm.valid) {
      this.dialogRef.close(this.budgetForm.value); // Return form data and close dialog
    }
  }

  /**
   * Called when the user cancels the dialog.
   * It closes the dialog without saving any changes.
   */
  onCancel(): void {
    this.dialogRef.close(); // Close the dialog without saving
  }
}
