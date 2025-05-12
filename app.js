require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
app.use(express.json());
const loginRoute = require("./routes/login");
const spotify = require("./routes/spotify");
app.use(
  session({
    secret: process.env.SPOTIFY_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/spotify", loginRoute);
app.use("/spotify", spotify);
app.get("/", (req, res) => {
  res.send("Hello");
});
app.listen(3000, () => {
  console.log("App is running at 3000");
});
