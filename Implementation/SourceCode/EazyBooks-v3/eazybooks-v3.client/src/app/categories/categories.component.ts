import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../services/categories.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * The `CategoriesComponent` class is responsible for managing the categories within the application.
 * It allows users to load, add, and delete categories, as well as to handle language translations for category names.
 */
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  /**
   * Array to hold the list of categories.
   */
  categories: any[] = [];

  /**
   * Variable to hold the name of a new category to be added.
   */
  newCategory: string = '';

  /**
   * Constructor that injects the categories service and translation service.
   * 
   * @param categoriesService - Service for managing category data.
   * @param translate - Translation service for handling language changes.
   */
  constructor(
    private categoriesService: CategoriesService,
    private translate: TranslateService
  ) { }

  /**
   * Lifecycle hook that is called when the component is initialized.
   * It loads categories and subscribes to language change events for translations.
   */
  ngOnInit(): void {
    this.loadCategories();
    this.translate.onLangChange.subscribe(() => {
      // Übersetze Kategorien erneut, wenn die Sprache gewechselt wird
      this.translateCategories();
    });
  }

  /**
   * Load categories from the service and translate their names.
   */
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe(categories => {
      // Annahme: Kategorienamen werden direkt gespeichert
      this.categories = categories.map(category => ({
        ...category,
        name: category.name // Namen direkt verwenden
      }));
      this.translateCategories();  // Übersetze die Namen nach dem Laden der Kategorien
    });
  }

  /**
   * Translate the names of the categories using the translation service.
   */
  translateCategories(): void {
    this.categories = this.categories.map(category => ({
      ...category,
      name: this.translate.instant(category.name, category.name) // Übersetze den Namen oder benutze den Originaltext als Fallback
    }));
  }

  /**
   * Add a new category to the list if it doesn't already exist.
   * It resets the input field after adding the category.
   */
  addCategories(): void {
    if (this.newCategory.trim()) {
      const categoryName = this.newCategory.trim();
      const categoryExists = this.categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

      if (!categoryExists) {
        // Direkt den Namen speichern
        this.categoriesService.addCategory(categoryName).subscribe(() => {
          this.newCategory = '';
          this.loadCategories(); // Neu laden nach dem Hinzufügen
        });
      }
      this.newCategory = ''; // Reset the input field
    }
  }

  /**
   * Delete a specified category after user confirmation.
   * It stops the event propagation to avoid triggering other click events.
   * 
   * @param category - The category to be deleted.
   * @param event - The event triggered by the delete action.
   */
  deleteCategories(category: any, event: Event): void {
    event.stopPropagation(); // Verhindert, dass der click event die toggleDeleteIcon-Methode auslöst
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      this.categoriesService.deleteCategory(category.id).subscribe(() => {
        this.loadCategories(); // Neu laden nach dem Löschen
      });
    }
  }
}
