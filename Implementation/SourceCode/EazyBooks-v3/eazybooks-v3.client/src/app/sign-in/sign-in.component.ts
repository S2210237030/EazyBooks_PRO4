import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * SignInComponent handles the user sign-in process, including
 * form submission and navigation to the main application.
 */
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  email: string = ''; // User's email input
  password: string = ''; // User's password input

  constructor(
    private snackBar: MatSnackBar, // Snackbar for displaying messages
    private router: Router, // Router for navigation
    private authService: AuthService, // AuthService for authentication methods
    private translate: TranslateService // TranslateService for language support
  ) { }

  /**
   * Signs the user in using the provided email and password.
   * Displays a success message on successful sign-in and
   * navigates to the main application route.
   * Handles errors by displaying a snackbar with the error message.
   */
  signIn() {
    this.authService.signIn(this.email, this.password)
      .then(async (userCredential) => {
        try {
          // Token nach der Anmeldung abrufen
          const token = await userCredential!.user?.getIdToken();  // Warten auf das Token

          if (token) {
            // Token in einem HttpOnly-Cookie speichern
            this.authService.setTokenInHttpOnlyCookie(token);
            this.snackBar.open('Sign-in successful!', 'Close', { duration: 3000 });
            this.router.navigate(['/main']); // Navigate to main application route
          } else {
            throw new Error("Token could not be retrieved.");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            // Wenn es sich um ein Error-Objekt handelt, auf die message zugreifen
            this.snackBar.open(error.message, 'Close', { duration: 5000 });
          } else {
            // Wenn es sich nicht um ein Error-Objekt handelt, zeige eine allgemeine Fehlermeldung an
            this.snackBar.open('An unknown error occurred', 'Close', { duration: 5000 });
          }
        }
      })
      .catch((error) => {
        // Handle errors here, such as incorrect credentials
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
      });
  }

  /**
   * Navigates to the sign-up page for new users.
   */
  goToSignUp() {
    this.router.navigate(['/signup']); // Navigate to sign-up route
  }
}
