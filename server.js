const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Base SQLite
const db = new sqlite3.Database("stock.db");

// Création de la table si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  supplier TEXT,
  price REAL,
  quantity INTEGER,
  code TEXT
)`);

// Récupérer tous les articles
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ajouter un article
app.post("/items", (req, res) => {
  const { name, supplier, price, quantity, code } = req.body;
  db.run(
    "INSERT INTO items (name, supplier, price, quantity, code) VALUES (?, ?, ?, ?, ?)",
    [name, supplier, price, quantity, code],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Modifier un article
app.put("/items/:id", (req, res) => {
  const { name, supplier, price, quantity, code } = req.body;
  db.run(
    "UPDATE items SET name=?, supplier=?, price=?, quantity=?, code=? WHERE id=?",
    [name, supplier, price, quantity, code, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Supprimer un article
app.delete("/items/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.listen(3000, () => console.log("✅ API démarrée sur http://localhost:3000"));