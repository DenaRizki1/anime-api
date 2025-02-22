require("dotenv").config();
const request = require("axios");
const cheerio = require("cheerio");

exports.home = async (req, res) => {
  let result = await home();

  return res.status(200).send(result);
};

async function home() {
  const base_url = process.env.BASE_URL_ANIME;
  const { data } = await request.get(base_url);

  let $ = cheerio.load(data);

  const animes = $('div[class="thumb"]');

  let urlVideo = [];

  animes.each((index, element) => {
    let a = $(element).find("a");
    let img = $(element).find("img");

    let content = {
      title: $(a).attr("title"),
      href: $(a).attr("href"),
      img: $(img).attr("src"),
      episode: "Episode" + $(a).attr("title").split("Episode")[1],
    };
    urlVideo.push(content);
  });

  return urlVideo;
}

async function getRating(anime) {
  const { data } = await request.get(anime);

  let $ = cheerio.load(data);

  let ratting = $('span[itemprop="ratingValue"]').text();
  return ratting;
}
