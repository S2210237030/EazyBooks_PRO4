import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BudgetEntry } from '../budget-entry.model';
import { BudgetDialogComponent } from '../budget-dialog/budget-dialog.component';
import { BudgetService } from '../services/budget.service';

/**
 * The `BudgetComponent` class is responsible for managing the user interface and interactions 
 * related to budget entries, such as creating, editing, deleting, and displaying budgets. 
 * It uses Angular Material components like `MatPaginator` for pagination and `MatSort` for sorting. 
 * 
 * This component works in conjunction with `BudgetService` to fetch and manipulate budget data 
 * from an external data source, and with `BudgetDialogComponent` for handling user inputs 
 * via a dialog for budget creation or editing.
 */
@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {

  /**
   * Columns displayed in the table.
   */
  displayedColumns: string[] = ['title', 'amount', 'spent', 'goalDate', 'status', 'actions'];

  /**
   * Arrays to hold saving and spending budget entries.
   */
  savingBudgets: BudgetEntry[] = [];
  spendingBudgets: BudgetEntry[] = [];

  /**
   * Default budget entry template.
   */
  budget: BudgetEntry = {
    title: '',
    amount: 0,
    spent: 0,
    goalDate: new Date().toISOString(), // ISO-String
    goalDateInMillis: new Date().getTime(),
    category: '',
    createdAt: new Date().toISOString(), // ISO-String
    createdAtInMillis: new Date().getTime(),
    updatedAt: new Date().toISOString(), // ISO-String
    updatedAtInMillis: new Date().getTime(),
    status: 'aktiv',
    type: 'saving' // Standardtyp für neues Budget
  };

  /**
   * Paginator and Sort components from Angular Material.
   */
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  /**
   * Constructor that injects the budget service and dialog component.
   * 
   * @param budgetService - Service for managing budget data.
   * @param dialog - MatDialog for handling dialog windows.
   */
  constructor(private budgetService: BudgetService, public dialog: MatDialog) { }

  /**
   * Lifecycle hook that is called when the component is initialized.
   * It loads the budgets when the component is created.
   */
  ngOnInit(): void {
    this.loadBudgets();
  }

  /**
   * Lifecycle hook that is called after the view is initialized.
   * It subscribes to paginator and sort changes to apply pagination and sorting dynamically.
   */
  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe(() => this.applyPagination());
    }
    if (this.sort) {
      this.sort.sortChange.subscribe(() => this.applySorting());
    }
  }

  /**
   * Save the current budget entry if it's valid.
   * If the budget is successfully saved, it resets the budget form and reloads the budgets.
   */
  saveBudget(): void {
    if (this.isValidBudget(this.budget)) {
      this.budgetService.addBudget(this.budget).subscribe({
        next: () => {
          console.log('Budget saved successfully');
          this.resetBudget();
          this.loadBudgets();
        },
        error: (error) => {
          console.error('Error saving budget:', error);
        }
      });
    } else {
      console.error('Invalid budget data');
    }
  }

  /**
   * Validate the budget entry (basic checks for non-empty fields).
   * 
   * @param budget - The budget entry to validate.
   * @returns A boolean indicating whether the budget entry is valid.
   */
  private isValidBudget(budget: BudgetEntry): boolean {
    return budget.title !== '' && budget.amount > 0 && budget.goalDate != null && budget.category !== '';
  }

  /**
   * Reset the budget form to default values.
   */
  private resetBudget(): void {
    this.budget = {
      title: '',
      amount: 0,
      spent: 0,
      goalDate: new Date().toISOString(),
      goalDateInMillis: new Date().getTime(),
      category: '',
      createdAt: new Date().toISOString(),
      createdAtInMillis: new Date().getTime(),
      updatedAt: new Date().toISOString(),
      updatedAtInMillis: new Date().getTime(),
      status: 'aktiv',
      type: 'saving'
    };
  }

  /**
   * Load all budgets from the service and split them into saving and spending categories.
   */
  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe(budgets => {
      this.splitBudgets(budgets || []);
    });
  }

  /**
   * Split budgets into saving and spending categories, then apply pagination and sorting.
   * 
   * @param budgets - The array of budget entries to split.
   */
  private splitBudgets(budgets: BudgetEntry[]): void {
    this.savingBudgets = budgets.filter(budget => budget.type === 'saving');
    this.spendingBudgets = budgets.filter(budget => budget.type === 'spending');
    this.applyPagination(); // Apply pagination after updating the data
    this.applySorting(); // Apply sorting after updating the data
  }

  /**
   * Apply pagination logic to budgets based on the current paginator state.
   */
  private applyPagination(): void {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.savingBudgets = this.savingBudgets.slice(startIndex, startIndex + this.paginator.pageSize);
      this.spendingBudgets = this.spendingBudgets.slice(startIndex, startIndex + this.paginator.pageSize);
    }
  }

  /**
   * Apply sorting logic to budgets based on the selected column and sort direction.
   */
  private applySorting(): void {
    if (this.sort) {
      const data = [...this.savingBudgets, ...this.spendingBudgets];
      data.sort((a, b) => {
        const isAsc = this.sort?.direction === 'asc';
        switch (this.sort?.active) {
          case 'title': return compare(a.title, b.title, isAsc);
          case 'amount': return compare(a.amount, b.amount, isAsc);
          case 'spent': return compare(a.spent, b.spent, isAsc);
          case 'goalDate': return compare(a.goalDate, b.goalDate, isAsc);
          case 'status': return compare(a.status, b.status, isAsc);
          default: return 0;
        }
      });
      this.savingBudgets = data.filter(budget => budget.type === 'saving');
      this.spendingBudgets = data.filter(budget => budget.type === 'spending');
    }
  }

  /**
   * Open the dialog for creating or editing a budget.
   * If a budget is passed, it will be loaded into the dialog for editing.
   * 
   * @param budget - Optional budget entry to edit.
   */
  openBudgetDialog(budget?: BudgetEntry): void {
    const dialogRef = this.dialog.open(BudgetDialogComponent, {
      width: '400px',
      data: budget || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // If result has an ID, update the existing budget
          this.budgetService.updateBudget(result.id, result).subscribe({
            next: () => {
              console.log('Budget updated successfully');
              this.loadBudgets();
            },
            error: (error: any) => {
              console.error('Error updating budget:', error);
            }
          });
        } else {
          // If no ID, create a new budget entry
          this.budgetService.addBudget(result).subscribe({
            next: () => {
              console.log('Budget added successfully');
              this.loadBudgets();
            },
            error: (error) => {
              console.error('Error adding budget:', error);
            }
          });
        }
      }
    });
  }

  /**
   * Opens the dialog for editing a specific budget entry.
   * 
   * @param budget - The budget entry to edit.
   */
  edit(budget: BudgetEntry): void {
    this.openBudgetDialog(budget);
  }

  /**
   * Delete a specific budget entry after user confirmation.
   * 
   * @param budget - The budget entry to delete.
   */
  delete(budget: BudgetEntry): void {
    const id = budget.id;

    if (id) {
      if (confirm(`Are you sure you want to delete the budget entry titled "${budget.title}"?`)) {
        this.budgetService.deleteBudget(id).subscribe({
          next: () => {
            this.loadBudgets();
          },
          error: (error) => {
            console.error('Error deleting budget:', error);
          }
        });
      }
    } else {
      console.error('Budget ID is undefined');
    }
  }
}

/**
 * Helper function to compare values for sorting.
 * 
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @param isAsc - Indicates if the sorting is ascending.
 * @returns A number indicating the sort order.
 */
function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
