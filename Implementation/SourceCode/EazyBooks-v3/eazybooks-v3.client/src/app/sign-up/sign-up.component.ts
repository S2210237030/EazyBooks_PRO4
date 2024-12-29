import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * SignUpComponent handles the user sign-up process, including
 * form submission and navigation to the sign-in page.
 */
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  email: string = ''; // User's email input
  password: string = ''; // User's password input

  constructor(
    private snackBar: MatSnackBar, // Snackbar for displaying messages
    private router: Router, // Router for navigation
    private authService: AuthService, // AuthService for authentication methods
    private translate: TranslateService // TranslateService for language support
  ) { }

  /**
   * Signs the user up using the provided email and password.
   * Displays a success message on successful registration and
   * navigates to the sign-in page.
   * Handles errors by displaying a snackbar with the error message
   * and clears the email and password fields.
   */
  signUp() {
    this.authService.signUp(this.email, this.password)
      .then((userCredential) => {
        // Registration successful
        this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
        this.router.navigate(['/signin']); // Navigate to login page after successful registration
      })
      .catch((error) => {
        // Handle errors here, such as a failure to register
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
        this.email = ''; // Clear email input on error
        this.password = ''; // Clear password input on error
      });
  }

  /**
   * Navigates to the sign-in page for existing users.
   */
  goToSignIn() {
    this.router.navigate(['/signin']); // Navigate to sign-in route
  }
}
