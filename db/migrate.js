const fs = require("fs");
const path = require("path");
const db = require("../db");

async function runMigrations() {
  // Ensure the tracking table exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  // Read all .sql files in db/ sorted by name
  const dir = path.join(__dirname);
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await db.query(
      "SELECT 1 FROM _migrations WHERE name = $1",
      [file]
    );
    if (rows.length > 0) continue; // already applied

    console.log(`Applying migration: ${file}`);
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await db.query(sql);
    await db.query(
      "INSERT INTO _migrations (name) VALUES ($1)",
      [file]
    );
  }

  console.log("Migrations complete.");
}

module.exports = { runMigrations };
