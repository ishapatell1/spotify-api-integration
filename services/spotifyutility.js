const axios = require("axios");
const SPOTIFY_API = "https://api.spotify.com/v1";

function getAuthHeader(token) {
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
}
async function getNowPlaying(token) {
  const res = await axios.get(
    `${SPOTIFY_API}/me/player/currently-playing`,
    getAuthHeader(token)
  );
  return res.data?.item || null;
}
async function getTopTracks(token) {
  const res = await axios.get(
    `${SPOTIFY_API}/me/top/tracks?limit=10&time_range=long_term`,
    getAuthHeader(token)
  );
  return res.data?.items.map((track) => ({
    id: track.id,
    name: track.name,
  }));
}
async function getFollowedArtists(token) {
  const res = await axios.get(
    `${SPOTIFY_API}/me/following?type=artist`,
    getAuthHeader(token)
  );
  return res.data.artists.items.map((artist) => ({
    name: artist.name,
    genres: artist.genres,
  }));
}
async function playTrack(token, trackId) {
  await axios.put(
    `${SPOTIFY_API}/me/player/play`,
    {
      uris: [`spotify:track:${trackId}`],
    },
    getAuthHeader(token)
  );
}
async function pausePlayback(token) {
  await axios.put(`${SPOTIFY_API}/me/player/pause`, {}, getAuthHeader(token));
}
module.exports = {
  getNowPlaying,
  getTopTracks,
  getFollowedArtists,
  playTrack,
  pausePlayback,
};
