require("dotenv").config();
const request = require("axios");
const cheerio = require("cheerio");
const Joi = require("joi");
const db = require("../models/db");
const crypto = require("crypto");
const { QueryTypes } = require("sequelize");

exports.insertHistory = async (req, res) => {
  const schema = Joi.object({
    kd_user: Joi.string().required(),
    judul_anime: Joi.string().required(),
    url_anime: Joi.string().required(),
    url_image: Joi.string().required(),
    position_duration: Joi.string().required(),
    episode: Joi.string().required(),
    total_duration: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;
  let result = await insertHistory(
    req.body.kd_user,
    req.body.judul_anime,
    req.body.url_anime,
    req.body.url_image,
    req.body.position_duration,
    req.body.episode,
    req.body.total_duration
  );

  return res.status(200).send(result);
};

async function insertHistory(
  kd_user,
  judul_anime,
  url_anime,
  url_image,
  position_duration,
  episode,
  total_duration
) {
  console.log(total_duration);
  let user = await getUser({ kd_user: kd_user });

  if (!user) {
    return {
      success: false,
      message: "User tidak ditemukan",
      data: null,
    };
  }

  let history = await getHistory({
    judul_anime: judul_anime,
    episode: episode,
  });

  console.log(history);

  if (!history) {
    console.log({
      kd_history: "HST_" + generateRandomString(20),
      id_user: user.id,
      episode: episode,
      judul_anime: judul_anime,
      position_duration: position_duration,
      total_duration: total_duration,
      url_anime: url_anime,
      url_image: url_image,
    });
    let insert = await insertTbHistory({
      kd_history: "HST_" + generateRandomString(20),
      id_user: user.id,
      episode: episode,
      judul_anime: judul_anime,
      position_duration: position_duration,
      total_duration: total_duration,
      url_anime: url_anime,
      url_image: url_image,
    });

    if (!insert) {
      return {
        success: false,
        message: "gagal",
        data: null,
      };
    }
    return {
      success: true,
      message: "Berhasil menyimpan history",
      data: null,
    };
  } else {
    let update = await updateHistory({
      position_duration: position_duration,
      kd_history: history.kd_history,
    });

    if (!update) {
      return {
        success: false,
        message: "Terjadi Kesalahan",
        data: null,
      };
    }

    return {
      success: true,
      message: "Berhasil menyimpan history",
      data: null,
    };
  }
}

async function getUser({ kd_user: kd_user }) {
  return await db.sequelize.query(
    "SELECT * FROM users WHERE kd_user = $kd_user",
    {
      bind: {
        kd_user: kd_user,
      },
      plain: true,
      QueryTypes: db.sequelize.QueryTypes.SELECT,
    }
  );
}

async function getHistory({ judul_anime: judul_anime, episode: episode }) {
  return await db.sequelize.query(
    "SELECT * FROM tb_history WHERE judul_anime = $judul_anime AND episode = $episode",
    {
      bind: {
        judul_anime: judul_anime,
        episode: episode,
      },
      plain: true,
      QueryTypes: db.sequelize.QueryTypes.SELECT,
    }
  );
}

async function updateHistory({
  position_duration: position_duration,
  kd_history: kd_history,
}) {
  console.log("update");
  return await db.sequelize.query(
    "UPDATE tb_history SET position_duration = $position_duration, tgl_input = $tgl_input, tgl_update = $tgl_update WHERE kd_history = $kd_history",
    {
      bind: {
        position_duration: position_duration,
        tgl_input: new Date(),
        tgl_update: new Date(),
        kd_history: kd_history,
      },
      QueryTypes: db.sequelize.QueryTypes.UPDATE,
    }
  );
}

async function insertTbHistory({
  kd_history: kd_history,
  id_user: id_user,
  judul_anime: judul_anime,
  url_anime: url_anime,
  url_image: url_image,
  position_duration: position_duration,
  episode: episode,
  total_duration: total_duration,
}) {
  console.log("message");
  return await db.sequelize.query(
    "INSERT INTO tb_history (kd_history,id_user,judul_anime,url_anime,url_image,position_duration,episode,total_duration,tgl_input) VALUES ($kd_history,$id_user,$judul_anime,$url_anime,$url_image,$position_duration,$episode,$total_duration,$tgl_input)",
    {
      bind: {
        kd_history: kd_history,
        id_user: id_user,
        judul_anime: judul_anime,
        url_anime: url_anime,
        url_image: url_image,
        position_duration: position_duration,
        episode: episode,
        total_duration: total_duration,
        tgl_input: new Date(),
      },
      QueryTypes: db.sequelize.QueryTypes.UPDATE,
    }
  );
}

function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // Only letters
  let result = "";

  // Generate random bytes and map them to characters
  for (let i = 0; i < length; i++) {
    const randomByte = crypto.randomBytes(1)[0]; // Get one random byte
    result += characters[randomByte % characters.length]; // Map to the characters
  }

  return result;
}
