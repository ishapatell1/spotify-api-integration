const express = require("express");
const router = express.Router();
const {
  getNowPlaying,
  getTopTracks,
  getFollowedArtists,
  playTrack,
  pausePlayback,
} = require("../services/spotifyutility");
router.get("/", async (req, res) => {
  const token = req.session?.spotifyAccessToken;

  if (!token)
    return res
      .status(401)
      .json({ error: "Please login via /spotify/login first." });

  const action = req.query.action;
  const trackId = req.query.trackId;

  try {
    if (action === "pause") {
      await pausePlayback(token);
      return res.json({ message: "Playback paused" });
    } else if (action === "play" && trackId) {
      await playTrack(token, trackId);
      return res.json({ message: `Track ${trackId} is now playing` });
    }

    const [nowPlaying, topTracks, artists] = await Promise.all([
      getNowPlaying(token),
      getTopTracks(token),
      getFollowedArtists(token),
    ]);

    return res.json({
      now_playing: nowPlaying
        ? {
            name: nowPlaying.name,
            artists: nowPlaying.artists.map((a) => a.name),
            album: nowPlaying.album.name,
            url: nowPlaying.external_urls.spotify,
          }
        : "Nothing is playing",
      top_tracks: topTracks,
      followed_artists: artists,
    });
  } catch (err) {
    console.error("Spotify error:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
});

module.exports = router;
