const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  token: String,
  hash: String,
  salt: String,
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Favorite", // Référence le modèle Favorite
    },
  ],
});

module.exports = User;
