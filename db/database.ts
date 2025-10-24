import * as SQLite from "expo-sqlite";

/**
 * Create or open the local database.
 * Works in Expo Go (no native linking needed).
 */
const db = SQLite.openDatabaseSync("money_saver.db");

/**
 * Initialize the DB tables and seed defaults.
 */
export const initializeDatabase = async (): Promise<void> => {
  console.log("Initializing SQLite database...");

  await db.execAsync("PRAGMA foreign_keys = ON;");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

  // Seed defaults
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories;"
  );
  if (result?.count === 0) {
    console.log("Seeding default categories...");
    const defaults = [
      { name: "Food", color: "#FF6B6B" },
      { name: "Transport", color: "#4D96FF" },
      { name: "Shopping", color: "#F2C94C" },
      { name: "Bills", color: "#9B51E0" },
      { name: "Entertainment", color: "#00BFA6" },
      { name: "Other", color: "#6C63FF" },
    ];
    await db.withTransactionAsync(async () => {
      for (const c of defaults) {
        await db.runAsync("INSERT INTO categories (name, color) VALUES (?, ?);", [
          c.name,
          c.color,
        ]);
      }
    });
    console.log("Seeded default categories ✅");
  }

  console.log("Database ready ✅");
};

/**
 * Executes INSERT/UPDATE/DELETE statements.
 */
export const runAsync = async (sql: string, params: any[] = []) => {
  try {
    return await db.runAsync(sql, params);
  } catch (err) {
    console.error("SQLite runAsync error:", err);
    throw err;
  }
};

/**
 * Executes SELECT queries and returns all rows.
 */
export const getAsync = async (sql: string, params: any[] = []) => {
  try {
    return await db.getAllAsync(sql, params);
  } catch (err) {
    console.error("SQLite getAsync error:", err);
    throw err;
  }
};

/**
 * Expose the shared DB for direct access.
 */
export { db };
