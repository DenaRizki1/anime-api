require("dotenv").config();
const Joi = require("joi");
const request = require("axios");
const cheerio = require("cheerio");

exports.sinopsisAnime = async (req, res) => {
  const schema = Joi.object({
    url: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;
  let result = await sinopsisAnime(req.body.url);
  return res.status(200).send(result);
};

async function sinopsisAnime(url) {
  const { data } = await request.get(url);

  const $ = cheerio.load(data);

  let response = {};

  let images = $('img[class="anmsa"]').attr("src");

  response.img = images;

  let descs = $('div[itemprop="description"]');

  let desc = "";

  descs.each((index, element) => {
    desc += $(element).find("p").text();
  });

  response.desc = desc;
  let genres = [];
  $(".genre-info a").each((index, element) => {
    const genreText = $(element).text().trim();
    if (genreText) {
      genres.push(genreText);
    }
  });

  response.list_genre = genres;

  response.ratting = $('span[itemprop="ratingValue"]').text() ?? "0";

  let list_eps = [];

  let eps = $('div[class="epsright"]');

  eps.each((index, element) => {
    list_eps.push({
      eps: $(element).find("a").text(),
      url: $(element).find("a").attr("href"),
    });
  });

  response.list_eps = list_eps;

  return {
    success: true,
    message: "Ok",
    data: response,
  };
}
