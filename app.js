require("dotenv").config();
const express = require("express");
const authHandler = require("./middleware/authHandler");
const errorHandler = require("./middleware/errorHandler");
const { tryCatch } = require("./utils/tryCatch");
const { home } = require("./controller/home.controller");
const { detailAnime } = require("./controller/detail_anime.controller");
const { sinopsisAnime } = require("./controller/sinopsis_anime.controller");
const { searchAnime } = require("./controller/search_anime.controller");
const { history } = require("./controller/history.controller");
const { loginAuth } = require("./controller/login_auth.controller");
const { cekLogin } = require("./controller/cek_login.controller");
const { insertHistory } = require("./controller/insert_history.controller");
const { jadwalTayang } = require("./controller/jadwal_tayang.controller");

const app = express();

// parse requests of content-type - application/json
app.use(express.json({ limit: "10mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post("/home", authHandler, tryCatch(home));
app.post("/detail-anime", authHandler, tryCatch(detailAnime));
app.post("/sinopsis-anime", authHandler, tryCatch(sinopsisAnime));
app.post("/search-anime", authHandler, tryCatch(searchAnime));
app.post("/history", authHandler, tryCatch(history));
app.post("/login-auth", authHandler, tryCatch(loginAuth));
app.post("/cek-login", authHandler, tryCatch(cekLogin));
app.post("/insert-or-update-history", authHandler, tryCatch(insertHistory));
app.post("/jadwal", authHandler, tryCatch(jadwalTayang));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
