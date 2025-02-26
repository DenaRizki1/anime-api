const Joi = require("joi");
const { SUCCESS, BAD_REQUEST } = require("../constants/statusCodes");
const db = require("../models/db");

exports.history = async (req, res) => {
  const schema = Joi.object({
    kd_user: Joi.string().required(),
    token_auth: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;

  let result = await history(req.body.kd_user, req.body.token_auth);

  return res.status(SUCCESS).send(result);
};

async function history(kd_user, token_auth) {
  let user = await getUser({ kd_user: kd_user });

  console.log(user);
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
