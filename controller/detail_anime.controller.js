require("dotenv").config();
const Joi = require("joi");
const request = require("axios");
const cheerio = require("cheerio");

const url_480 = process.env.BASE_URL_480P;
const url_720 = process.env.BASE_URL_720P;
const url_1080 = process.env.BASE_URL_1080P;

exports.detailAnime = async (req, res) => {
  const schema = Joi.object({
    url: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw error;
  let result = await detailAnime(req.body.url);
  return res.status(200).send(result);
};

async function detailAnime(url) {
  try {
    const { data } = await request.get(url);

    let $ = cheerio.load(data);

    let playVid = $("a[data-wpel-link='external']");

    let dataVideo = {};
    let tempData = {};

    playVid.each((index, element) => {
      if ($(element).attr("href").includes("mediafire")) {
        let temp = $(element).attr("href").split("/");

        if ($(element).attr("href").includes("480p-SAMEHADAKU")) {
          tempData.url_vid_480 =
            url_480 + temp[temp.length - 2].replaceAll(".rar", ".mp4");
        } else if ($(element).attr("href").includes("720p-SAMEHADAKU")) {
          tempData.url_vid_720 =
            url_720 +
            temp[temp.length - 2]
              .replaceAll(".rar", ".mp4")
              .replaceAll("720p", "MP4HD");
        } else if ($(element).attr("href").includes("1080p-SAMEHADAKU")) {
          tempData.url_vid_1080 =
            url_1080 +
            temp[temp.length - 2]
              .replaceAll(".rar", ".mp4")
              .replaceAll("1080p", "FULLHD");
        }
      }
    });
    dataVideo.url_video = tempData;

    // const filteredData = urlPlayVid.filter(
    //   (item) => Object.keys(item).length > 0
    // );

    const eps = $('div[class="epsleft"]');

    let list_eps = [];

    eps.each((index, element) => {
      let tempData = {};

      tempData.eps = $(element)
        .find("a")
        .attr("href")
        .split("episode-")[1]
        .replaceAll("/", "");
      tempData.url = $(element).find("a").attr("href");
      list_eps.push(tempData);
    });

    list_eps.sort((a, b) => {
      return parseInt(a.eps) - parseInt(b.eps);
    });

    dataVideo.list_eps = list_eps;

    return {
      success: true,
      data: dataVideo,
    };

    const desc = $('div[itemprop="description"]');

    // let detail = {};

    // let urlEps = [];

    // let description = "";

    // desc.each((index, element) => {
    //   description += $(element).find("p").text();
    // });

    // video.each((index, element) => {
    //   let a = $(element).find("a").attr("href");

    //   urlEps.push({
    //     episode: a.split("episode-")[1].replaceAll("/", ""),
    //     url: a,
    //   });
    // });
    // detail.img = $('img[fetchpriority="high"]').attr("src");
    // detail.description = description;
    // detail.eps = urlEps;

    // return {
    //   success: true,
    //   message: "ok",
    //   data: detail,
    // };
  } catch (error) {
    console.log(error);
  }
}
