require("dotenv").config();
const request = require("axios");
const cheerio = require("cheerio");
const Joi = require("joi");
const db = require("../models/db");

exports.home = async (req, res) => {
  const schema = Joi.object({
    kd_user: Joi.string().allow("").optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;
  let result = await home(req.body.kd_user);

  return res.status(200).send(result);
};

async function home(kd_user) {
  const base_url = process.env.BASE_URL_ANIME;
  const { data } = await request.get(base_url + "/anime-terbaru");

  let $ = cheerio.load(data);

  const animes = $('li[itemscope="itemscope"]');

  let urlVideo = [];

  animes.each((index, element) => {
    let a = $(element).find("a");
    let img = $(element).find("img");
    let eps = $(element).find("author").text();

    let temp = eps.match(/^(\d+)([a-zA-Z ]+)$/);

    let content = {
      title: $(a).attr("title"),
      href: $(a).attr("href"),
      img: $(img).attr("src"),
      episode: "Episode " + temp[1],
    };
    urlVideo.push(content);
  });

  let dataHistory = {};

  if (kd_user) {
    let user = await getUser({ kd_user: kd_user });
    let history = await getHistory({ id_user: user.id });

    if (history) {
      let position =
        Math.floor(history.position_duration / 60).toString() +
        ":" +
        Math.floor(history.position_duration % 60).toString();

      let total_duration =
        Math.floor(history.total_duration / 60).toString() +
        ":" +
        Math.floor(history.total_duration % 60).toString();

      history.position = position;
      history.duration = total_duration;
      dataHistory = history;
    }
  }

  return {
    success: true,
    message: "ok",
    history: dataHistory,
    data: urlVideo,
  };
}

async function getUser({ kd_user: kd_user }) {
  return await db.sequelize.query(
    "SELECT * FROM users WHERE kd_user = $kd_user",
    {
      bind: {
        kd_user: kd_user,
      },
      plain: true,
      queryTypes: db.sequelize.QueryTypes.SELECT,
    }
  );
}

async function getHistory({ id_user: id_user }) {
  return await db.sequelize.query(
    "SELECT * FROM tb_history WHERE id_user = $id_user ORDER BY tgl_input DESC",
    {
      bind: {
        id_user: id_user,
      },
      plain: true,
      queryTypes: db.sequelize.QueryTypes.SELECT,
    }
  );
}
