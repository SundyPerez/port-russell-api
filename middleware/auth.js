const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Le token peut venir des headers Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(" ")[1];

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur correspondant
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Token invalide" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Pas de token, accès refusé" });
  }
};

module.exports = { protect };
