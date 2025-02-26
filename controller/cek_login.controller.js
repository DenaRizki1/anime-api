const Joi = require("joi");
const { SUCCESS, BAD_REQUEST } = require("../constants/statusCodes");
const db = require("../models/db");
const crypto = require("crypto");
const { QueryTypes } = require("sequelize");

exports.cekLogin = async (req, res) => {
  const schema = Joi.object({
    kd_user: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;

  let result = await cekLogin(req.body.kd_user);

  return res.status(SUCCESS).send(result);
};

async function cekLogin(kd_user) {
  console.log(kd_user);
  let login = await getLogin({ kd_user: kd_user });

  if (!login) {
    return {
      success: false,
      message: "Session Expired",
      data: null,
    };
  }

  return {
    success: true,
    message: "Ok",
    datA: null,
  };
}

async function getLogin({ kd_user: kd_user }) {
  return await db.sequelize.query(
    "SELECT * FROM tb_login WHERE kd_user = $kd_user AND trash = $trash",
    {
      bind: {
        kd_user: kd_user,
        trash: "0",
      },
      plain: true,
      QueryTypes: db.sequelize.QueryTypes.SELECT,
    }
  );
}
