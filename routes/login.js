const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
require("dotenv").config();
console.log(process.env.SPOTIFY_CLIENT_ID);
router.get("/login", (req, res) => {
  const query = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    scope:
      "user-read-playback-state user-modify-playback-state user-read-currently-playing user-top-read user-follow-read streaming",
  });
  res.redirect("https://accounts.spotify.com/authorize?" + query);
});
router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const body = querystring.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = response.data;
    // Store the access token in memory for use in further requests
    global.spotifyAccessToken = access_token;

    res.send("Login successful! Now you can use the /spotify endpoints.");
  } catch (err) {
    res.status(500).send("Error during token exchange");
  }
});

module.exports = router;
