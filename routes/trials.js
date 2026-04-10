const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const router = express.Router();

// List trials for a mode
router.get("/", async (req, res) => {
  try {
    const { mode } = req.query;
    let sql = `
      SELECT t.*, COUNT(s.id) AS sample_count
      FROM trials t
      LEFT JOIN samples s ON s.trial_id = t.id
    `;
    const params = [];
    if (mode) {
      params.push(mode);
      sql += ` WHERE t.mode = $1`;
    }
    sql += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/trials error:", err);
    res.status(500).json({ error: "Failed to list trials" });
  }
});

// Get a single trial
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, COUNT(s.id) AS sample_count
       FROM trials t
       LEFT JOIN samples s ON s.trial_id = t.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Trial not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/trials/:id error:", err);
    res.status(500).json({ error: "Failed to get trial" });
  }
});

// Create a trial
router.post("/", async (req, res) => {
  try {
    const { name, mode } = req.body;
    if (!name || !mode) return res.status(400).json({ error: "name and mode required" });

    const id = crypto.randomUUID();
    const { rows } = await db.query(
      "INSERT INTO trials (id, name, mode) VALUES ($1, $2, $3) RETURNING *",
      [id, name, mode]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/trials error:", err);
    res.status(500).json({ error: "Failed to create trial" });
  }
});

module.exports = router;
