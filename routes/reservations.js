const express = require("express");
const router = express.Router({ mergeParams: true });
const Reservation = require("../models/Reservation");
const Catway = require("../models/Catway");
const { protect } = require("../middleware/auth");

// ➤ Lister toutes les réservations d’un catway
router.get("/", protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ catway: req.params.catwayId }).populate("catway").populate("user");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➤ Récupérer une réservation spécifique
router.get("/:reservationId", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ 
      _id: req.params.reservationId, 
      catway: req.params.catwayId 
    }).populate("catway").populate("user");

    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➤ Créer une réservation pour un catway
router.post("/", protect, async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.catwayId);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé" });

    const { clientName, boatName, startDate, endDate } = req.body;
    const reservation = new Reservation({
      catway: catway._id,
      clientName,
      boatName,
      startDate,
      endDate,
      user: req.user._id // On utilise l’utilisateur connecté
    });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ➤ Modifier une réservation
router.put("/:reservationId", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.reservationId, catway: req.params.catwayId });
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });

    const { clientName, boatName, startDate, endDate } = req.body;
    if (clientName) reservation.clientName = clientName;
    if (boatName) reservation.boatName = boatName;
    if (startDate) reservation.startDate = startDate;
    if (endDate) reservation.endDate = endDate;

    reservation.updatedBy = req.user._id; // Garde la trace de l’utilisateur
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ➤ Supprimer une réservation
router.delete("/:reservationId", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({ _id: req.params.reservationId, catway: req.params.catwayId });
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
