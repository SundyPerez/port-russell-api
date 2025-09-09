require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const Catway = require('./models/Catway');
const Reservation = require('./models/Reservation');
const User = require('./models/User');

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté !'))
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
  });

// Fichiers JSON
const catwaysFile = path.join(__dirname, 'catways.json');
const reservationsFile = path.join(__dirname, 'reservations.json');

const importAll = async () => {
  try {
    // 1️⃣ Supprimer les anciennes données
    await Catway.deleteMany();
    await User.deleteMany();
    await Reservation.deleteMany();
    console.log('🗑️ Anciennes données supprimées');

    // 2️⃣ Importer les catways
    const catwaysData = JSON.parse(fs.readFileSync(catwaysFile, 'utf-8'));
    const catways = await Catway.insertMany(catwaysData);
    console.log(`✅ ${catways.length} catways importés`);

    // 3️⃣ Importer / créer les utilisateurs pour les réservations
    const reservationsData = JSON.parse(fs.readFileSync(reservationsFile, 'utf-8'));
    const usersMap = {}; // clientName -> user ObjectId

    for (const resData of reservationsData) {
      if (!usersMap[resData.clientName]) {
        // Vérifier si utilisateur existe déjà
        let user = await User.findOne({ username: resData.clientName });
        if (!user) {
          user = await User.create({
            username: resData.clientName,
            email: resData.clientName.toLowerCase().replace(/\s/g, '') + '@example.com',
            password: 'password123'
          });
        }
        usersMap[resData.clientName] = user._id;
      }
    }

    // 4️⃣ Importer les réservations
    for (const resData of reservationsData) {
      const catway = await Catway.findOne({ catwayNumber: resData.catwayNumber });
      if (!catway) {
        console.log(`⚠️ Catway ${resData.catwayNumber} introuvable, réservation ignorée`);
        continue;
      }

      await Reservation.create({
        user: usersMap[resData.clientName],
        catway: catway._id,
        boatName: resData.boatName,
        startDate: new Date(resData.startDate),
        endDate: new Date(resData.endDate)
      });

      console.log(`✅ Réservation pour ${resData.clientName} importée`);
    }

    console.log('🎉 Import complet terminé !');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erreur lors de l\'import :', err);
    mongoose.disconnect();
  }
};

importAll();
