require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json()); // Pour lire le JSON

// ➤ Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté !"))
  .catch((err) => {
    console.error("❌ Erreur MongoDB :", err);
    process.exit(1);
  });

// ➤ Import des modèles (utile pour tests si besoin)
const Catway = require("../../models/Catway");
const Reservation = require("../../models/Reservation");
const User = require("../../models/User");

// ➤ Servir les fichiers statiques du dossier public
app.use(express.static("public"));

// ➤ Import des routes
const userRoutes = require("../../routes/users");
const catwayRoutes = require("../../routes/catways");
const reservationRoutes = require("../../routes/reservations");

// ➤ Routes API
app.use("/api/users", userRoutes);
app.use("/api/catways", catwayRoutes);

// Réservations imbriquées sous chaque catway
app.use("/api/catways/:catwayId/reservations", reservationRoutes);

// ➤ Routes de test rapide (optionnel)
app.get("/test-catways", async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.get("/test-reservations", async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

app.get("/test-users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

// ➤ Page d'accueil
app.get("/", (req, res) => {
  res.send("Bienvenue sur l’API du Port Russell 🚤");
});

// ➤ Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
