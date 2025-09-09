const express = require("express");
const router = express.Router();
const Catway = require("../models/Catway");
const { protect } = require("../middleware/auth");

// ➤ Lister tous les catways (tous les utilisateurs peuvent voir)
router.get("/", protect, async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ Récupérer un catway par son ID
router.get("/:id", protect, async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé" });
    res.json(catway);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ Créer un catway (seulement les admins, par exemple)
router.post("/", protect, async (req, res) => {
  try {
    // Optionnel : Vérifier si l'utilisateur est admin
    // if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const { catwayNumber, catwayType, catwayState } = req.body;

    const exist = await Catway.findOne({ catwayNumber });
    if (exist) return res.status(400).json({ message: "Numéro de catway déjà utilisé" });

    const catway = await Catway.create({ catwayNumber, catwayType, catwayState, createdBy: req.user._id });
    res.status(201).json(catway);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ Modifier l'état d'un catway
router.put("/:id", protect, async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé" });

    catway.catwayState = req.body.catwayState || catway.catwayState;
    catway.updatedBy = req.user._id; // Garde la trace de qui modifie
    await catway.save();

    res.json(catway);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ Supprimer un catway
router.delete("/:id", protect, async (req, res) => {
  try {
    const catway = await Catway.findByIdAndDelete(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé" });
    res.json({ message: "Catway supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
