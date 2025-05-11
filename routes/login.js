const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
  res.send("user login moves to spotify");
  console.log("spotify authorization url and redirect user to spotify login");
});

module.exports = router;
