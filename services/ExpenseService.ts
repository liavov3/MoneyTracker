import { db, runAsync, getAsync } from "../db/database";

/** Expense model */
export interface Expense {
  id?: number;
  amount: number;
  categoryId: number;
  date: string;
  notes?: string;
}

/** Category model */
export interface Category {
  id?: number;
  name: string;
  color: string;
}

/** Aggregated totals per category */
export interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  color: string;
  total: number;
}

/**
 * Service layer wrapping all SQLite read/write operations.
 * Uses the shared `db` instance (expo-sqlite v11+ async API).
 */
const ExpenseService = {
  // -------------------- CATEGORIES --------------------

  async getCategories(): Promise<Category[]> {
    const rows = (await getAsync(
      "SELECT id, name, color FROM categories ORDER BY name ASC;"
    )) as Category[];
    return rows ?? [];
  },

  async addCategory(input: Omit<Category, "id">): Promise<Category> {
    const result: any = await runAsync(
      "INSERT INTO categories (name, color) VALUES (?, ?);",
      [input.name.trim(), input.color]
    );
    const id = result?.lastInsertRowId ?? null;
    return { id, ...input };
  },

  // -------------------- EXPENSES ----------------------

  async addExpense(input: Omit<Expense, "id">): Promise<Expense> {
    const result: any = await runAsync(
      "INSERT INTO expenses (amount, category_id, date, notes) VALUES (?, ?, ?, ?);",
      [input.amount, input.categoryId, input.date, input.notes ?? null]
    );
    const id = result?.lastInsertRowId ?? null;
    return { id, ...input };
  },

  async getAllExpenses(): Promise<Expense[]> {
    const rows = (await getAsync(`
      SELECT id, amount, category_id as categoryId, date, notes
      FROM expenses
      ORDER BY date DESC, id DESC;
    `)) as Expense[];
    return rows ?? [];
  },

  async getExpensesInDateRange(fromISO: string, toISO: string): Promise<Expense[]> {
    const rows = (await getAsync(
      `
      SELECT id, amount, category_id as categoryId, date, notes
      FROM expenses
      WHERE date >= ? AND date < ?
      ORDER BY date DESC, id DESC;
      `,
      [fromISO, toISO]
    )) as Expense[];
    return rows ?? [];
  },

  // -------------------- AGGREGATIONS ------------------

  async getCategoryTotals(fromISO: string, toISO: string): Promise<CategoryTotal[]> {
    const rows = (await getAsync(
      `
      SELECT c.id as categoryId, c.name as categoryName, c.color as color,
             SUM(e.amount) as total
      FROM categories c
      LEFT JOIN expenses e
        ON e.category_id = c.id
       AND e.date >= ? AND e.date < ?
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC;
      `,
      [fromISO, toISO]
    )) as any[];

    return (rows ?? []).map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      color: r.color,
      total: Number(r.total ?? 0),
    }));
  },
};

// ✅ Add these functions to your existing ExpenseService file
export interface ExpenseUpdateData {
  amount?: number;
  categoryId?: number;
  date?: string;
  notes?: string;
}

/* ============================================================
   🧾 CATEGORY FUNCTIONS
   ============================================================ */

// ✅ Get all categories
export const getCategories = async () => {
  try {
    const rows = await getAsync("SELECT * FROM categories ORDER BY id ASC;");
    return rows;
  } catch (err) {
    console.error("Failed to load categories:", err);
    throw err;
  }
};

// ✅ Add a new category
export const addCategory = async (name: string, color: string) => {
  try {
    await runAsync("INSERT INTO categories (name, color) VALUES (?, ?);", [
      name,
      color,
    ]);
  } catch (err) {
    console.error("Failed to add category:", err);
    throw err;
  }
};

// ✅ Delete category by ID
export const deleteCategory = async (id: number) => {
  try {
    await runAsync("DELETE FROM categories WHERE id = ?;", [id]);
  } catch (err) {
    console.error("Failed to delete category:", err);
    throw err;
  }
};

/* ============================================================
   💰 EXPENSE FUNCTIONS
   ============================================================ */

// ✅ Update existing expense
export const updateExpense = async (
  id: number,
  updatedData: ExpenseUpdateData
): Promise<void> => {
  const { amount, categoryId, date, notes } = updatedData;
  await runAsync(
    `UPDATE expenses
     SET amount = ?, category_id = ?, date = ?, notes = ?
     WHERE id = ?;`,
    [amount, categoryId, date, notes, id]
  );
};

// ✅ Delete an expense by ID
export const deleteExpense = async (id: number): Promise<void> => {
  await runAsync(`DELETE FROM expenses WHERE id = ?;`, [id]);
};
