const express = require("express");
const Reservation = require("../models/Reservation");
const auth = require("../middleware/auth");

const router = express.Router();

// protéger toutes les routes
router.use(auth);

// GET /catways/:id/reservations
router.get("/catways/:id/reservations", async (req, res) => {
  const catwayNumber = Number(req.params.id);
  const reservations = await Reservation.find({ catwayNumber });
  res.json(reservations);
});

// GET /catways/:id/reservations/:idReservation
router.get("/catways/:id/reservations/:idReservation", async (req, res) => {
  const reservation = await Reservation.findById(
    req.params.idReservation
  );
  if (!reservation)
    return res.status(404).json({ message: "Réservation introuvable" });
  res.json(reservation);
});

// POST /catways/:id/reservations
router.post("/catways/:id/reservations", async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);
    const { clientName, boatName, startDate, endDate } = req.body;

    const reservation = new Reservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /catways/:id/reservations/:idReservation
router.put("/catways/:id/reservations/:idReservation", async (req, res) => {
  try {
    const updates = { ...req.body, catwayNumber: Number(req.params.id) };
    const updated = await Reservation.findByIdAndUpdate(
      req.params.idReservation,
      updates,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Réservation introuvable" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE /catways/:id/reservations/:idReservation
router.delete("/catways/:id/reservations/:idReservation", async (req, res) => {
  const deleted = await Reservation.findByIdAndDelete(
    req.params.idReservation
  );
  if (!deleted)
    return res.status(404).json({ message: "Réservation introuvable" });
  res.json({ message: "Réservation supprimée" });
});

// Petit extra pratique : GET /reservations/ongoing (pour le tableau de bord)
router.get("/reservations/ongoing", async (req, res) => {
  const today = new Date();
  const reservations = await Reservation.find({
    startDate: { $lte: today },
    endDate: { $gte: today }
  });
  res.json(reservations);
});

module.exports = router;
