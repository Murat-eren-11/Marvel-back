const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/comics", async (req, res) => {
  try {
    const title = req.query.title;
    const limit = req.query.limit || 100;
    const skip = req.query.skip || 0;

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}&limit=${limit}&skip=${skip}&title=${title}`
    );

    const comics = response.data;

    res.status(200).json(comics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/comic/:comicId", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comic/${req.params.comicId}?apiKey=${process.env.MARVEL_API_KEY}`
    );
    const comicSolo = response.data;
    res.status(200).json(comicSolo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/comics/:characterId", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.characterId}?apiKey=${process.env.MARVEL_API_KEY}`
    );

    const comicCharacter = response.data;
    res.status(200).json(comicCharacter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/characters", async (req, res) => {
  try {
    let name = req.query.name;
    const limit = req.query.limit || 100;
    const skip = req.query.skip || 0;

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.MARVEL_API_KEY}&limit=${limit}&skip=${skip}&name=${name}`
    );

    const characters = response.data;

    res.status(200).json(characters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/character/:characterId", async (req, res) => {
  try {
    const id = req.params.characterId;

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.MARVEL_API_KEY}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
