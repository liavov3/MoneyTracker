import { getDB, getAsync, runAsync, runInTransaction, runTxAsync } from "../db/database";

/** Expense model (stored in SQLite). */
export interface Expense {
  id?: number;
  amount: number;           // Positive decimal value
  categoryId: number;       // FK to categories.id
  date: string;             // ISO string
  notes?: string;           // Optional free text
}

/** Category model (stored in SQLite). */
export interface Category {
  id?: number;
  name: string;             // Unique friendly name
  color: string;            // Hex color for charts
}

/** Aggregated total per category for a given period. */
export interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  color: string;
  total: number;
}

/**
 * ExpenseService centralizes all reads/writes to the SQLite layer.
 * This keeps components & stores simple and focused on UI logic.
 */
const ExpenseService = {
  // Categories ---------------------------------------------------------------

  async getCategories(): Promise<Category[]> {
    const db = getDB();
    const res = await getAsync(db, "SELECT id, name, color FROM categories ORDER BY name ASC;");
    const out: Category[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      out.push(res.rows.item(i));
    }
    return out;
  },

  async addCategory(input: Omit<Category, "id">): Promise<Category> {
    const db = getDB();
    const res = await runAsync(db, "INSERT INTO categories (name, color) VALUES (?, ?);", [
      input.name.trim(),
      input.color,
    ]);
    const id = res.insertId!;
    return { id, ...input };
  },

  // Expenses ----------------------------------------------------------------

  async addExpense(input: Omit<Expense, "id">): Promise<Expense> {
    const db = getDB();
    const res = await runAsync(
      db,
      "INSERT INTO expenses (amount, category_id, date, notes) VALUES (?, ?, ?, ?);",
      [input.amount, input.categoryId, input.date, input.notes ?? null]
    );
    const id = res.insertId!;
    return { id, ...input };
  },

  async getAllExpenses(): Promise<Expense[]> {
    const db = getDB();
    const res = await getAsync(
      db,
      `SELECT id, amount, category_id as categoryId, date, notes
       FROM expenses
       ORDER BY date DESC, id DESC;`
    );
    const out: Expense[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      out.push(res.rows.item(i));
    }
    return out;
  },

  async getExpensesInDateRange(fromISO: string, toISO: string): Promise<Expense[]> {
    const db = getDB();
    const res = await getAsync(
      db,
      `SELECT id, amount, category_id as categoryId, date, notes
       FROM expenses
       WHERE date >= ? AND date < ?
       ORDER BY date DESC, id DESC;`,
      [fromISO, toISO]
    );
    const out: Expense[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      out.push(res.rows.item(i));
    }
    return out;
  },

  // Aggregations -------------------------------------------------------------

  /**
   * Returns total expense per category within a given date range.
   */
  async getCategoryTotals(fromISO: string, toISO: string): Promise<CategoryTotal[]> {
    const db = getDB();
    const res = await getAsync(
      db,
      `SELECT c.id as categoryId, c.name as categoryName, c.color as color, 
              SUM(e.amount) as total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id 
         AND e.date >= ? AND e.date < ?
       GROUP BY c.id, c.name, c.color
       ORDER BY total DESC NULLS LAST;`,
      [fromISO, toISO]
    );
    const out: CategoryTotal[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      const row = res.rows.item(i);
      out.push({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        color: row.color,
        total: row.total ? Number(row.total) : 0,
      });
    }
    return out;
  },

  /**
   * Utility to clear & seed demo data (useful during development).
   * Not used in production — call only from a dev-only button if needed.
   */
  async seedDemoData() {
    const db = getDB();
    await runInTransaction(db, async (tx) => {
      await runTxAsync(tx, "DELETE FROM expenses;");
      // Insert a few fake expenses for charts
      const now = new Date();
      const iso = (d: Date) => d.toISOString();
      const daysAgo = (n: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - n);
        return d;
      };
      const inserts = [
        [45.5, 1, iso(daysAgo(1)), "Lunch"],
        [12.0, 2, iso(daysAgo(2)), "Bus"],
        [89.9, 3, iso(daysAgo(3)), "Shoes"],
        [220.0, 4, iso(daysAgo(7)), "Electricity bill"],
        [60.0, 5, iso(daysAgo(10)), "Cinema"],
        [25.0, 1, iso(daysAgo(15)), "Snacks"],
      ];
      for (const [amount, categoryId, date, notes] of inserts) {
        await runTxAsync(
          tx,
          "INSERT INTO expenses (amount, category_id, date, notes) VALUES (?, ?, ?, ?);",
          [amount, categoryId, date, notes]
        );
      }
    });
  },
};

export default ExpenseService;
