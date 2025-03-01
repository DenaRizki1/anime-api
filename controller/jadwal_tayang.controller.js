require("dotenv").config();
const Joi = require("joi");
const axios = require("axios");

exports.jadwalTayang = async (req, res) => {
  const schema = Joi.object({
    kd_user: Joi.string().allow("").optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;
  let result = await jadwalTayang(req.body.kd_user);

  return res.status(200).send(result);
};

async function jadwalTayang() {
  let urls =
    "https://samehadaku.mba/wp-json/custom/v1/all-schedule?perpage=20&type=schtml&day=";

  let days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  let jadwal = [];

  for (const e of days) {
    try {
      const { data } = await axios.get(urls + e);
      jadwal.push({ day: e, data: data });
    } catch (error) {
      console.error(`Error fetching data for ${e}:`, error);
    }
  }

  return {
    success: true,
    message: "Ok",
    data: jadwal,
  };
}
