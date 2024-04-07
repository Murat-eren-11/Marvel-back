const mongoose = require("mongoose");

const Favorite = mongoose.model("Favorite", {
  comicId: {
    type: String,
    required: function () {
      return !this.characterId;
    },
  },
  characterId: {
    type: String,
    required: function () {
      return !this.comicId;
    },
  },
});

module.exports = Favorite;
