// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Import du modèle User
const User = require('./models/User');

// Import des autres routes
const userRoutes = require("./routes/users.routes");
const catwayRoutes = require("./routes/catways.routes");
const reservationRoutes = require("./routes/reservations.routes");

// Création de l'app Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion MongoDB
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/port_russell";

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err.message));

// =========================
// ROUTE LOGIN SANS BCRYPT
// =========================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Comparaison simple sans bcrypt
    if (password !== user.password) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =========================
// ROUTES API
// =========================

app.use(userRoutes);
app.use(catwayRoutes);
app.use(reservationRoutes);

// =========================
// SERVIR LE FRONTEND
// =========================

const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(frontendPath, "docs.html"));
});

// =========================
// ROUTE 404 PAR DÉFAUT
// =========================

app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// =========================
// DÉMARRAGE SERVEUR
// =========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
