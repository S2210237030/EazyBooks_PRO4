import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  resetEmail: string = ''; // User's email input

  constructor(
    private snackBar: MatSnackBar, // Snackbar for displaying messages
    private router: Router, // Router for navigation
    private authService: AuthService, // AuthService for authentication methods
    private translate: TranslateService // TranslateService for language support
  ) { }

  /**
   * Sends a password reset email to the user's email address.
   * Displays a success message on successful email send.
   * Handles errors by displaying a snackbar with the error message.
   */
  resetPassword() {
    this.authService.forgotPassword(this.resetEmail)
      .then(() => {
        // Password reset email sent
        this.snackBar.open('Password reset email sent!', 'Close', { duration: 3000 });
      })
      .catch((error: { message: string; }) => {
        // Handle errors here, such as incorrect email address
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
      });
  }
}
