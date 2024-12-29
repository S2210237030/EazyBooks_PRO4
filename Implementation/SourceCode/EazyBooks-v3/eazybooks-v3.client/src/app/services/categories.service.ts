import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth-service.service'; // Path to your AuthService
import firebase from 'firebase/compat/app';

/**
 * CategoriesService manages categories in Firestore, including
 * initializing default categories, adding, deleting, and retrieving categories.
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
          // Check if the collection already contains data
          return this.firestore.collection(this.collectionName).get().pipe(
            switchMap(snapshot => {
              if (snapshot.empty) {
                // If the collection is empty, initialize the categories
                const batch = this.firestore.firestore.batch();
                initialCategories.forEach(category => {
                  const docRef = this.firestore.collection(this.collectionName).doc();
                  batch.set(docRef.ref, category);
                });
                return from(batch.commit());
              } else {
                // If the collection already contains data, do nothing
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
   * Adds a new category to the Firestore collection.
   *
   * @param name - The name of the category to be added.
   * @returns An observable that completes when the category is added.
   */
  addCategory(name: string): Observable<void> {
    const id = this.firestore.createId();
    const category = {
      id: id,
      name: name
    };
    return from(this.firestore.collection(this.collectionName).doc(id).set(category));
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
   * Retrieves all categories from the Firestore collection.
   *
   * @returns An observable that emits an array of category objects.
   */
  getCategories(): Observable<any[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user: firebase.User | null) => {
        if (user) {
          return this.firestore.collection(this.collectionName, ref =>
            ref.orderBy('name', 'asc')
          ).valueChanges();
        } else {
          return new Observable<any[]>(); // Return an empty observable if no user is logged in
        }
      })
    );
  }
}
