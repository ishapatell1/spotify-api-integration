const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

router.get("/login", (req, res) => {
  console.log("SPOTIFY_CLIENT_ID = ", process.env.SPOTIFY_CLIENT_ID);
  const query = querystring.stringify({
    response_type: "code",
    client_id: "e33a66df4a69414b81a0d2a31bd357c2",
    redirect_uri:
      "https://spotify-api-integration-production.up.railway.app/spotify/callback",
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
    redirect_uri:
      "https://spotify-api-integration-production.up.railway.app/spotify/callback",
    client_id: "e33a66df4a69414b81a0d2a31bd357c2",
    client_secret: "99cc83a2aafc46ffb83d550233f8cf5a",
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
          Authorization: `Bearer${token}`,
        },
      }
    );
    const artistItems = response.data.artists.items;
    const artistNames = artistItems.map((artist) => artist.name);
    res.send(artistNames)
  } catch (error) {
    res.status(500).send(" Errror: ", error.message);
  }
});
module.exports = router;
