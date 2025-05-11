const express = require("express");
const router = express.Router();
const querystring = require("querystring");
require('dotenv').config();

router.get("/login", (req, res) => {
  const query = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    scope:
      "user-read-playback-state user-modify-playback-state user-read-currently-playing user-top-read user-follow-read streaming",
  });
  res.redirect("https://accounts.spotify.com/authorize?" + query);
  console.log("spotify authorization url and redirect user to spotify login");
});

module.exports = router;
