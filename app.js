require("dotenv").config();
const express = require("express");

const app = express();

const session = require("express-session");
const cors = require("cors");
app.use(cors());
app.use(express.json());
const loginRoute = require("./routes/login");
const spotify = require("./routes/spotify");

app.use(
  session({
    secret: "e33a66df4a69414b81a0d2a31bd357c2",
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
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
