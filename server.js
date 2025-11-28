const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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

// Route GET /items
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) {
      console.error("Erreur SELECT:", err);
      res.status(500).json({ error: "Erreur serveur" });
    } else {
      res.json(rows);
    }
  });
});

// Route POST /items
app.post("/items", (req, res) => {
  const { name, supplier, price, quantity, code } = req.body;
  db.run(
    `INSERT INTO items (name, supplier, price, quantity, code) VALUES (?, ?, ?, ?, ?)`,
    [name, supplier, price, quantity, code],
    function (err) {
      if (err) {
        console.error("Erreur INSERT:", err);
        res.status(500).json({ error: "Erreur serveur" });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});