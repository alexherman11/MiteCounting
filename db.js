// Database adapter: uses PostgreSQL when DATABASE_URL is set (Railway),
// otherwise falls back to SQLite for local development.

const path = require("path");
const USE_PG = !!process.env.DATABASE_URL;

if (USE_PG) {
  // ── PostgreSQL ──
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    isPg: true,
  };
} else {
  // ── SQLite ──
  const Database = require("better-sqlite3");
  const dbPath = path.join(__dirname, "mite_counter.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Adapt SQLite to match the pg query interface
  // pg returns { rows: [...], rowCount: N }
  function query(text, params) {
    // Convert $1, $2, ... placeholders to ?
    let sql = text.replace(/\$(\d+)/g, "?");

    // Strip PostgreSQL-specific syntax that SQLite doesn't understand
    sql = sql.replace(/::int\b/g, "");
    sql = sql.replace(/\bTIMESTAMPTZ\b/gi, "TEXT");
    sql = sql.replace(/\bSERIAL\b/gi, "INTEGER");
    sql = sql.replace(/\bUUID\b/gi, "TEXT");
    sql = sql.replace(/DEFAULT gen_random_uuid\(\)/gi, "");
    sql = sql.replace(/DEFAULT now\(\)/gi, "DEFAULT (datetime('now'))");
    sql = sql.replace(/CREATE EXTENSION[^;]*;/gi, "");
    sql = sql.replace(/FOR UPDATE/gi, "");

    const trimmed = sql.trim();
    if (!trimmed || trimmed === "") {
      return { rows: [], rowCount: 0 };
    }

    const isSelect = /^\s*(SELECT|WITH)\b/i.test(trimmed);
    const isReturning = /RETURNING\b/i.test(trimmed);

    if (isSelect) {
      const rows = sqlite.prepare(trimmed).all(...(params || []));
      return { rows, rowCount: rows.length };
    } else if (isReturning) {
      // Split off RETURNING clause and run as two steps
      const match = trimmed.match(/^([\s\S]+?)\s+RETURNING\s+(.+)$/i);
      if (match) {
        const mainSql = match[1];
        const returningCols = match[2].trim();
        const info = sqlite.prepare(mainSql).run(...(params || []));

        // For INSERTs, fetch the last inserted row
        if (/^\s*INSERT/i.test(mainSql)) {
          const tableName = mainSql.match(/INSERT\s+INTO\s+(\S+)/i)[1];
          const row = sqlite.prepare(
            `SELECT ${returningCols} FROM ${tableName} WHERE rowid = ?`
          ).get(info.lastInsertRowid);
          return { rows: row ? [row] : [], rowCount: info.changes };
        }
        return { rows: [], rowCount: info.changes };
      }
      // Fallback
      const info = sqlite.prepare(trimmed).run(...(params || []));
      return { rows: [], rowCount: info.changes };
    } else {
      // Might contain multiple statements (migrations)
      if (trimmed.includes(";") && (trimmed.match(/;/g) || []).length > 1) {
        sqlite.exec(trimmed);
        return { rows: [], rowCount: 0 };
      }
      const info = sqlite.prepare(trimmed).run(...(params || []));
      return { rows: [], rowCount: info.changes };
    }
  }

  // Fake pool.connect() for transaction support in samples.js
  const fakePool = {
    connect: () => {
      let inTransaction = false;
      const client = {
        query: (text, params) => {
          const sql = text.trim();
          if (/^BEGIN/i.test(sql)) {
            if (!inTransaction) { sqlite.exec("BEGIN"); inTransaction = true; }
            return { rows: [], rowCount: 0 };
          }
          if (/^COMMIT/i.test(sql)) {
            if (inTransaction) { sqlite.exec("COMMIT"); inTransaction = false; }
            return { rows: [], rowCount: 0 };
          }
          if (/^ROLLBACK/i.test(sql)) {
            if (inTransaction) { sqlite.exec("ROLLBACK"); inTransaction = false; }
            return { rows: [], rowCount: 0 };
          }
          return query(sql, params);
        },
        release: () => {
          if (inTransaction) {
            try { sqlite.exec("ROLLBACK"); } catch (e) { /* ignore */ }
          }
        },
      };
      return client;
    },
  };

  console.log(`Using SQLite database: ${dbPath}`);
  module.exports = {
    query,
    pool: fakePool,
    isPg: false,
  };
}
