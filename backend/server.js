require("dotenv").config();
// Database connection
require("./database");

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5500;

const routes = require("./routes");

app.use(express.json({ limit: "30mb" }));

app.use(cookieParser());
const corsOption = {
  credentials: true,
  origin: ["http://localhost:3000"],
};
app.use(cors(corsOption));
app.use("/storage", express.static("storage"));

app.use(routes);
app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.listen(port, () => console.log(`server is listening on ${port}`));
