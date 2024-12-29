import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import firebase from 'firebase/compat/app'; // Consistent imports
import { User } from 'firebase/auth';
import { switchMap } from 'rxjs/operators';

/**
 * AuthService handles user authentication, including sign-in,
 * sign-up, and managing user sessions with Firebase Authentication.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStatus = new BehaviorSubject<boolean>(false);
  user$: Observable<User | null>; // Observable for the logged-in user

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.user$ = this.afAuth.authState as Observable<User | null>;
    this.afAuth.authState.subscribe(user => {
      this.authStatus.next(!!user);
    });
  }

  /**
   * Signs in a user with email and password.
   *
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves with the user credential.
   */
  signIn(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Registers a new user with email and password.
   *
   * @param email - The email of the new user.
   * @param password - The password for the new user.
   * @returns A promise that resolves with the user credential.
   */
  signUp(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  /**
   * Signs out the currently logged-in user.
   *
   * @returns A promise that resolves when the user is signed out.
   */
  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  /**
   * Checks if a user is logged in.
   *
   * @returns An observable that emits the authentication status.
   */
  isUserLoggedIn(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  /**
   * Retrieves the currently logged-in user.
   *
   * @returns A promise that resolves with the current user or null.
   */
  getCurrentUser(): Promise<firebase.User | null> {
    return this.afAuth.currentUser;
  }

  /**
   * Logs out the current user and updates the authentication status.
   *
   * @returns A promise that resolves when the user is logged out.
   */
  logout(): Promise<void> {
    this.authStatus.next(false);
    return this.afAuth.signOut();
  }

  /**
   * Retrieves the current user's ID.
   *
   * @returns An observable that emits the user's ID or an empty string.
   */
  getCurrentUserId(): Observable<string> {
    return this.afAuth.authState.pipe(
      switchMap(user => user ? of(user.uid) : of(''))
    );
  }

  /**
   * Updates the password for the currently logged-in user.
   *
   * @param newPassword - The new password for the user.
   * @returns A promise that resolves when the password is updated.
   */
  updatePassword(newPassword: string): Promise<void> {
    return this.afAuth.currentUser.then(user => {
      if (user) {
        return user.updatePassword(newPassword);
      } else {
        return Promise.reject('No user logged in');
      }
    });
  }

  /**
   * Updates the email for the currently logged-in user.
   *
   * @param newEmail - The new email for the user.
   * @returns A promise that resolves when the email is updated.
   */
  updateEmail(newEmail: string): Promise<void> {
    return this.afAuth.currentUser.then(user => {
      if (user) {
        return user.updateEmail(newEmail);
      } else {
        return Promise.reject('No user logged in');
      }
    });
  }
}
