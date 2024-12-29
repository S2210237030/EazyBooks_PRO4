import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SettingsService } from '../services/settings.service';
import { AuthService } from '../services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { Renderer2 } from '@angular/core';

/**
 * SettingsComponent handles user settings, including theme, language,
 * notifications, and user account management within the application.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: any = {
    theme: 'light',
    language: 'de',
    notifications: false,
    twoFactorAuth: false
  };

  user: any = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '' // Added confirmPassword for confirmation logic
  };

  showPassword = false; // Flag to toggle password visibility
  showConfirmPassword = false; // Flag to toggle confirm password visibility

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private translate: TranslateService,
    private renderer: Renderer2
  ) {
    this.translate.setDefaultLang('de'); // Set default language to German
  }

  ngOnInit(): void {
    this.loadSettings(); // Load user settings when component initializes
  }

  /**
   * Loads user settings from the SettingsService and updates the component state.
   */
  loadSettings(): void {
    this.settingsService.getSettings().subscribe((data: any) => {
      if (data) {
        this.settings = {
          theme: data.theme || 'light',
          language: data.language || 'de',
          notifications: data.notifications || false
        };
        // Load user-related settings
        this.user.name = data.user?.name || '';
        this.user.email = data.user?.email || '';
        this.translate.use(this.settings.language); // Change language based on settings
      }
    }, error => {
      console.error('Error loading settings:', error); // Log error if loading settings fails
    });
  }

  /**
   * Toggles the visibility of the password input field.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword; // Toggle password visibility
  }

  /**
   * Toggles the visibility of the confirm password input field.
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword; // Toggle confirm password visibility
  }

  /**
   * Saves the user's password after checking that both password fields match.
   */
  savePassword(): void {
    // Check if the entered passwords match
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!'); // Alert if passwords do not match
      return;
    }

    this.settingsService.updatePassword(this.user.password).subscribe(
      () => {
        console.log('Password updated successfully.'); // Log success message
      },
      (error) => {
        if (error.code === 'auth/requires-recent-login') {
          alert('Please log in again to update your password.'); // Prompt for re-login if required
        } else {
          console.error('Error updating password:', error); // Log any other error
        }
      }
    );
  }

  /**
   * Saves updated user settings to the SettingsService.
   */
  saveSettings(): void {
    // Compile updated settings
    const updatedSettings = {
      theme: this.settings.theme,
      language: this.settings.language,
      notifications: this.settings.notifications,
      user: {
        name: this.user.name,
        email: this.user.email
      }
    };

    this.settingsService.saveSettings(updatedSettings).subscribe(() => {
      console.log('Settings saved successfully.'); // Log success message
    }, error => {
      console.error('Error saving settings:', error); // Log any error
    });
  }

  /**
   * Saves other miscellaneous settings to the SettingsService.
   * 
   * @param settings - The settings object to be saved.
   */
  saveOtherSettings(settings: any): void {
    this.settingsService.saveSettings(settings).subscribe(() => {
      console.log('Settings saved successfully.'); // Log success message
    }, error => {
      console.error('Error saving settings:', error); // Log any error
    });
  }

  /**
   * Updates the application's theme based on the selected theme.
   * 
   * @param selectedTheme - The theme to be applied ('light' or 'dark').
   */
  updateAppTheme(selectedTheme: string): void {
    if (selectedTheme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme'); // Apply dark theme
      console.log(selectedTheme); // Log selected theme
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Remove dark theme
      console.log(selectedTheme); // Log selected theme
    }

    this.settingsService.updateAppTheme(selectedTheme).subscribe(
      () => console.log(`Theme updated successfully to ${selectedTheme}`),
      error => console.error('Error updating theme:', error) // Log any error
    );
  }

  /**
   * Changes the application's language based on user selection.
   * 
   * @param lang - The language code to be set.
   */
  changeLanguage(lang: string): void {
    this.translate.use(lang); // Set the selected language

    this.settingsService.updateLanguage(lang).subscribe(
      () => console.log(`Language updated successfully to ${lang}`),
      error => console.error('Error updating language:', error) // Log any error
    );
  }

  /**
   * Logs out the current user and handles any errors during the process.
   */
  async logout(): Promise<void> {
    try {
      await this.authService.logout(); // Ensure authService.logout() returns a Promise
      console.log('User logged out'); // Log successful logout
    } catch (error) {
      console.error('Logout failed', error); // Log any error
    }
  }
}
