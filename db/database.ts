import * as SQLite from "expo-sqlite";

/**
 * Singleton DB instance accessor to prevent opening multiple connections.
 */
let db: SQLite.WebSQLDatabase | null = null;

/**
 * Returns a ready-to-use SQLite database instance.
 */
export const getDB = (): SQLite.WebSQLDatabase => {
  if (!db) {
    db = SQLite.openDatabase("money_saver.db");
  }
  return db;
};

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#FF6B6B" },
  { name: "Transport", color: "#4D96FF" },
  { name: "Shopping", color: "#F2C94C" },
  { name: "Bills", color: "#9B51E0" },
  { name: "Entertainment", color: "#00BFA6" },
  { name: "Other", color: "#6C63FF" },
];

/**
 * Creates required tables (if they don't exist) and seeds default categories.
 * - categories(id, name, color)
 * - expenses(id, amount, category_id, date, notes)
 */
export const initializeDatabase = async (): Promise<void> => {
  const database = getDB();

  await runAsync(database, `
    PRAGMA foreign_keys = ON;
  `);

  await runAsync(
    database,
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );`
  );

  await runAsync(
    database,
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,              -- ISO string (e.g., 2025-10-24T20:30:00.000Z)
      notes TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );`
  );

  // Seed default categories if table is empty
  const result = await getAsync(database, "SELECT COUNT(*) as count FROM categories", []);
  const count = (result?.rows?.item(0)?.count ?? 0) as number;

  if (count === 0) {
    await runInTransaction(database, async (tx) => {
      for (const c of DEFAULT_CATEGORIES) {
        await runTxAsync(
          tx,
          "INSERT INTO categories (name, color) VALUES (?, ?);",
          [c.name, c.color]
        );
      }
    });
  }
};

/**
 * Helper: Execute a query and return the SQLResultSet.
 */
export const runAsync = (db: SQLite.WebSQLDatabase, sql: string, args: any[] = []) =>
  new Promise<SQLite.SQLResultSet>((resolve, reject) =>
    db.transaction((tx) =>
      tx.executeSql(
        sql,
        args,
        (_, res) => resolve(res),
        (_, err) => {
          reject(err);
          return false;
        }
      )
    )
  );

/**
 * Helper: Execute a single select and return result set (first call).
 */
export const getAsync = (db: SQLite.WebSQLDatabase, sql: string, args: any[] = []) =>
  new Promise<SQLite.SQLResultSet>((resolve, reject) =>
    db.readTransaction((tx) =>
      tx.executeSql(
        sql,
        args,
        (_, res) => resolve(res),
        (_, err) => {
          reject(err);
          return false;
        }
      )
    )
  );

/**
 * Helper: Run multiple statements inside a single transaction.
 */
export const runInTransaction = (
  database: SQLite.WebSQLDatabase,
  runner: (tx: SQLite.SQLTransaction) => Promise<void>
) =>
  new Promise<void>((resolve, reject) => {
    database.transaction(
      async (tx) => {
        try {
          await runner(tx);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err)
    );
  });

/**
 * Helper: Execute SQL inside an existing transaction.
 */
export const runTxAsync = (
  tx: SQLite.SQLTransaction,
  sql: string,
  args: any[] = []
): Promise<SQLite.SQLResultSet> =>
  new Promise<SQLite.SQLResultSet>((resolve, reject) =>
    tx.executeSql(
      sql,
      args,
      (_, res) => resolve(res),
      (_, err) => {
        reject(err);
        return false;
      }
    )
  );
