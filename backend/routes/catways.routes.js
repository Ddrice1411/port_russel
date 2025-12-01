const express = require("express");
const Catway = require("../models/Catway");
const auth = require("../middleware/auth");

const router = express.Router();

// protéger toutes les routes
router.use(auth);

// GET /catways
router.get("/catways", async (req, res) => {
  const catways = await Catway.find();
  res.json(catways);
});

// GET /catways/:id (id = catwayNumber)
router.get("/catways/:id", async (req, res) => {
  const catway = await Catway.findOne({ catwayNumber: req.params.id });
  if (!catway)
    return res.status(404).json({ message: "Catway introuvable" });
  res.json(catway);
});

// POST /catways
router.post("/catways", async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const existing = await Catway.findOne({ catwayNumber });
    if (existing)
      return res
        .status(400)
        .json({ message: "Ce numéro de catway existe déjà" });

    const catway = new Catway({ catwayNumber, catwayType, catwayState });
    await catway.save();
    res.status(201).json(catway);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /catways/:id (seule la description de l'état est modifiable)
router.put("/catways/:id", async (req, res) => {
  try {
    const { catwayState } = req.body;

    const catway = await Catway.findOneAndUpdate(
      { catwayNumber: req.params.id },
      { catwayState },
      { new: true }
    );

    if (!catway)
      return res.status(404).json({ message: "Catway introuvable" });

    res.json(catway);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE /catways/:id
router.delete("/catways/:id", async (req, res) => {
  const deleted = await Catway.findOneAndDelete({
    catwayNumber: req.params.id
  });
  if (!deleted)
    return res.status(404).json({ message: "Catway introuvable" });

  res.json({ message: "Catway supprimé" });
});

module.exports = router;
