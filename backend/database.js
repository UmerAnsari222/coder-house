const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("database connection established");
  })
  .catch(() => {
    console.log("database connection error");
  });
