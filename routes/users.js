const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// ➤ SIGNUP - création d'un nouvel utilisateur
router.post(
  "/signup",
  [
    body("username").notEmpty().withMessage("Nom d'utilisateur requis"),
    body("email").isEmail().withMessage("Email invalide"),
    body("password").isLength({ min: 6 }).withMessage("Mot de passe minimum 6 caractères"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      // Vérifie si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Création utilisateur
      const user = new User({ username, email, password: hashedPassword });
      await user.save();

      // Création token JWT
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ➤ LOGIN - connexion utilisateur
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invalide"),
    body("password").notEmpty().withMessage("Mot de passe requis"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ➤ LOGOUT - simplement côté frontend : supprimer le token
router.get("/logout", protect, (req, res) => {
  // Comme on utilise JWT, il n’y a pas de session côté serveur
  res.json({ message: "Déconnexion réussie, supprimez votre token côté client" });
});

// ➤ GET - liste de tous les utilisateurs (admin seulement par exemple)
router.get("/", protect, async (req, res) => {
  try {
    // Exemple : si tu veux restreindre aux admins
    // if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const users = await User.find().select("-password"); // Ne pas renvoyer les mots de passe
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
