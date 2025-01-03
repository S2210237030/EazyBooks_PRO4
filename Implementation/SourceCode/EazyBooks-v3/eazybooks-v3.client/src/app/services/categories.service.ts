import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth-service.service'; // Path to your AuthService
import firebase from 'firebase/compat/app';

/**
 * CategoriesService manages categories in Firestore, including
 * initializing default categories, adding, deleting, and retrieving categories.
 * Now, categories include the userId to associate with the current user.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private collectionName = 'categories';

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.initializeCategories();
  }

  /**
   * Initializes default categories if none exist in the Firestore collection.
   * This method is called in the constructor.
   */
  private initializeCategories() {
    const initialCategories = [
      { name: 'Income' },
      { name: 'Groceries' },
      { name: 'Rent' },
      { name: 'Transport' },
      { name: 'Entertainment' },
      { name: 'Health' },
      { name: 'Miscellaneous' }
    ];

    from(this.authService.getCurrentUser()).pipe(
      switchMap((user: firebase.User | null) => {
        if (user) {
          // Get user ID
          const userId = user.uid;
          // Check if the collection already contains data for this user
          return this.firestore.collection(this.collectionName, ref =>
            ref.where('userId', '==', userId)
          ).get().pipe(
            switchMap(snapshot => {
              if (snapshot.empty) {
                // If the collection is empty for this user, initialize the categories
                const batch = this.firestore.firestore.batch();
                initialCategories.forEach(category => {
                  const docRef = this.firestore.collection(this.collectionName).doc();
                  batch.set(docRef.ref, { ...category, userId: userId });
                });
                return from(batch.commit());
              } else {
                // If the collection already contains data for this user, do nothing
                return new Observable<void>();
              }
            })
          );
        } else {
          return new Observable<void>(); // Return an empty observable if no user is logged in
        }
      })
    ).subscribe();
  }

  /**
   * Adds a new category to the Firestore collection, including userId.
   *
   * @param name - The name of the category to be added.
   * @param repeatInterval - The repeat interval (e.g. 'monthly', 'yearly') for recurring transactions.
   * @returns An observable that completes when the category is added.
   */
  addCategory(name: string): Observable<void> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user: firebase.User | null) => {
        if (user) {
          const id = this.firestore.createId();
          const category = {
            id: id,
            name: name,
            userId: user.uid // Store the userId in the category
          };

          console.log('Adding category for user ID:', user.uid);  // Loggen der userId in der Konsole

          return from(this.firestore.collection(this.collectionName).doc(id).set(category));
        } else {
          console.log('User not authenticated');
          return new Observable<void>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }

  /**
   * Deletes a category from the Firestore collection.
   *
   * @param id - The ID of the category to be deleted.
   * @returns An observable that completes when the category is deleted.
   */
  deleteCategory(id: string): Observable<void> {
    return from(this.firestore.collection(this.collectionName).doc(id).delete());
  }

  /**
   * Retrieves all categories from the Firestore collection for the current user.
   *
   * @returns An observable that emits an array of category objects.
   */
  getCategories(): Observable<any[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user: firebase.User | null) => {
        if (user) {
          return this.firestore.collection(this.collectionName, ref =>
            ref.where('userId', '==', user.uid).orderBy('name', 'asc')
          ).valueChanges();
        } else {
          return new Observable<any[]>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }

  /**
   * Retrieves a category by its ID from Firestore.
   *
   * @param id - The ID of the category to retrieve.
   * @returns An observable that emits the category object.
   */
  getCategoryById(id: string): Observable<any> {
    return this.firestore.collection(this.collectionName).doc(id).valueChanges();
  }
}
