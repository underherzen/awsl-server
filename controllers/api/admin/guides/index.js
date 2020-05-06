const { Guide } = require('../../../../models');

const loadGuides = async (req, res, next) => {
  try {
    const guides = await Guide.findAll();
    res.send({ guides });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  loadGuides,
};
