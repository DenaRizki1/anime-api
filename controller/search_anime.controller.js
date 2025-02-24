require("dotenv").config();
const Joi = require("joi");
const request = require("axios");
const cheerio = require("cheerio");

const BASE_URL = process.env.BASE_URL_ANIME;

exports.searchAnime = async (req, res) => {
  const schema = Joi.object({
    search: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;
  let result = await searchAnime(req.body.search);
  return res.status(200).send(result);
};

async function searchAnime(search) {
  const { data } = await request.get(BASE_URL + "/?s=" + search);

  const $ = cheerio.load(data);

  let result = $('div[class="animepost"]');

  let response = [];

  result.each((index, element) => {
    let temp = {};
    temp.title = $(element).find("a").attr("title");
    temp.url = $(element).find("a").attr("href");
    temp.img = $(element).find("img").attr("src");
    temp.ratting = $(element).find('div[class="score"]').text().trim();
    temp.status = $(element).find('div[class="type"]').text();
    response.push(temp);
  });

  return {
    success: true,
    message: "ok",
    data: response,
  };
}
