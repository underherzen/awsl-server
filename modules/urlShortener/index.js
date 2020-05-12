const { ShortUrl } = require('../../models');

class urlShortener {
  constructor() {}

  genRandomString(length) {
    let shortStr = '';
    for (let i = 0; i < length; i++) {
      let code = Math.floor(Math.random() * 62);
      if (code < 10) {
        code = code + 48;
      } else if (code < 36) {
        code = code + 55;
      } else {
        code = code + 61;
      }
      shortStr = shortStr + String.fromCharCode(code);
    }
    return shortStr;
  }

  async createShort(full, userId) {
    let shortStr;
    shortStr = this.genRandomString(7);
    const base = process.env.BASE_URL ? process.env.BASE_URL : 'goliveitup.com';
    const host =
      base.indexOf('dev') > -1 ? 'dev.goliveitup.com' : base.indexOf('goliveitup') > -1 ? 'goliveitup.com' : base;
    let doNext = true;
    while (doNext) {
      const existingShortUrl = await ShortUrl.findOne({
        where: { short_url: shortStr },
      });
      if (!existingShortUrl) {
        doNext = false;
      } else {
        shortStr = this.genRandomString(7);
      }
    }
    await ShortUrl.create({
      user_id: userId,
      short_url: shortStr,
      full_url: full,
    });
    return host + '/?z=' + shortStr;
  }

  async getFull(short) {
    const entity = await ShortUrl.findOne({ where: { short_url: short } });
    return entity.full_url;
  }
}

module.exports = urlShortener;
