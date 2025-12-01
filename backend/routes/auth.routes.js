const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email et mot de passe requis" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Identifiants invalides" });

    const isValid = await user.comparePassword(password);
    if (!isValid)
      return res.status(401).json({ message: "Identifiants invalides" });

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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

// GET /logout (côté backend c'est symbolique, le frontend supprime le token)
router.get("/logout", (req, res) => {
  res.json({ message: "Déconnecté (supprimez le token côté client)" });
});

module.exports = router;
