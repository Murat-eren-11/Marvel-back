const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();
const cookieParser = require("cookie-parser"); // Import du middleware cookie-parser
const axios = require("axios");

const User = require("../models/User");
const Favorite = require("../models/Favorite");

router.use(cookieParser());

router.post("/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(500).json({ message: "Email already exists" });
    }
    if (!req.body.username) {
      return res.status(300).json({ message: "Username required" });
    }

    const salt = uid2(16);
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    const token = uid2(64);

    const newUser = new User({
      email: req.body.email,
      username: req.body.username,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();

    res.cookie("marvel-token", newUser.token, {
      httpOnly: true,
      secure: false,
    });

    res.status(200).json("Compte créé avec succès " + newUser.username);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    const hash = SHA256(req.body.password + userFound.salt).toString(encBase64);
    if (hash !== userFound.hash) {
      return res
        .status(401)
        .json({ message: "Password incorrect or Mail incorrect" });
    }
    res.status(200).json({
      message: "Connecté",
      username: userFound.username,
      token: userFound.token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/favorite", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Extrait le token
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // on verifie d'abord si le favori existe déjà pour éviter les doublons
    const existingFavorite = await Favorite.findOne({
      $or: [
        ...(comicId ? [{ comicId: comicId }] : []),
        ...(characterId ? [{ characterId: characterId }] : []),
      ],
    });
    if (existingFavorite) {
      return res.status(409).json({ message: "Favorite already exists" });
    }

    // on créé un favori avec soit comicId soit characterId, pas les deux
    const favorite = new Favorite({ comicId, characterId });
    await favorite.save();

    user.favorites.push(favorite._id);
    await user.save();

    res.status(200).json({ message: "Favorite added successfully", user });
  } catch (error) {
    console.log("Error adding favorite:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour obtenir les favoris enrichis d'un utilisateur
router.get("/favorite", async (req, res) => {
  try {
    // Remplacez 'userToken' par votre méthode d'authentification
    const userToken = req.cookies["marvel-token"];
    const user = await User.findOne({ token: userToken }).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Pour chaque favori, faites une requête à l'API Marvel pour obtenir les détails
    const favoritesDetails = await Promise.all(
      user.favorites.map(async (favorite) => {
        let apiUrl;
        if (favorite.characterId) {
          apiUrl = `https://lereacteur-marvel-api.herokuapp.com/character/${favorite.characterId}?apiKey=${process.env.MARVEL_API_KEY}`;
        } else if (favorite.comicId) {
          apiUrl = `https://lereacteur-marvel-api.herokuapp.com/comic/${favorite.comicId}?apiKey=${process.env.MARVEL_API_KEY}`;
        }

        const response = await axios.get(apiUrl);
        return response.data; // Assurez-vous que cela correspond à la structure de données que vous attendez
      })
    );

    res.json(favoritesDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user", async (req, res) => {
  const tokenUser = req.cookies["marvel-token"];
  const findUser = await User.findOne({ token: tokenUser });

  if (!findUser) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  const usernameRegex = new RegExp(
    ["tom", "alexis", "lucas", "murat"].join("|"),
    "i"
  ); // "i" pour ignorer la casse

  // Tester le nom d'utilisateur avec la regex, en retirant d'abord les chiffres
  const usernameWithoutDigits = findUser.username.replace(/\d/g, ""); // Supprime tous les chiffres

  if (usernameRegex.test(usernameWithoutDigits)) {
    res.status(200).json({
      message: "Connecté",
      username: findUser.username,
    });
  } else {
    res.status(403).json({ message: "Accès refusé" });
  }
});

module.exports = router;
