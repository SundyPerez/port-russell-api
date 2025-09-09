require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
    });
    console.log("✅ Connexion MongoDB OK !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connexion MongoDB échouée :", err.message);
    process.exit(1);
  }
}

testConnection();
