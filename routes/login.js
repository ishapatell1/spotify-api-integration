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

//Now Playing API

router.get("/now-playing", async (req, res) => {
  if (!global.spotifyAccessToken) {
    return res.send("Please Login");
  }
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing ",
      {
        headers: {
          Authorization: `Bearer ${global.spotifyAccessToken}`,
        },
      }
    );
    if (!response.data)
      return res.json({ message: "Nothing playing right now!" });
    const track = response.data.item;

    const responsetrack = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
      {
        headers: {
          Authorization: `Bearer ${global.spotifyAccessToken}`,
        },
      }
    );
    const toptracks = responsetrack.data.items.map((track) => ({
      id: track.id,
      track: track.name,
      artists: track.artists.map((a) => a.name),
      preview_url: track.preview_url,
    }));
    res.json({
      name: track.name,
      artists: track.artists.map((a) => a.name),
      album: track.album.name,
      external_url: track.external_urls.spotify,
      top_tracks: toptracks,
    });
  } catch (err) {
    res.status.json("Error Playing", err);
  }
});

module.exports = router;
