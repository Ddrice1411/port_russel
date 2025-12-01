const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * ROUTE PUBLIQUE : création d'un utilisateur
 * POST /users
 */
router.post("/users", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email et password sont requis" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Cet email est déjà utilisé" });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * À partir d'ici, toutes les routes /users demandent un token
 */
router.use(auth);

// GET /users
router.get("/users", async (req, res) => {
  const users = await User.find({}, "-password");
  res.json(users);
});

// GET /users/:email
router.get("/users/:email", async (req, res) => {
  const user = await User.findOne(
    { email: req.params.email },
    "-password"
  );
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }
  res.json(user);
});

// PUT /users/:email
router.put("/users/:email", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;

    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (updates.password) {
      user.password = updates.password; // sera hashé par le pre("save")
      delete updates.password;
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE /users/:email
router.delete("/users/:email", async (req, res) => {
  const deleted = await User.findOneAndDelete({ email: req.params.email });
  if (!deleted) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }
  res.json({ message: "Utilisateur supprimé" });
});

module.exports = router;