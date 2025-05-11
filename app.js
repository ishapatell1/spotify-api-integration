const express = require("express");
const app = express();
const loginRoute = require("./routes/login");
app.use("/spotify", loginRoute)
app.get("/", (req, res) => {
  res.send("Hello");
});
app.listen(3000, () => {
  console.log("App is running at 3000");
});
