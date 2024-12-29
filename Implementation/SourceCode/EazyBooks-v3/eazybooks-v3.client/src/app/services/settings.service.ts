import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth-service.service';

/**
 * Service for managing user settings in the application.
 * It allows retrieval and updating of user-specific settings
 * such as general preferences, password, app theme, and language.
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsCollection = 'settings';

  constructor(private firestore: AngularFirestore,
    private authService: AuthService) { }

  /** 
   * Retrieve general settings
   * @returns {Observable<any>} Observable containing the settings
   */
  getSettings(): Observable<any> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => this.firestore.collection(this.settingsCollection).doc(userId).valueChanges())
    );
  }

  /** 
   * Save general settings
   * @param {any} settings - The settings to save
   * @returns {Observable<void>} Observable indicating completion
   */
  saveSettings(settings: any): Observable<void> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        const settingsToSave = { ...settings };
        if (!settingsToSave.password) {
          delete settingsToSave.password; // Remove the password if it's not set
        }
        return from(this.firestore.collection(this.settingsCollection).doc(userId).set(settingsToSave, { merge: true }));
      })
    );
  }

  /** 
   * Update the password
   * @param {string} newPassword - The new password
   * @returns {Observable<void>} Observable indicating completion
   */
  updatePassword(newPassword: string): Observable<void> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        // Update the password in authentication and in the Firestore database
        return from(this.authService.updatePassword(newPassword)).pipe(
          switchMap(() => {
            // Update the password in the user database
            return from(this.firestore.collection(this.settingsCollection).doc(userId).update({ password: newPassword }));
          })
        );
      })
    );
  }

  /** 
   * Update the application theme
   * @param {string} theme - The new theme
   * @returns {Observable<void>} Observable indicating completion
   */
  updateAppTheme(theme: string): Observable<void> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        return from(this.firestore.collection(this.settingsCollection).doc(userId).update({ theme }));
      })
    );
  }

  /** 
   * Update the language
   * @param {string} language - The new language
   * @returns {Observable<void>} Observable indicating completion
   */
  updateLanguage(language: string): Observable<void> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        return from(this.firestore.collection(this.settingsCollection).doc(userId).update({ language }));
      })
    );
  }
}
