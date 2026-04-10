const express = require("express");
const ExcelJS = require("exceljs");
const db = require("../db");
const router = express.Router();

router.get("/trials/:trialId/export.xlsx", async (req, res) => {
  try {
    const { trialId } = req.params;

    // Get trial
    const { rows: trialRows } = await db.query(
      "SELECT * FROM trials WHERE id = $1",
      [trialId]
    );
    if (trialRows.length === 0) return res.status(404).json({ error: "Trial not found" });
    const trial = trialRows[0];

    // Get all samples + counts
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
    const allKeys = new Set();
    for (const row of rows) {
      if (!samplesMap.has(row.id)) {
        samplesMap.set(row.id, {
          leaf_number: row.leaf_number,
          observer: row.observer,
          counted_at: row.counted_at,
          counts: {},
        });
      }
      if (row.species_id && row.stage) {
        const key = `${row.species_id}.${row.stage}`;
        samplesMap.get(row.id).counts[key] = row.count;
        allKeys.add(key);
      }
    }
    const samples = Array.from(samplesMap.values());
    const countKeys = Array.from(allKeys).sort();

    // Build workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(trial.name.slice(0, 31)); // Excel 31-char limit

    // Header row
    const headerRow = ["Leaf #", "Observer", "Date", ...countKeys.map(formatColumnHeader)];
    const header = sheet.addRow(headerRow);
    header.font = { bold: true };
    header.alignment = { horizontal: "center" };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    // Data rows
    for (const sample of samples) {
      const row = [
        sample.leaf_number,
        sample.observer,
        new Date(sample.counted_at).toLocaleString(),
      ];
      for (const key of countKeys) {
        row.push(sample.counts[key] || 0);
      }
      sheet.addRow(row);
    }

    // Totals row
    if (samples.length > 0) {
      const totals = ["TOTAL", "", ""];
      for (const key of countKeys) {
        let sum = 0;
        for (const sample of samples) {
          sum += sample.counts[key] || 0;
        }
        totals.push(sum);
      }
      const totalRow = sheet.addRow(totals);
      totalRow.font = { bold: true };
    }

    // Auto-width columns
    sheet.columns.forEach((col, i) => {
      let maxLen = String(headerRow[i] || "").length;
      col.eachCell({ includeEmpty: false }, (cell) => {
        const len = String(cell.value || "").length;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 2, 30);
    });

    // Send response
    const filename = `${trial.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${trial.mode}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("GET /api/trials/:trialId/export.xlsx error:", err);
    res.status(500).json({ error: "Failed to export" });
  }
});

// Format "tssm.adult" -> "TSSM - Adult"
function formatColumnHeader(key) {
  const [speciesId, stage] = key.split(".");
  const species = speciesId.toUpperCase().replace(/_/g, " ");
  const stageLabel = stage.charAt(0).toUpperCase() + stage.slice(1).replace(/_/g, " ");
  return `${species} - ${stageLabel}`;
}

module.exports = router;
