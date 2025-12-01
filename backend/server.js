const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const userRoutes = require("./routes/users.routes");
const catwayRoutes = require("./routes/catways.routes");
const reservationRoutes = require("./routes/reservations.routes");

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err.message));

/**
 * ROUTE /login DIRECTEMENT DANS server.js
 * POST /login
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Requête /login reçue avec :", email);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email et mot de passe requis" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Utilisateur introuvable");
      return res
        .status(401)
        .json({ message: "Identifiants invalides" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("Mot de passe incorrect");
      return res
        .status(401)
        .json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Connexion OK pour", email);

    res.json({
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Routes pour users / catways / reservations
app.use(userRoutes);
app.use(catwayRoutes);
app.use(reservationRoutes);

// Frontend statique
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(frontendPath, "docs.html"));
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
