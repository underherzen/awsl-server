const { ShortUrl } = require('../../../models');
const urlShortener = require('../../../modules/urlShortener');
const shortener = new urlShortener();

const getFullUrl = async (req, res, next) => {
  const body = req.body;
  console.log(body);
  const fullUrl = await shortener.getFull(body.short_url);
  if (!fullUrl) {
    res.sendStatus(404);
    return;
  }
  res.send({ full_url: fullUrl });
};

module.exports = {
  getFullUrl,
};
