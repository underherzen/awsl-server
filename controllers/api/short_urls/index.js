const urlShortener = require('../../../modules/urlShortener');
const shortener = new urlShortener();

const getFullUrl = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(body);
    const fullUrl = await shortener.getFull(body.short_url);
    if (!fullUrl) {
      res.sendStatus(404);
      return;
    }
    res.send({ full_url: fullUrl });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getFullUrl,
};
