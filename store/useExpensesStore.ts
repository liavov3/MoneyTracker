import { create } from "zustand";
import { getAsync, runAsync } from "../db/database";

/**
 * Types
 */
interface Category {
  id: number;
  name: string;
  color: string;
}

interface Expense {
  id: number;
  amount: number;
  category_id: number;
  date: string;
  notes?: string;
}

interface ExpensesState {
  categories: Category[];
  expenses: Expense[];

  loadInitialData: () => Promise<void>;
  addCategory: (data: { name: string; color: string }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  thisMonthTotals: () => Expense[];
  lastMonthTotals: () => Expense[];
}

/**
 * Zustand store
 */
const useExpensesStore = create<ExpensesState>((set, get) => ({
  categories: [],
  expenses: [],

  /**
   * Load both categories and expenses from SQLite
   */
  loadInitialData: async () => {
    try {
      const categories = (await getAsync("SELECT * FROM categories ORDER BY name ASC;")) as Category[];
      const expenses = (await getAsync("SELECT * FROM expenses ORDER BY date DESC;")) as Expense[];

      set({ categories, expenses });
    } catch (err) {
      console.error("Failed to load initial data:", err);
      set({ categories: [], expenses: [] }); // ✅ Always fallback to safe defaults
    }
  },

  /**
   * Add a new category
   */
  addCategory: async ({ name, color }) => {
    try {
      await runAsync("INSERT INTO categories (name, color) VALUES (?, ?);", [
        name,
        color,
      ]);
      await get().loadInitialData();
    } catch (err) {
      console.error("Failed to add category:", err);
      throw err;
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: number) => {
    try {
      await runAsync("DELETE FROM categories WHERE id = ?;", [id]);
      await get().loadInitialData();
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  },

  /**
   * Add an expense
   */
  addExpense: async (expense) => {
    try {
      await runAsync(
        "INSERT INTO expenses (amount, category_id, date, notes) VALUES (?, ?, ?, ?);",
        [expense.amount, expense.category_id, expense.date, expense.notes || ""]
      );
      await get().loadInitialData();
    } catch (err) {
      console.error("Failed to add expense:", err);
      throw err;
    }
  },

  /**
   * Get expenses for this month
   */
  thisMonthTotals: () => {
    const { expenses } = get();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  },

  /**
   * Get expenses for last month
   */
  lastMonthTotals: () => {
    const { expenses } = get();
    const now = new Date();
    let month = now.getMonth() - 1;
    let year = now.getFullYear();
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  },
}));

export default useExpensesStore;
