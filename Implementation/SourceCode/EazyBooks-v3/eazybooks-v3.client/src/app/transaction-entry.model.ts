/**
 * Represents a financial transaction entry with details
 * such as document number, date, gross and net amounts,
 * description, category, image path, and recurring transaction information.
 */
export class TransactionEntry {
  public documentNumber: string;
  public date: string;
  public gross: number; // Brutto
  public net: number; // Netto
  public description: string;
  public category: string;
  public incomeExpenses: string;
  public dateInMillis: number;
  public documentName: string;

  // New fields for recurring transactions
  public repeatInterval: string; // e.g. "monthly", "yearly", "quarterly"
  public dayOfMonth?: number; // The specific day of the month for monthly recurrence (if applicable)
  public quarter?: string; // The specific quarter (optional)

  /**
   * Constructor to initialize a TransactionEntry object.
   * 
   * @param documentNumber - The unique identifier for the transaction.
   * @param date - The date of the transaction.
   * @param gross - The gross amount of the transaction.
   * @param net - The net amount of the transaction.
   * @param description - A brief description of the transaction.
   * @param category - The category of the transaction.
   * @param incomeExpenses - Indicates whether the transaction is income or expense.
   * @param dateInMillis - The date in milliseconds since epoch.
   * @param documentName - Optional name of the document associated with the transaction.
   * @param repeatInterval - The period for recurrence (e.g. "monthly", "yearly", "quarterly").
   * @param dayOfMonth - Optional: the day of the month for monthly recurrence (1-31).
   * @param quarter - Optional: the quarter for quarterly recurrence (1-4).
   */
  constructor(
    documentNumber: string,
    date: string,
    gross: number,
    net: number,
    description: string,
    category: string,
    incomeExpenses: string,
    dateInMillis: number,
    documentName: string = '',
    repeatInterval: string = '',
    dayOfMonth?: number,
    quarter?: string
  ) {
    this.documentNumber = documentNumber;
    this.date = date;
    this.gross = gross;
    this.net = net;
    this.description = description;
    this.category = category;
    this.incomeExpenses = incomeExpenses;
    this.dateInMillis = dateInMillis;
    this.documentName = documentName;
    this.repeatInterval = repeatInterval;
    this.dayOfMonth = dayOfMonth;
    this.quarter = quarter; // Initialize quarter
  }

  /** 
   * Convert the TransactionEntry to a plain object.
   * 
   * @returns An object representation of the transaction entry.
   */
  toObject(): object {
    return {
      documentNumber: this.documentNumber,
      date: this.date,
      gross: this.gross,
      net: this.net,
      description: this.description,
      category: this.category,
      incomeExpenses: this.incomeExpenses,
      dateInMillis: this.dateInMillis,
      imagePath: this.documentName,
      repeatInterval: this.repeatInterval,
      dayOfMonth: this.dayOfMonth,
      quarter: this.quarter  // Include quarter
    };
  }

  /** 
   * Create a TransactionEntry from a plain object.
   * 
   * @param obj - The object containing transaction entry data.
   * @returns A TransactionEntry instance.
   */
  static fromObject(obj: any): TransactionEntry {
    return new TransactionEntry(
      obj.documentNumber,
      obj.date,
      obj.gross,
      obj.net,
      obj.description,
      obj.category,
      obj.incomeExpenses,
      obj.dateInMillis,
      obj.documentName,
      obj.repeatInterval,
      obj.dayOfMonth,
      obj.quarter  // Handle quarter
    );
  }

  /** 
   * Convert the TransactionEntry to a string for storage.
   * 
   * @returns A string representation of the transaction entry.
   */
  toString(): string {
    const formattedDate = new Date(this.dateInMillis).toLocaleDateString('en-US');
    const formattedGross = this.gross.toFixed(2);
    return `${this.documentNumber},${formattedDate},${formattedGross},${this.net},${this.description},${this.category},${this.incomeExpenses},${this.dateInMillis},${this.documentName},${this.repeatInterval},${this.dayOfMonth ?? ''},${this.quarter ?? ''}`;
  }

