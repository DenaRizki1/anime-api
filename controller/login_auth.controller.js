const Joi = require("joi");
const { SUCCESS, BAD_REQUEST } = require("../constants/statusCodes");
const db = require("../models/db");
const crypto = require("crypto");
const { QueryTypes } = require("sequelize");

exports.loginAuth = async (req, res) => {
  const schema = Joi.object({
    display_name: Joi.string().required(),
    login_mode: Joi.string().required(),
    uuid: Joi.string().required(),
    email: Joi.string().required(),
    foto: Joi.string().required(),
    token_notif: Joi.string().required(),
    version: Joi.string().required(),
    version_name: Joi.string().required(),
    device_id: Joi.string().required(),
    device_info: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;

  let result = await loginAuth(
    req.body.display_name,
    req.body.login_mode,
    req.body.uuid,
    req.body.email,
    req.body.foto,
    req.body.token_notif,
    req.body.version,
    req.body.version_name,
    req.body.device_id,
    req.body.device_info
  );

  return res.status(SUCCESS).send(result);
};

async function loginAuth(
  display_name,
  login_mode,
  uuid,
  email,
  foto,
  token_notif,
  version,
  version_name,
  device_id,
  device_info
) {
  let tokenAuth = generateRandomString(20);
  let user = await getUser({ email: email });

  if (user) {
    let login = await cekLogin({ kd_user: user.kd_user });

    if (login) {
      return {
        success: true,
        message: "Berhasil Login 1",
        data: {
          kd_user: user.kd_user,
          token_auth: login.token_auth,
          nama_lengkap: user.nama_lengkap,
          email: user.email,
          foto: user.foto,
        },
      };
    }

    let rs_insert_login = await insertLogin({
      kd_user: user.kd_user,
      token_auth: tokenAuth,
      token_notif: token_notif,
      platform: "android",
      device_id: device_id,
      model: device_info,
      versi_app: version,
    });

    if (!rs_insert_login) {
      return {
        success: false,
        message: "Terjadi Kesalahan",
        data: null,
      };
    }

    return {
      success: true,
      message: "Berhasil Login 2",
      data: {
        kd_user: user.kd_user,
        token_auth: tokenAuth,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        foto: user.foto,
      },
    };
  }
  let kdUser = "USR_" + generateRandomString(20);

  let rs_inser = await insertUser({
    kd_user: kdUser,
    uuid_google: uuid,
    nama_lengkap: display_name,
    email: email,
    foto: foto,
  });

  if (rs_inser == null) {
    return {
      success: false,
      message: "Terjadi Kesalahan",
      data: null,
    };
  }

  let rs_insert_login = await insertLogin({
    kd_user: kdUser,
    token_auth: tokenAuth,
    token_notif: token_notif,
    platform: "android",
    device_id: device_id,
    model: device_info,
    versi_app: version,
  });

  if (rs_insert_login == null) {
    return {
      success: false,
      message: "Terjadi Kesalahan",
      data: null,
    };
  }

  return {
    success: true,
    message: "Berhasil Login 3",
    data: {
      kd_user: kdUser,
      token_auth: tokenAuth,
      nama_lengkap: display_name,
      email: email,
      foto: foto,
    },
  };
}

async function cekLogin({ kd_user: kd_user }) {
  return await db.sequelize.query(
    "SELECT * FROM tb_login WHERE kd_user = $kd_user AND trash = $trash",
    {
      bind: {
        kd_user: kd_user,
        trash: "0",
      },
      plain: true,
      queryTypes: db.sequelize.QueryTypes.SELECT,
    }
  );
}

async function getUser({ email: email }) {
  return await db.sequelize.query("SELECT * FROM users WHERE email = $email", {
    bind: {
      email: email,
    },
    plain: true,
    queryTypes: db.sequelize.QueryTypes.SELECT,
  });
}

async function insertUser({
  kd_user: kd_user,
  uuid_google: uuid_google,
  nama_lengkap: nama_lengkap,
  email: email,
  foto: foto,
}) {
  return await db.sequelize.query(
    "INSERT INTO users (kd_user,uuid_google,nama_lengkap,email,foto,tgl_input) VALUES ($kd_user,$uuid_google,$nama_lengkap,$email,$foto,$tgl_input)",
    {
      bind: {
        kd_user: kd_user,
        uuid_google: uuid_google,
        nama_lengkap: nama_lengkap,
        email: email,
        foto: foto,
        tgl_input: new Date(),
      },
    }
  );
}

async function insertLogin({
  token_auth: token_auth,
  token_notif: token_notif,
  kd_user: kd_user,
  platform: platform,
  device_id: device_id,
  model: model,
  versi_app: versi_app,
}) {
  return await db.sequelize.query(
    "INSERT INTO tb_login (token_auth,token_notif,kd_user,platform,device_id,model,versi_app,tgl_login,trash) VALUES ($token_auth,$token_notif,$kd_user,$platform,$device_id,$model,$versi_app,$tgl_login,$trash)",
    {
      bind: {
        token_auth: token_auth,
        token_notif: token_notif,
        kd_user: kd_user,
        platform: platform,
        device_id: device_id,
        model: model,
        versi_app: versi_app,
        tgl_login: new Date(),
        trash: "0",
      },
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
