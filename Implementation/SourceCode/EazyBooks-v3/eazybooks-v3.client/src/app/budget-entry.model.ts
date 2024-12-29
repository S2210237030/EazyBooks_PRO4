/**
 * Represents a budget entry with details about budget goals,
 * including amounts, dates, categories, and status.
 */
export interface BudgetEntry {
  /**
   * Optional: A unique ID for the budget entry.
   */
  id?: string;

  /**
   * Title or description of the budget goal.
   */
  title: string;

  /**
   * The amount allocated for the budget goal.
   */
  amount: number;

  /**
   * The amount that has already been spent.
   */
  spent: number;

  /**
   * Goal date as an ISO string.
   */
  goalDate: string;

  /**
   * Goal date in milliseconds since epoch.
   */
  goalDateInMillis: number;

  /**
   * Category of the budget goal (e.g., "Savings", "Vacation", "Food").
   */
  category: string;

  /**
   * Creation date as an ISO string.
   */
  createdAt: string;

  /**
   * Creation date in milliseconds since epoch.
   */
  createdAtInMillis: number;

  /**
   * Last updated date as an ISO string.
   */
  updatedAt: string;

  /**
   * Last updated date in milliseconds since epoch.
   */
  updatedAtInMillis: number;

  /**
   * Status of the budget goal, which can be 'active', 'completed', or 'canceled'.
   */
  status: 'aktiv' | 'beendet' | 'abgebrochen';

  /**
   * Type of the budget, which can be 'saving' or 'spending'.
   */
  type: 'saving' | 'spending';
}
