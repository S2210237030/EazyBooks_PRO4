import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth-service.service';
import firebase from 'firebase/compat/app';
import { BudgetEntry } from '../budget-entry.model';

/**
 * BudgetService manages budget entries in Firestore, allowing
 * for the addition, update, deletion, and retrieval of budgets.
 */
@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  /**
   * Adds a new budget entry to the Firestore collection.
   *
   * @param budget - The budget entry to be added.
   * @returns An observable that completes when the budget is added.
   */
  addBudget(budget: BudgetEntry): Observable<void> {
    const id = this.firestore.createId();
    budget.id = id;
    return from(this.firestore.collection('budgets').doc(id).set({
      ...budget,
      goalDate: new Date(budget.goalDate).toISOString(),
      createdAt: new Date(budget.createdAt).toISOString(),
      updatedAt: new Date(budget.updatedAt).toISOString(),
      goalDateInMillis: new Date(budget.goalDate).getTime(),
      createdAtInMillis: new Date(budget.createdAt).getTime(),
      updatedAtInMillis: new Date(budget.updatedAt).getTime()
    }));
  }

  /**
   * Updates an existing budget entry in the Firestore collection.
   *
   * @param id - The ID of the budget to be updated.
   * @param budget - The updated budget entry data.
   * @returns An observable that completes when the budget is updated.
   */
  updateBudget(id: string, budget: BudgetEntry): Observable<void> {
    return from(this.firestore.collection('budgets').doc(id).update({
      ...budget,
      goalDate: new Date(budget.goalDate).toISOString(),
      createdAt: new Date(budget.createdAt).toISOString(),
      updatedAt: new Date(budget.updatedAt).toISOString(),
      goalDateInMillis: new Date(budget.goalDate).getTime(),
      createdAtInMillis: new Date(budget.createdAt).getTime(),
      updatedAtInMillis: new Date(budget.updatedAt).getTime()
    }));
  }

  /**
   * Deletes a budget entry from the Firestore collection.
   *
   * @param id - The ID of the budget to be deleted.
   * @returns An observable that completes when the budget is deleted.
   */
  deleteBudget(id: string): Observable<void> {
    return from(this.firestore.collection('budgets').doc(id).delete());
  }

  /**
   * Retrieves all budget entries for the current user from Firestore.
   *
   * @returns An observable that emits an array of BudgetEntry objects.
   */
  getBudgets(): Observable<BudgetEntry[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user: firebase.User | null) => {
        if (user) {
          return this.firestore.collection<BudgetEntry>('budgets', ref =>
            ref.orderBy('goalDateInMillis', 'desc')
          ).valueChanges();
        } else {
          return new Observable<BudgetEntry[]>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }
}
