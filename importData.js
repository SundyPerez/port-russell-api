require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import des modèles
const Catway = require("./models/Catway");
const Reservation = require("./models/Reservation");
const User = require("./models/User");

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté !"))
  .catch((err) => {
    console.error("❌ Erreur MongoDB :", err);
    process.exit(1);
  });

const importData = async () => {
  try {
    // Nettoyer les anciennes données
    await Catway.deleteMany();
    await Reservation.deleteMany();
    await User.deleteMany();
    console.log("🗑️ Anciennes données supprimées");

    // Import des Catways
    const catwaysFile = path.join(__dirname, "catways.json");
    const catwaysData = JSON.parse(fs.readFileSync(catwaysFile, "utf-8"));
    const insertedCatways = await Catway.insertMany(catwaysData);
    console.log(`✅ ${insertedCatways.length} catways importés`);

    // Import des Reservations (on mappe le catwayNumber → ObjectId)
    const reservationsFile = path.join(__dirname, "reservations.json");
    const reservationsData = JSON.parse(
      fs.readFileSync(reservationsFile, "utf-8")
    );

    const reservationsWithRefs = reservationsData.map((r) => {
      const catway = insertedCatways.find(
        (c) => c.catwayNumber === r.catwayNumber
      );
      if (!catway) {
        console.warn(
          `⚠️ Aucun catway trouvé pour le numéro ${r.catwayNumber}, réservation ignorée`
        );
        return null;
      }
      return {
        catway: catway._id,
        clientName: r.clientName,
        boatName: r.boatName,
        startDate: r.startDate,
        endDate: r.endDate,
      };
    });

    const validReservations = reservationsWithRefs.filter((r) => r !== null);
    const insertedReservations = await Reservation.insertMany(validReservations);
    console.log(`✅ ${insertedReservations.length} réservations importées`);

    // Import d’un utilisateur admin
    await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "admin123", // ⚠️ À changer ensuite (hashé dans tes routes user)
    });
    console.log("✅ Utilisateur admin importé");

    // Déconnexion
    mongoose.disconnect();
    console.log("🎉 Import terminé avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l'import :", err);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Lancer l'import
importData();
