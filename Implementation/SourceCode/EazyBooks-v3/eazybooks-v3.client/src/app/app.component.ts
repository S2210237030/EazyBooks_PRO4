import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth-service.service';
import { SettingsService } from './services/settings.service';
import { TranslateService } from '@ngx-translate/core';

import * as crypto from 'crypto-js';
import { environment } from '../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * AppComponent is the main component of the application,
 * responsible for handling user authentication, loading
 * user preferences, and managing language and theme settings.
 * It also navigates between different application sections 
 * based on the user's authentication status.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /** Flag to track user login status */
  isLoggedIn = false;

  /**
   * Safe HTML content to display in the application.
   */
  safeContent: SafeHtml | undefined;

  /**
   * Constructor to initialize the AppComponent.
   * 
   * @param router - The Angular router service for navigation.
   * @param authService - The authentication service for managing user sessions.
   * @param settingsService - The service to manage user settings.
   * @param translate - The translation service for language management.
   * @param sanitizer - The Angular sanitizer service to sanitize HTML content.
   */
  constructor(
    private router: Router,
    private authService: AuthService,
    private settingsService: SettingsService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer
  ) { }

  /** Default section to display */
  selectedSection: string = 'main-site';

  /** 
   * Lifecycle hook that is called after the component is initialized.
   * Measures and logs the application's load time and checks 
   * user login status to navigate accordingly.
   */
  ngOnInit(): void {
    // Measure and log the application's load time
    window.addEventListener('load', () => {
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const loadtime = navigation.loadEventEnd - navigation.startTime;
      console.log('Angular app load time: ' + loadtime + ' ms');
      const timing = performance.timing;
      const fallbacktiming = timing.loadEventEnd - timing.navigationStart;
      console.log('Angular app fallback load time: ' + fallbacktiming + ' ms');
    });

    const savedLanguage = localStorage.getItem('language');
    console.log("language " + savedLanguage);
    this.applyLanguage(savedLanguage || 'de'); // german as default language

    // Check if user is logged in and navigate accordingly
    this.authService.isUserLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        console.log("isLoggedIn");
        this.router.navigate(['/main']);
        this.loadPreferences(); // Load user preferences if logged in
      } else {
        this.router.navigate(['/signin']);
      }
      /*this.isLoggedIn = false; // always navigate to signin page
      this.router.navigate(['/signin']);*/ 
    });
  }

  /** 
   * Sanitize user input to prevent XSS attacks and display it in the application.
   * 
   * @param userInput - The user input to sanitize and display.
   */
  sanitizeInput(userInput: string) {
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(userInput);
  }

  /** 
   * Save user preferences (language and theme) to local storage 
   * and apply them. If the user is logged in, preferences are 
   * also saved to the server.
   * 
   * @param language - The selected language to apply.
   * @param theme - The selected theme to apply.
   */
  savePreferences(language: string, theme: string) {
    const encryptedLanguage = crypto.AES.encrypt(language, environment.encryptionKey).toString();
    const encryptedTheme = crypto.AES.encrypt(theme, environment.encryptionKey).toString();

    //localStorage.setItem('language', language);
    //localStorage.setItem('theme', theme);
    localStorage.setItem('language', encryptedLanguage);
    localStorage.setItem('theme', encryptedTheme);

    this.applyLanguage(language);
    this.applyTheme(theme);

    // Save preferences to the server if logged in
    if (this.isLoggedIn) {
      this.settingsService.saveSettings({ language, theme }).subscribe();
    }
  }

  /** 
   * Load user preferences from the server and apply them 
   * to the application if the user is logged in.
   */
  loadPreferences() {
    if (this.isLoggedIn) {
      this.settingsService.getSettings().subscribe(settings => {
        const language = settings.language || 'en'; // Default to English
        const theme = settings.theme || 'light'; // Default to light theme
        this.applyLanguage(language);
        this.applyTheme(theme);
      });
    } else {
      const encryptedLanguage = localStorage.getItem('language');
      const encryptedTheme = localStorage.getItem('theme');

      if (encryptedLanguage && encryptedTheme) {
        const language = crypto.AES.decrypt(encryptedLanguage, environment.encryptionKey).toString(crypto.enc.Utf8);
        const theme = crypto.AES.decrypt(encryptedTheme, environment.encryptionKey).toString(crypto.enc.Utf8);

        this.applyLanguage(language);
        this.applyTheme(theme);
      }
    }
  }

  /** 
   * Apply the selected language to the application.
   * 
   * @param language - The language to apply.
   */
  applyLanguage(language: string) {
    this.translate.use(language);
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }

  /** 
   * Apply the selected theme to the application.
   * 
   * @param theme - The theme to apply.
   */
  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme); // Save theme in local storage
  }

  /** 
   * Show the selected section of the application.
   * 
   * @param section - The section to display.
   */
  showSection(section: string) {
    this.selectedSection = section;
  }

  /** 
   * Log out the user and navigate to the sign-in page.
   */
  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/signin']);
    });
  }
}
