/**
 * Represents a financial transaction entry with details
 * such as document number, date, gross and net amounts,
 * description, category, and image path.
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
    documentName: string = ''
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
      imagePath: this.documentName
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
      obj.documentName
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
    return `${this.documentNumber},${formattedDate},${formattedGross},${this.net},${this.description},${this.category},${this.incomeExpenses},${this.dateInMillis},${this.documentName}`;
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
      fields[8] // documentName
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
}
