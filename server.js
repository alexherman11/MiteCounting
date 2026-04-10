const express = require("express");
const path = require("path");
const db = require("./db");
const { runMigrations } = require("./db/migrate");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check for Railway zero-downtime deploys
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// API routes
app.use("/api/trials", require("./routes/trials"));
app.use("/api", require("./routes/samples"));
app.use("/api", require("./routes/export"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server after migrations
async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.error("Migration failed:", err.message);
    console.log("Starting without database — API routes will fail but static app will work.");
  }

  const server = app.listen(PORT, () => {
    console.log(`Mite Counter running on port ${PORT}`);
  });

  // Graceful shutdown on Railway redeploy
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      if (db.pool && db.pool.end) db.pool.end();
      process.exit(0);
    });
  });
}

start();
