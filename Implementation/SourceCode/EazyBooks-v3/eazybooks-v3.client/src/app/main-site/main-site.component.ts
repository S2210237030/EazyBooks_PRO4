import { Component, OnInit } from '@angular/core';

/**
 * The `MainSiteComponent` class is responsible for managing the main interface of the application.
 * It allows navigation between different sections such as the dashboard.
 */
@Component({
  selector: 'app-main-site',
  templateUrl: './main-site.component.html',
  styleUrls: ['./main-site.component.css']
})
export class MainSiteComponent implements OnInit {

  /**
   * Constructor that injects the Firestore service for database interactions.
   */
  constructor() {
    console.log('Main site is active');
  }

  /**
   * Lifecycle hook that is called when the component is initialized.
   * It logs a message indicating that the component's initialization has started.
   */
  ngOnInit() {
    console.log('MainSiteComponent ngOnInit called');
  }

  /**
   * The currently selected section of the main site. 
   * Initially set to 'dashboard'.
   */
  selectedSection: string = 'dashboard';

  /**
   * Updates the selected section of the main site when a new section is chosen.
   * 
   * @param section - The section to be displayed.
   */
  showSection(section: string) {
    this.selectedSection = section;
  }

  /**
   * Placeholder method for loading data.
   * Currently just logs a message indicating that data loading is initiated.
   */
  loadData() {
    console.log('Load data');
  }
}
