const mongoose = require("mongoose");

const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    catwayType: {
      type: String,
      enum: ["long", "short"], // uniquement long ou short
      required: true,
    },
    catwayState: {
      type: String,
      default: "Disponible",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Catway", catwaySchema);
