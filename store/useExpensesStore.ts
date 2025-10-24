import { create } from "zustand";
import ExpenseService, { Category, Expense, CategoryTotal } from "../services/ExpenseService";

/**
 * Utility: Returns ISO boundaries for a calendar month given a JS Date.
 */
const monthBounds = (d: Date) => {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
  const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: nextMonth.toISOString() };
};

type ExpensesState = {
  categories: Category[];
  expenses: Expense[];
  isLoading: boolean;

  // Derived / cached aggregates (optional for quick access)
  thisMonthTotals: CategoryTotal[];
  lastMonthTotals: CategoryTotal[];

  // Actions
  loadInitialData: () => Promise<void>;
  refreshAggregates: () => Promise<void>;
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
};

const useExpensesStore = create<ExpensesState>((set, get) => ({
  categories: [],
  expenses: [],
  isLoading: false,
  thisMonthTotals: [],
  lastMonthTotals: [],

  /**
   * Loads categories & expenses, then calculates aggregates.
   */
  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const [categories, expenses] = await Promise.all([
        ExpenseService.getCategories(),
        ExpenseService.getAllExpenses(),
      ]);
      set({ categories, expenses });
      await get().refreshAggregates();
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Refreshes the monthly aggregates for dashboard charts.
   */
  refreshAggregates: async () => {
    const now = new Date();
    const { startISO: thisStart, endISO: thisEnd } = monthBounds(now);

    const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
    const { startISO: lastStart, endISO: lastEnd } = monthBounds(lastMonth);

    const [thisTotals, lastTotals] = await Promise.all([
      ExpenseService.getCategoryTotals(thisStart, thisEnd),
      ExpenseService.getCategoryTotals(lastStart, lastEnd),
    ]);

    set({ thisMonthTotals: thisTotals, lastMonthTotals: lastTotals });
  },

  /**
   * Adds a new expense to DB and store, then refreshes aggregates.
   */
  addExpense: async (input) => {
    const created = await ExpenseService.addExpense(input);
    set((s) => ({ expenses: [created, ...s.expenses] }));
    await get().refreshAggregates();
  },

  /**
   * Adds a new category to DB and store.
   */
  addCategory: async (input) => {
    const created = await ExpenseService.addCategory(input);
    set((s) => ({ categories: [...s.categories, created] }));
  },
}));

export default useExpensesStore;
