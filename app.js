require("dotenv").config();
const express = require("express");
const authHandler = require("./middleware/authHandler");
const errorHandler = require("./middleware/errorHandler");
const { tryCatch } = require("./utils/tryCatch");
const { home } = require("./controller/home.controller");
const app = express();

// parse requests of content-type - application/json
app.use(express.json({ limit: "10mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post("/home", authHandler, tryCatch(home));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
