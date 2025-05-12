const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const clientsecret = process.env.SPOTIFY_CLIENT_SECRET;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectURI = process.env.REDIRECT_URI;
router.get("/login", (req, res) => {
  const query = querystring.stringify({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectURI,
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
    redirect_uri: redirectURI,
    client_id: clientId,
    client_secret: clientsecret,
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // Store the access token in memory for use in further requests
    const { access_token, refresh_token, expires_in } = response.data;
    global.spotifyAccessToken = access_token;
    global.spotifyRefreshToken = refresh_token;

    res.send("Login successful! Now you can use the /spotify endpoints.");
  } catch (err) {
    res.status(500).send("Error during token exchange");
  }
});

router.get("/followed-artisits", async (req, res) => {
  const token = global.spotifyAccessToken;
  if (!token) {
    return res.send("Please Login!");
  }
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/following?type=artist",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const artistItems = response.data.artists.items;
    console.log(artistItems);
    const artistNames = artistItems.map((artist) => ({
      name: artist.name,
      genres: artist.genres,
      followers: artist.followers.total,
    }));
    res.send(artistNames);
  } catch (error) {
    res.status(500).send(` Errror: ${error.message}`);
  }
});

//
module.exports = router;