  /** 
   * Create a TransactionEntry from a string representation.
   * 
   * @param entryString - The string containing transaction entry data.
   * @returns A TransactionEntry instance.
   */
  static fromString(entryString: string): TransactionEntry {
    const fields = entryString.split(',');
    return new TransactionEntry(
      fields[0],
      fields[1],
      parseFloat(fields[2]),
      parseFloat(fields[3]),
      fields[4],
      fields[5],
      fields[6],
      parseInt(fields[7], 10),
      fields[8], // documentName
      fields[9], // repeatInterval
      fields[10] ? parseInt(fields[10], 10) : undefined, // dayOfMonth
      fields[11] || undefined // quarter
    );
  }

  /** 
   * Get the year of the transaction.
   * 
   * @returns The year as a string.
   */
  getYear(): string {
    const date = new Date(this.dateInMillis);
    return date.getFullYear().toString();
  }

  /** 
   * Get the month of the transaction.
   * 
   * @returns The month as a number (1-12).
   */
  getMonth(): number {
    const date = new Date(this.dateInMillis);
    return date.getMonth() + 1;
  }

  /** 
   * Get the formatted date of the transaction.
   * 
   * @returns The date formatted as a string in DD.MM.YYYY format.
   */
  getDate(): string {
    const date = new Date(this.dateInMillis);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /** 
   * Get whether the transaction is an income or expense.
   * 
   * @returns 'Income' or 'Expenses' as a string.
   */
  getIncomeOrExpenses(): string {
    return this.incomeExpenses === 'Income' ? 'Income' : 'Expenses';
  }

  /** 
   * Get the description of the transaction.
   * 
   * @returns The description of the transaction.
   */
  getDescription(): string {
    return this.description;
  }

  /** 
   * Get the category of the transaction.
   * 
   * @returns The category of the transaction.
   */
  getCategory(): string {
    return this.category;
  }

  /** 
   * Get the month and year in a formatted string.
   * 
   * @returns A string representation of the month and year.
   */
  getMonthYear(): string {
    const date = new Date(this.dateInMillis);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${this.getMonthName(month)} ${year}`;
  }

  /** 
   * Get a formatted string representation of the transaction.
   * 
   * @returns A formatted string for display.
   */
  toFormattedString(): string {
    const formattedGross = this.gross.toFixed(2);
    const minus = this.incomeExpenses === 'Expenses' ? '-' : ' ';
    return `${this.date} No. ${this.documentNumber}: \n${this.description}\n${minus} € ${formattedGross}`;
  }

  /** 
   * Get the name of the month based on the month number.
   * 
   * @param month - The month number (1-12).
   * @returns The name of the month.
   */
  private getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  }

  /** 
   * Get the date in milliseconds.
   * 
   * @returns The date in milliseconds.
   */
  obtainDateInMillis(): number {
    return this.dateInMillis;
  }

  /** 
   * Set the image path for the transaction document.
   * 
   * @param path - The path to the image file.
   */
  setImagePath(path: string): void {
    this.documentName = path;
  }

  /** 
   * Get the image path for the transaction document.
   * 
   * @returns The path to the image file.
   */
  getImagePath(): string {
    return this.documentName;
  }

  /**
   * Update the next due date for a recurring transaction based on its repeat interval.
   */
  updateNextDueDate(): void {
    const currentDate = new Date(this.dateInMillis);
    let nextDate: Date;

    // Initialisiere nextDate basierend auf dem Intervall
    if (this.repeatInterval === 'monthly') {
      nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    } else if (this.repeatInterval === 'yearly') {
      nextDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
    } else if (this.repeatInterval === 'quarterly' && this.quarter) {
      // Calculate the next quarter (for example: add 3 months for the next quarter)
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      let currentQuarterIndex = quarters.indexOf(this.quarter);
      currentQuarterIndex = (currentQuarterIndex + 1) % 4; // Move to the next quarter
      this.quarter = quarters[currentQuarterIndex];
      nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3)); // Move 3 months ahead
    } else {
      console.error('Invalid repeat interval');
      return;
    }

    // Wenn ein dayOfMonth gesetzt ist, dann stelle sicher, dass der Tag im nächsten Monat/Jahr berücksichtigt wird
    if (this.dayOfMonth && this.repeatInterval === 'monthly') {
      nextDate.setDate(this.dayOfMonth);
    }

    // Die aktualisierte Zeit für die Transaktion setzen
    this.dateInMillis = nextDate.getTime();
  }
}
