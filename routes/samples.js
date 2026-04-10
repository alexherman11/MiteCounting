const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const router = express.Router();

// Submit a leaf (sample + counts) for a trial
router.post("/trials/:trialId/samples", async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { trialId } = req.params;
    const { observer, counts } = req.body;
    if (!observer || !counts) {
      return res.status(400).json({ error: "observer and counts required" });
    }

    await client.query("BEGIN");

    // Lock the trial row to serialize leaf_number assignment
    const trialCheck = await client.query(
      "SELECT id FROM trials WHERE id = $1 FOR UPDATE",
      [trialId]
    );
    if (trialCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Trial not found" });
    }

    // Compute next leaf number
    const { rows: maxRows } = await client.query(
      "SELECT COALESCE(MAX(leaf_number), 0) + 1 AS next_num FROM samples WHERE trial_id = $1",
      [trialId]
    );
    const leafNumber = maxRows[0].next_num;

    // Insert sample
    const sampleId = crypto.randomUUID();
    const { rows: sampleRows } = await client.query(
      "INSERT INTO samples (id, trial_id, leaf_number, observer) VALUES ($1, $2, $3, $4) RETURNING id, leaf_number, counted_at",
      [sampleId, trialId, leafNumber, observer]
    );
    const sample = sampleRows[0];

    // Insert counts one at a time (works with both pg and sqlite)
    const entries = Object.entries(counts).filter(([, v]) => v > 0);
    for (const [key, count] of entries) {
      const [speciesId, stage] = key.split(".");
      await client.query(
        "INSERT INTO counts (sample_id, species_id, stage, count) VALUES ($1, $2, $3, $4)",
        [sample.id, speciesId, stage, count]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      id: sample.id,
      leafNumber: sample.leaf_number,
      countedAt: sample.counted_at,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/trials/:trialId/samples error:", err);
    res.status(500).json({ error: "Failed to submit sample" });
  } finally {
    client.release();
  }
});

// List all samples + counts for a trial
router.get("/trials/:trialId/samples", async (req, res) => {
  try {
    const { trialId } = req.params;

    // Get trial info
    const { rows: trialRows } = await db.query(
      "SELECT * FROM trials WHERE id = $1",
      [trialId]
    );
    if (trialRows.length === 0) return res.status(404).json({ error: "Trial not found" });

    // Get all samples with counts in one query
    const { rows } = await db.query(
      `SELECT s.id, s.leaf_number, s.observer, s.counted_at,
              c.species_id, c.stage, c.count
       FROM samples s
       LEFT JOIN counts c ON c.sample_id = s.id
       WHERE s.trial_id = $1
       ORDER BY s.leaf_number`,
      [trialId]
    );

    // Group by sample
    const samplesMap = new Map();
    for (const row of rows) {
      if (!samplesMap.has(row.id)) {
        samplesMap.set(row.id, {
          id: row.id,
          leaf_number: row.leaf_number,
          observer: row.observer,
          counted_at: row.counted_at,
          counts: {},
        });
      }
      if (row.species_id && row.stage) {
        samplesMap.get(row.id).counts[`${row.species_id}.${row.stage}`] = row.count;
      }
    }

    res.json({
      trial: trialRows[0],
      samples: Array.from(samplesMap.values()),
    });
  } catch (err) {
    console.error("GET /api/trials/:trialId/samples error:", err);
    res.status(500).json({ error: "Failed to list samples" });
  }
});

// Delete a sample
router.delete("/samples/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM samples WHERE id = $1",
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Sample not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/samples/:id error:", err);
    res.status(500).json({ error: "Failed to delete sample" });
  }
});

module.exports = router;
