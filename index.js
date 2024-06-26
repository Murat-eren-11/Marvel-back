const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "https://spider-murat.netlify.app",
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  res.status(200).json({ message: "C'est l'API Marvel de Murat !" });
});

const routeMarvel = require("./routes/marvel");
app.use(routeMarvel);

const routeUser = require("./routes/user");
app.use(routeUser);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "Ici se trouve la batcave, c'est pas chez Marvel, il n'y a rien",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Le serveur démarreeeeeeeeeeeeeeeeeeeeeeeeee");
});
