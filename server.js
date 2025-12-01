const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

// --- Sécurité basique ---
app.use(helmet()); // ajoute des en-têtes de sécurité
app.use(cors({ origin: "https://ton-user.github.io/ton-repo" })); // autorise uniquement ton site GitHub Pages
app.use(express.json());

// Connexion à la base SQLite
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

// --- Routes ---
// GET /items
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) {
      console.error("Erreur SELECT:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(rows);
  });
});

// POST /items
app.post("/items", (req, res) => {
  const { name, supplier, price, quantity, code } = req.body;

  if (!name || !supplier) {
    return res.status(400).json({ error: "Nom et fournisseur requis" });
  }
  if (price < 0 || quantity < 0) {
    return res.status(400).json({ error: "Prix et quantité doivent être positifs" });
  }

  db.run(
    `INSERT INTO items (name, supplier, price, quantity, code) VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), supplier.trim(), price || 0, quantity || 0, code || ""],
    function (err) {
      if (err) {
        console.error("Erreur INSERT:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.status(201).json({ id: this.lastID, name, supplier, price, quantity, code });
    }
  );
});

// PUT /items/:id
app.put("/items/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, supplier, price, quantity, code } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalide" });
  }
  if (!name || !supplier) {
    return res.status(400).json({ error: "Nom et fournisseur requis" });
  }

  db.run(
    `UPDATE items SET name=?, supplier=?, price=?, quantity=?, code=? WHERE id=?`,
    [name.trim(), supplier.trim(), price || 0, quantity || 0, code || "", id],
    function (err) {
      if (err) {
        console.error("Erreur UPDATE:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Article non trouvé" });
      }
      res.json({ id, name, supplier, price, quantity, code });
    }
  );
});

// DELETE /items/:id
app.delete("/items/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalide" });
  }

  db.run(`DELETE FROM items WHERE id=?`, [id], function (err) {
    if (err) {
      console.error("Erreur DELETE:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.status(204).send();
  });
});

// --- Démarrage du serveur ---
app.listen(port, () => {
  console.log(`Serveur sécurisé lancé sur le port ${port}`);
});