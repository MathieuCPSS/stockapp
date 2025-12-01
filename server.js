const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// --- Sécurité basique ---
app.use(helmet()); // ajoute des en-têtes de sécurité
app.use(cors({ origin: "https://ton-user.github.io/ton-repo" })); // autorise uniquement ton site GitHub Pages
app.use(express.json());

// --- Connexion PostgreSQL (Supabase) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- Routes ---
// Test de connexion
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("Erreur de connexion PostgreSQL :", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /items
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /items
app.post("/items", async (req, res) => {
  const { name, supplier, price, quantity, code, maletteId } = req.body;

  if (!name || !supplier) {
    return res.status(400).json({ error: "Nom et fournisseur requis" });
  }
  if (price < 0 || quantity < 0) {
    return res.status(400).json({ error: "Prix et quantité doivent être positifs" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items (name, supplier, price, quantity, code, maletteId)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), supplier.trim(), price || 0, quantity || 0, code || "", maletteId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur INSERT:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /items/:id
app.put("/items/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, supplier, price, quantity, code, maletteId } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalide" });
  }
  if (!name || !supplier) {
    return res.status(400).json({ error: "Nom et fournisseur requis" });
  }

  try {
    const result = await pool.query(
      `UPDATE items SET name=$1, supplier=$2, price=$3, quantity=$4, code=$5, maletteId=$6 WHERE id=$7 RETURNING *`,
      [name.trim(), supplier.trim(), price || 0, quantity || 0, code || "", maletteId || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur UPDATE:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /items/:id
app.delete("/items/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const result = await pool.query("DELETE FROM items WHERE id=$1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Erreur DELETE:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- Démarrage du serveur ---
app.listen(port, () => {
  console.log(`Serveur sécurisé lancé sur le port ${port}`);
});
